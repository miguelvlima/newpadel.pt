// Totem LED 480×1080 — carregamento próprio (não altera index.js / ui.js).
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  parseFormat,
  isSetConcluded,
  tennisPoint,
  isNormalTBActive,
  superTBActive,
  countWonSets,
} from './rules.js';

const DEMO_PHOTOS = {
  'Nuno Miguel Lopes': '/images/tournaments/ouricos-players/nuno-lopes.png',
  'Nuno Lopes': '/images/tournaments/ouricos-players/nuno-lopes.png',
  'Afonso Craveiro': '/images/tournaments/ouricos-players/afonso-craveiro.png',
  'Gustavo de Sales': '/images/tournaments/ouricos-players/gustavo-de-sales.png',
  'Eduardo Costa': '/images/tournaments/ouricos-players/eduardo-costa.png',
};

const FALLBACK_PHOTO = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || '?')}&background=1a222d&color=22c55e&size=400&bold=true`;

const SET_LABELS = ['1º', '2º', '3º'];

function $(id) {
  return document.getElementById(id);
}

function escapeHtml(s = '') {
  return String(s).replace(/[&<>"']/g, (m) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]),
  );
}

function shortName(full) {
  const parts = String(full || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 2) return full;
  return `${parts[0]} ${parts[parts.length - 1]}`;
}

function photoFor(name) {
  return DEMO_PHOTOS[name] || FALLBACK_PHOTO(name);
}

function renderPhotos(el, names, serverIndexes) {
  if (!el) return;
  el.innerHTML = names
    .map((name, i) => {
      const serving = serverIndexes.includes(i + 1) ? ' is-serving' : '';
      return `<figure class="totem-photo${serving}">
        <img src="${escapeHtml(photoFor(name))}" alt="${escapeHtml(name)}" loading="eager" />
        <figcaption class="totem-photo-label">${escapeHtml(shortName(name))}</figcaption>
      </figure>`;
    })
    .join('');
}

function computeDisplay(game) {
  const cfg = parseFormat(game.format);
  const score = game.score || {};
  const sets = Array.isArray(score.sets) ? score.sets.slice(0, 3) : [];
  const cur = score.current || {};
  const [w1, w2] = countWonSets(sets, cfg);
  const matchOver = w1 >= cfg.setsToWinMatch || w2 >= cfg.setsToWinMatch;
  const concluded = [0, 1, 2].map((i) => isSetConcluded(sets[i], cfg, i));
  const normalTB = isNormalTBActive(cur, cfg);
  const superTB = superTBActive(sets, cfg, matchOver);

  const columns = [];

  for (let i = 0; i < sets.length; i++) {
    const s = sets[i];
    if (!s) continue;
    const a = Number(s.team1 ?? 0);
    const b = Number(s.team2 ?? 0);
    const done = concluded[i];
    columns.push({
      label: SET_LABELS[i] || `${i + 1}º`,
      a,
      b,
      wonA: done && a > b,
      wonB: done && b > a,
      live: !done && !matchOver,
    });
  }

  // Set em curso ainda não está em `sets` → coluna com games actuais.
  if (!matchOver && !normalTB && !superTB) {
    const liveA = Number(cur.games_team1 || 0);
    const liveB = Number(cur.games_team2 || 0);
    const last = columns[columns.length - 1];
    const lastAlreadyLive =
      last &&
      last.live &&
      last.a === liveA &&
      last.b === liveB;
    if (!lastAlreadyLive) {
      columns.push({
        label: SET_LABELS[columns.length] || `${columns.length + 1}º`,
        a: liveA,
        b: liveB,
        wonA: false,
        wonB: false,
        live: true,
      });
    }
  }

  // Limitar a 3 colunas de set.
  while (columns.length > 3) columns.pop();

  let pointsA = '—';
  let pointsB = '—';
  let pointsLabel = 'Pontos';
  let pointsFinal = false;

  if (matchOver) {
    pointsA = String(w1);
    pointsB = String(w2);
    pointsLabel = 'Sets';
    pointsFinal = true;
  } else if (superTB || normalTB) {
    pointsA = String(Number(cur.tb_team1 || 0));
    pointsB = String(Number(cur.tb_team2 || 0));
    pointsLabel = superTB ? 'Super TB' : 'Tie-break';
  } else {
    pointsA = String(tennisPoint(Number(cur.points_team1 || 0), cfg.isGP));
    pointsB = String(tennisPoint(Number(cur.points_team2 || 0), cfg.isGP));
    pointsLabel = 'Pontos';
  }

  return { columns, pointsA, pointsB, pointsLabel, pointsFinal, matchOver };
}

function renderScoreBoard(el, display) {
  if (!el) return;
  const { columns, pointsA, pointsB, pointsFinal } = display;

  const headSets = columns
    .map(
      (col) =>
        `<th class="col-set${col.live ? ' is-live' : ''}">${escapeHtml(col.label)}</th>`,
    )
    .join('');

  const rowSets = (side) =>
    columns
      .map((col) => {
        const val = side === 'a' ? col.a : col.b;
        const won = side === 'a' ? col.wonA : col.wonB;
        const cls = [
          'set-val',
          won ? 'is-won' : '',
          col.live ? 'is-live' : '',
          val === '' || val == null ? 'is-empty' : '',
        ]
          .filter(Boolean)
          .join(' ');
        return `<td class="col-set"><span class="${cls}">${escapeHtml(String(val))}</span></td>`;
      })
      .join('');

  const ptsCls = `pts-val${pointsFinal ? ' is-final' : ''}`;

  el.innerHTML = `
    <table class="totem-score-table">
      <thead>
        <tr>
          ${headSets}
          <th class="col-pts">Pts</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          ${rowSets('a')}
          <td class="col-pts"><span class="${ptsCls}">${escapeHtml(pointsA)}</span></td>
        </tr>
        <tr>
          ${rowSets('b')}
          <td class="col-pts"><span class="${ptsCls}">${escapeHtml(pointsB)}</span></td>
        </tr>
      </tbody>
    </table>
  `;
}

function paint(game, courtName, screenKey = '') {
  const p1 = game.player1 || 'TBD';
  const p2 = game.player2 || 'TBD';
  const p3 = game.player3 || 'TBD';
  const p4 = game.player4 || 'TBD';
  const server = Number(game.server) || 0;

  const raw = String(courtName || screenKey || '').trim();
  const court = raw.replace(/^campo\s+/i, '').toUpperCase() || '—';
  $('totem-court').textContent = `CAMPO ${court}`;
  $('totem-meta').textContent = 'M2 · Grupo A';

  const serveA = server === 1 || server === 2 ? [server] : [];
  const serveB = server === 3 || server === 4 ? [server - 2] : [];
  renderPhotos($('photos-a'), [p1, p2], serveA);
  renderPhotos($('photos-b'), [p3, p4], serveB);

  const d = computeDisplay(game);
  renderScoreBoard($('totem-score-board'), d);
  const label = $('totem-points-label');
  if (label) label.textContent = d.pointsLabel;
  $('totem-status').textContent = d.matchOver ? 'Jogo terminado' : 'Marcação ao vivo';
}

async function fetchGame(sb, gameId) {
  const { data, error } = await sb
    .from('games')
    .select('id,player1,player2,player3,player4,format,score,server,court_id,tournament_match_id,start_at')
    .eq('id', gameId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function fetchCourtName(sb, courtId) {
  if (!courtId) return null;
  const { data } = await sb.from('courts').select('name').eq('id', courtId).maybeSingle();
  return data?.name || null;
}

(async () => {
  const root = $('totem');
  if (!root) return;

  const url = root.dataset.sbUrl || '';
  const anon = root.dataset.sbAnon || '';
  const demoGameId = root.dataset.demoGameId || '';
  const screenKey = root.dataset.screen || 'default';

  try {
    if (!/^https:\/\/.+\.supabase\.co/i.test(url)) throw new Error('SUPABASE_URL inválida');
    const sb = createClient(url, anon, { realtime: { params: { eventsPerSecond: 5 } } });

    let game = demoGameId ? await fetchGame(sb, demoGameId) : null;

    const { data: board } = await sb
      .from('scoreboards')
      .select('id,key,title')
      .eq('key', screenKey)
      .maybeSingle();

    if (board?.id) {
      const { data: sel } = await sb
        .from('scoreboard_selections')
        .select('game_id')
        .eq('scoreboard_id', board.id)
        .order('position', { ascending: true })
        .limit(1)
        .maybeSingle();
      if (sel?.game_id) {
        const selected = await fetchGame(sb, sel.game_id);
        if (selected) game = selected;
      }
    }

    if (!game) throw new Error('Jogo não encontrado');

    const courtName = (await fetchCourtName(sb, game.court_id)) || screenKey;
    paint(game, courtName, screenKey);

    sb.channel(`totem-game-${game.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'games', filter: `id=eq.${game.id}` },
        (payload) => {
          const next = payload.new;
          if (!next) return;
          paint({ ...game, ...next }, courtName, screenKey);
          Object.assign(game, next);
        },
      )
      .subscribe();
  } catch (err) {
    console.error(err);
    $('totem-status').textContent = err?.message || 'Erro ao carregar';
  }
})();
