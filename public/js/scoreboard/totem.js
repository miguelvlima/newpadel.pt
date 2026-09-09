// Totem LED 256×512 — carregamento próprio (não altera index.js / ui.js).
//
// Fotos: se o jogo tem `tournament_match_id`, pede avatarUrl à academy
// via proxy local `/api/scoreboard/match-context` (secret só no Laravel).
// Fallback: DEMO_PHOTOS → ui-avatars.
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

/** Cache matchId → [avatarUrl|null × 4] */
const avatarCache = new Map();

const SET_LABELS = ['1º', '2º', '3º'];

/** Ordem canónica dos campos (videoled + “outros”). */
const FIELD_ORDER = ['REMAX', 'PERMEDIA', 'AURA', 'HEINEKEN'];

/** Nome mostrado no rodapé (chave de ecrã mantém-se AURA). */
const COURT_DISPLAY = {
  AURA: 'AURA EVENT LAB',
};

function courtDisplayName(key) {
  const raw = String(key || '').trim().replace(/^campo\s+/i, '').toUpperCase();
  if (!raw) return '—';
  return COURT_DISPLAY[raw] || raw;
}

function courtOtherCourtHtml(key) {
  const raw = String(key || '').trim().replace(/^campo\s+/i, '').toUpperCase();
  if (raw === 'AURA') {
    return '<span class="totem-other-court is-stacked"><span>AURA</span><span>EVENT LAB</span></span>';
  }
  return `<span class="totem-other-court">${escapeHtml(courtDisplayName(key))}</span>`;
}

/** Fallback local se a Supabase não devolver jogos dos outros campos. */
const OTHER_COURTS_DEMO = [
  {
    court: 'REMAX',
    category: 'M3',
    group: 'Grupo B',
    player1: 'Ricardo Alves',
    player2: 'Tiago Mendes',
    player3: 'Bruno Silva',
    player4: 'Pedro Nunes',
    format: 'best_of_3',
    server: 1,
    score: {
      sets: [
        { team1: 6, team2: 4 },
        { team1: 3, team2: 5 },
      ],
      current: { points_team1: 2, points_team2: 1, games_team1: 3, games_team2: 5 },
    },
  },
  {
    court: 'PERMEDIA',
    category: 'M2',
    group: 'Grupo A',
    player1: 'Eduardo Costa',
    player2: 'Nuno Miguel Lopes',
    player3: 'Gustavo de Sales',
    player4: 'Afonso Craveiro',
    format: 'best_of_3',
    server: 1,
    score: {
      sets: [
        { team1: 6, team2: 3 },
      ],
      current: { points_team1: 3, points_team2: 2, games_team1: 4, games_team2: 2 },
    },
  },
  {
    court: 'AURA',
    category: 'M2',
    group: 'Grupo C',
    player1: 'André Costa',
    player2: 'Miguel Rocha',
    player3: 'João Pereira',
    player4: 'Hugo Martins',
    format: 'best_of_3',
    server: 3,
    score: {
      sets: [
        { team1: 7, team2: 5 },
        { team1: 2, team2: 2 },
      ],
      current: { points_team1: 3, points_team2: 3, games_team1: 2, games_team2: 2 },
    },
  },
  {
    court: 'HEINEKEN',
    category: 'M4',
    group: 'Grupo A',
    player1: 'Carlos Dias',
    player2: 'Rui Fonseca',
    player3: 'Paulo Santos',
    player4: 'Nuno Ribeiro',
    format: 'best_of_3',
    server: 2,
    score: {
      sets: [
        { team1: 6, team2: 3 },
        { team1: 5, team2: 4 },
      ],
      current: { points_team1: 1, points_team2: 0, games_team1: 5, games_team2: 4 },
    },
  },
];

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

function photoFor(name, avatarUrl = null) {
  if (avatarUrl) return avatarUrl;
  return DEMO_PHOTOS[name] || FALLBACK_PHOTO(name);
}

async function fetchMatchAvatars(matchId) {
  const id = String(matchId || '').trim();
  if (!id) return [null, null, null, null];
  if (avatarCache.has(id)) return avatarCache.get(id);

  try {
    const res = await fetch(`/api/scoreboard/match-context?matchId=${encodeURIComponent(id)}`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`match-context ${res.status}`);
    const data = await res.json();
    const players = Array.isArray(data?.players) ? data.players : [];
    const urls = [0, 1, 2, 3].map((i) => {
      const u = players[i]?.avatarUrl;
      return typeof u === 'string' && u.trim() ? u.trim() : null;
    });
    avatarCache.set(id, urls);
    return urls;
  } catch (e) {
    console.warn('avatars academy:', e);
    return [null, null, null, null];
  }
}

/** Letras individuais — revelação tipo escrita, da esquerda para a direita. */
function letterSpans(text) {
  const chars = Array.from(String(text || ''));
  let letterIndex = 0;
  return chars
    .map((ch) => {
      if (ch === ' ') {
        return `<span class="totem-letter totem-letter-space" style="--i:${letterIndex++}">&nbsp;</span>`;
      }
      const i = letterIndex++;
      return `<span class="totem-letter" style="--i:${i}">${escapeHtml(ch)}</span>`;
    })
    .join('');
}

function renderPhotos(el, names, serverIndexes, { animate = false, avatars = [] } = {}) {
  if (!el) return;
  el.innerHTML = names
    .map((name, i) => {
      const serving = serverIndexes.includes(i + 1) ? ' is-serving' : '';
      const label = shortName(name);
      const labelHtml = animate ? letterSpans(label) : escapeHtml(label);
      const slot = animate ? ` style="--slot:${i}"` : '';
      const src = photoFor(name, avatars[i] || null);
      return `<figure class="totem-photo${serving}"${slot}>
        <div class="totem-photo-build" aria-hidden="true">
          <span class="totem-photo-tile"></span>
          <span class="totem-photo-tile"></span>
          <span class="totem-photo-tile"></span>
          <span class="totem-photo-tile"></span>
          <span class="totem-photo-tile"></span>
          <span class="totem-photo-tile"></span>
          <span class="totem-photo-tile"></span>
          <span class="totem-photo-tile"></span>
          <span class="totem-photo-tile"></span>
        </div>
        <div class="totem-photo-scan" aria-hidden="true"></div>
        <img src="${escapeHtml(src)}" alt="${escapeHtml(name)}" loading="eager" />
        <figcaption class="totem-photo-label"><span class="totem-photo-label-text">${labelHtml}</span></figcaption>
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
    const done = concluded[i];
    // Como no scoreboard normal: Super TB em curso não vira coluna de set —
    // fica só na coluna Pts com rótulo "Super TB".
    if (cfg.isSuper && i === 2 && !done) continue;

    const a = Number(s.team1 ?? 0);
    const b = Number(s.team2 ?? 0);
    const label =
      cfg.isSuper && i === 2 ? 'Super TB' : SET_LABELS[i] || `${i + 1}º`;
    columns.push({
      label,
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

  let pointsA = '';
  let pointsB = '';
  let pointsLabel = 'Pts';
  let showPoints = true;

  if (matchOver) {
    // Jogo terminado: só sets (como o scoreboard normal esconde a coluna JOGO).
    showPoints = false;
  } else if (superTB || normalTB) {
    // Em Super TB o valor pode estar em current.tb_* ou já em sets[2].
    const base1 = Number(sets[2]?.team1 || 0);
    const base2 = Number(sets[2]?.team2 || 0);
    pointsA = String(Number(cur.tb_team1 || 0) || base1);
    pointsB = String(Number(cur.tb_team2 || 0) || base2);
    pointsLabel = superTB ? 'Super TB' : 'Tie-break';
  } else {
    pointsA = String(tennisPoint(Number(cur.points_team1 || 0), cfg.isGP));
    pointsB = String(tennisPoint(Number(cur.points_team2 || 0), cfg.isGP));
    pointsLabel = 'Pts';
  }

  return { columns, pointsA, pointsB, pointsLabel, showPoints, matchOver };
}

function renderScoreBoard(el, display) {
  if (!el) return;
  const { columns, pointsA, pointsB, pointsLabel, showPoints } = display;

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

  const ptsHead = showPoints
    ? `<th class="col-pts">${escapeHtml(pointsLabel)}</th>`
    : '';
  const ptsCell = (val) =>
    showPoints
      ? `<td class="col-pts"><span class="pts-val">${escapeHtml(val)}</span></td>`
      : '';

  el.innerHTML = `
    <table class="totem-score-table">
      <thead>
        <tr>
          ${headSets}
          ${ptsHead}
        </tr>
      </thead>
      <tbody>
        <tr>
          ${rowSets('a')}
          ${ptsCell(pointsA)}
        </tr>
        <tr>
          ${rowSets('b')}
          ${ptsCell(pointsB)}
        </tr>
      </tbody>
    </table>
  `;
}

function lastName(full) {
  const parts = String(full || '').trim().split(/\s+/).filter(Boolean);
  return parts[parts.length - 1] || full || '—';
}

function pairShort(p1, p2) {
  return `${lastName(p1)} / ${lastName(p2)}`;
}

function otherScoreCells(display, side) {
  const cells = display.columns.map((col) => {
    const val = side === 'a' ? col.a : col.b;
    const won = side === 'a' ? col.wonA : col.wonB;
    return `<span class="totem-other-set${won ? ' is-won' : ''}${col.live ? ' is-live' : ''}">${escapeHtml(String(val))}</span>`;
  });
  if (display.showPoints) {
    const pts = side === 'a' ? display.pointsA : display.pointsB;
    cells.push(`<span class="totem-other-pts">${escapeHtml(pts)}</span>`);
  }
  return cells.join('');
}

function renderOtherCourts(el, excludeKeys = [], games = OTHER_COURTS_DEMO) {
  if (!el) return;
  const exclude = new Set(
    (Array.isArray(excludeKeys) ? excludeKeys : [excludeKeys])
      .map((k) => String(k || '').trim().toUpperCase())
      .filter(Boolean),
  );
  const list = games
    .filter((g) => !exclude.has(String(g.court || '').toUpperCase()))
    .slice(0, 3);
  el.innerHTML = list
    .map((g) => {
      const display = computeDisplay(g);
      const serveA = g.server === 1 || g.server === 2;
      const serveB = g.server === 3 || g.server === 4;
      const metaBits = [g.category, g.group].map((x) => String(x || '').trim()).filter(Boolean);
      const metaHtml = metaBits.length
        ? `<span class="totem-other-meta">${escapeHtml(metaBits.join(' · '))}</span>`
        : '';
      return `<article class="totem-other">
        <div class="totem-other-side">
          ${courtOtherCourtHtml(g.court)}
          ${metaHtml}
        </div>
        <div class="totem-other-main">
          <div class="totem-other-row">
            <p class="totem-other-pair${serveA ? ' is-serving' : ''}">${escapeHtml(pairShort(g.player1, g.player2))}</p>
            <div class="totem-other-sets">${otherScoreCells(display, 'a')}</div>
          </div>
          <div class="totem-other-row">
            <p class="totem-other-pair${serveB ? ' is-serving' : ''}">${escapeHtml(pairShort(g.player3, g.player4))}</p>
            <div class="totem-other-sets">${otherScoreCells(display, 'b')}</div>
          </div>
        </div>
      </article>`;
    })
    .join('');
}

async function fetchOtherCourtGames(sb, excludeKeys = []) {
  const exclude = new Set(
    (Array.isArray(excludeKeys) ? excludeKeys : [excludeKeys])
      .map((k) => String(k || '').trim().toUpperCase())
      .filter(Boolean),
  );
  const keys = FIELD_ORDER.filter((k) => !exclude.has(k));
  if (!keys.length) return [];

  const { data: boards, error: boardsErr } = await sb
    .from('scoreboards')
    .select('id,key')
    .in('key', keys);
  if (boardsErr) throw boardsErr;
  if (!boards?.length) return [];

  const byKey = new Map(boards.map((b) => [String(b.key).toUpperCase(), b]));
  const ordered = keys.map((k) => byKey.get(k)).filter(Boolean);
  const boardIds = ordered.map((b) => b.id);

  const { data: sels, error: selsErr } = await sb
    .from('scoreboard_selections')
    .select('scoreboard_id,game_id,position')
    .in('scoreboard_id', boardIds)
    .order('position', { ascending: true });
  if (selsErr) throw selsErr;

  const gameByBoard = new Map();
  for (const s of sels || []) {
    if (!gameByBoard.has(s.scoreboard_id) && s.game_id) {
      gameByBoard.set(s.scoreboard_id, s.game_id);
    }
  }

  const gameIds = [...new Set([...gameByBoard.values()])];
  if (!gameIds.length) return [];

  const { data: games, error: gamesErr } = await sb
    .from('games')
    .select('id,player1,player2,player3,player4,format,score,server,court_id')
    .in('id', gameIds);
  if (gamesErr) throw gamesErr;

  const gmap = new Map((games || []).map((g) => [g.id, g]));

  return ordered
    .map((board) => {
      const gid = gameByBoard.get(board.id);
      const g = gmap.get(gid);
      if (!g) return null;
      return {
        ...g,
        court: String(board.key).toUpperCase(),
        category: '',
        group: '',
      };
    })
    .filter(Boolean);
}


/** Garante nome de apresentação sempre numa linha (reduz escala se preciso). */
function fitNameStageText(stage, textEl) {
  if (!stage || !textEl) return;
  textEl.style.transform = 'none';
  const max = stage.clientWidth;
  const need = textEl.scrollWidth;
  if (max > 0 && need > max) {
    const s = Math.max(0.45, max / need);
    textEl.style.transform = `scale(${s})`;
  }
}

/** Nome na foto: escala para ocupar ~toda a largura do quadrado. */
function fitPhotoLabel(el) {
  if (!el) return;
  let text = el.querySelector('.totem-photo-label-text');
  if (!text) {
    text = document.createElement('span');
    text.className = 'totem-photo-label-text';
    text.textContent = el.textContent;
    el.textContent = '';
    el.appendChild(text);
  }
  text.style.transform = 'none';
  const pad = 4;
  const max = Math.max(0, el.clientWidth - pad);
  const need = text.scrollWidth;
  if (max < 2 || need < 2) return;
  // Cresce nomes curtos, encolhe longos — alvo ~96% da largura útil
  const s = Math.min(1.85, Math.max(0.5, (max * 0.96) / need));
  text.style.transform = `scale(${s})`;
}

function fitPhotoLabels(root = $('totem')) {
  if (!root) return;
  root.querySelectorAll('.totem-photo-label').forEach(fitPhotoLabel);
}

/** Fotos no espaço restante + alinha placar/footer/outros à mesma largura. */
function syncRailWidth() {
  const root = $('totem');
  if (!root) return;

  const side = root.querySelector('.totem-side');
  const gapRaw = getComputedStyle(root).getPropertyValue('--photo-gap').trim();
  const gap = Number.parseFloat(gapRaw) || 12;

  if (side) {
    const sideH = side.clientHeight;
    const sideW = side.clientWidth;
    if (sideH > 2 && sideW > 2) {
      const s = Math.max(48, Math.floor(Math.min(sideH, (sideW - gap) / 2)));
      root.style.setProperty('--photo-s', `${s}px`);
      root.style.setProperty('--photos-row', `${s * 2 + gap}px`);
      fitPhotoLabels(root);
      return;
    }
  }

  const photos = root.querySelector('.totem-photos');
  if (!photos) return;
  const w = photos.getBoundingClientRect().width;
  if (w > 2) root.style.setProperty('--photos-row', `${Math.round(w)}px`);
  fitPhotoLabels(root);
}

let introPlayed = false;

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function paint(game, courtName, screenKey = '', { playIntro = false, otherGames = null, avatars = null } = {}) {
  const p1 = game.player1 || 'TBD';
  const p2 = game.player2 || 'TBD';
  const p3 = game.player3 || 'TBD';
  const p4 = game.player4 || 'TBD';
  const server = Number(game.server) || 0;
  const photos = Array.isArray(avatars) ? avatars : [null, null, null, null];

  const raw = String(courtName || screenKey || '').trim();
  const court = raw.replace(/^campo\s+/i, '').toUpperCase() || '—';
  $('totem-court').textContent = `CAMPO ${courtDisplayName(court)}`;
  const cat = $('totem-category');
  const grp = $('totem-group');
  if (cat) cat.textContent = 'M2';
  if (grp) grp.textContent = 'Grupo A';

  const serveA = server === 1 || server === 2 ? [server] : [];
  const serveB = server === 3 || server === 4 ? [server - 2] : [];
  const animate = playIntro && !introPlayed;
  renderPhotos($('photos-a'), [p1, p2], serveA, { animate, avatars: photos.slice(0, 2) });
  renderPhotos($('photos-b'), [p3, p4], serveB, { animate, avatars: photos.slice(2, 4) });

  const d = computeDisplay(game);
  renderScoreBoard($('totem-score-board'), d);
  const label = $('totem-points-label');
  if (label) label.textContent = d.pointsLabel;

  if (Array.isArray(otherGames)) {
    renderOtherCourts($('totem-others'), [], otherGames);
  } else {
    renderOtherCourts($('totem-others'), [screenKey, court]);
  }
  requestAnimationFrame(() => {
    syncRailWidth();
    requestAnimationFrame(syncRailWidth);
  });

  if (animate) {
    runIntro([
      { name: p1, side: 'a', slot: 0 },
      { name: p2, side: 'a', slot: 1 },
      { name: p3, side: 'b', slot: 0 },
      { name: p4, side: 'b', slot: 1 },
    ]);
  } else {
    const root = $('totem');
    if (root) {
      root.classList.remove('is-intro', 'is-intro-play', 'is-show-boom', 'is-presenting');
      root.classList.add('is-ready');
    }
    introPlayed = true;
  }
}

function spawnSparks(host, count = 36) {
  if (!host) return;
  host.innerHTML = '';
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const s = document.createElement('span');
    s.className = 'totem-spark';
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.35;
    const dist = 110 + Math.random() * 280;
    s.style.setProperty('--sx', `${Math.cos(angle) * dist}px`);
    s.style.setProperty('--sy', `${Math.sin(angle) * dist}px`);
    s.style.setProperty('--sd', `${0.95 + Math.random() * 1.1}s`);
    s.style.setProperty('--sdelay', `${Math.random() * 0.45}s`);
    s.style.setProperty('--ssize', `${4 + Math.random() * 9}px`);
    frag.appendChild(s);
  }
  host.appendChild(frag);
}

function photoEl(side, slot) {
  const root = $(`photos-${side}`);
  if (!root) return null;
  return root.querySelectorAll('.totem-photo')[slot] || null;
}

/**
 * Apresenta um jogador: nome GRANDE no centro, letra a letra,
 * e depois o nome “aterra” na legenda final da foto.
 */
async function presentPlayer(player, { keepPresenting = false, endPresenting = true } = {}) {
  const root = $('totem');
  const stage = $('totem-name-stage');
  const textEl = $('totem-name-stage-text');
  const fig = photoEl(player.side, player.slot);
  if (!root || !stage || !textEl || !fig) return;

  const caption = fig.querySelector('.totem-photo-label');
  root.dataset.presentSide = player.side;
  root.querySelectorAll('.totem-photo.is-spotlight').forEach((el) => {
    el.classList.remove('is-spotlight');
  });
  fig.classList.add('is-spotlight');
  if (!keepPresenting) root.classList.add('is-presenting');

  stage.classList.remove('is-out');
  const label = shortName(player.name);
  textEl.style.transform = 'none';
  textEl.innerHTML = letterSpans(label);
  void textEl.offsetWidth;
  stage.classList.add('is-on');
  fitNameStageText(stage, textEl);

  const letters = textEl.querySelectorAll('.totem-letter');
  letters.forEach((el, i) => {
    el.style.setProperty('--i', String(i));
    el.classList.add('is-reveal');
  });

  const letterMs = 180;
  const holdMs = 800;
  await wait(Math.max(letters.length * letterMs + 350, 1000) + holdMs);

  await settleNameToPhoto({ root, stage, textEl, fig, caption, label });

  if (endPresenting) {
    fig.classList.remove('is-spotlight');
    root.classList.remove('is-presenting');
    delete root.dataset.presentSide;
  }
}

/** FLIP: o nome voa do centro para a legenda da foto. */
async function settleNameToPhoto({ root, stage, textEl, fig, caption, label }) {
  if (!caption) {
    stage.classList.remove('is-on');
    stage.classList.add('is-out');
    await wait(280);
    stage.classList.remove('is-out');
    textEl.innerHTML = '';
    return;
  }

  caption.innerHTML = `<span class="totem-photo-label-text">${escapeHtml(label)}</span>`;
  fitPhotoLabel(caption);
  const from = textEl.getBoundingClientRect();
  let toRect = caption.getBoundingClientRect();

  // Garante medição mesmo com a legenda ainda invisível
  if (toRect.width < 2 || toRect.height < 2) {
    caption.classList.add('is-measure');
    toRect = caption.getBoundingClientRect();
    caption.classList.remove('is-measure');
  }

  const to = {
    left: toRect.left,
    top: toRect.top,
    width: Math.max(toRect.width, 40),
    height: Math.max(toRect.height, 16),
  };

  const ghost = document.createElement('div');
  ghost.className = 'totem-name-fly';
  ghost.textContent = label;
  const parent = root.getBoundingClientRect();
  const startX = from.left + from.width / 2 - parent.left;
  const startY = from.top + from.height / 2 - parent.top;
  const endX = to.left + to.width / 2 - parent.left;
  const endY = to.top + to.height / 2 - parent.top;
  const startScale = Math.min(Math.max(from.width / Math.max(to.width, 1), 1.6), 3.2);

  ghost.style.setProperty('--fly-x0', `${startX}px`);
  ghost.style.setProperty('--fly-y0', `${startY}px`);
  ghost.style.setProperty('--fly-x1', `${endX}px`);
  ghost.style.setProperty('--fly-y1', `${endY}px`);
  ghost.style.setProperty('--fly-s0', String(startScale));
  root.appendChild(ghost);

  stage.classList.remove('is-on');
  stage.classList.add('is-out-fast');
  void ghost.offsetWidth;
  ghost.classList.add('is-flying');

  await wait(580);
  fig.classList.add('is-named');
  ghost.remove();
  stage.classList.remove('is-out-fast');
  textEl.innerHTML = '';
  await wait(120);
}

let introGen = 0;

function ensureIntroDom(root) {
  if (!root) return;
  if (!$('totem-show')) {
    const show = document.createElement('div');
    show.className = 'totem-show';
    show.id = 'totem-show';
    show.setAttribute('aria-hidden', 'true');
    show.innerHTML = `
      <div class="totem-show-flash"></div>
      <div class="totem-show-beams"></div>
      <div class="totem-show-sparks" id="totem-show-sparks"></div>
      <div class="totem-show-logo-wrap" id="totem-show-logo-wrap">
        <img class="totem-show-logo" src="/images/tournaments/3-open-dos-ouricos-logo-horizontal.png?v=2" alt="" width="220" height="64" />
      </div>`;
    root.appendChild(show);
  }
  const score = root.querySelector('.totem-score');
  if (score && !$('totem-show-vs')) {
    const vs = document.createElement('div');
    vs.className = 'totem-show-vs';
    vs.id = 'totem-show-vs';
    vs.setAttribute('aria-hidden', 'true');
    vs.innerHTML = '<span class="totem-show-vs-text">VS</span>';
    score.insertBefore(vs, score.firstChild);
  }
  if (score && !$('totem-name-stage')) {
    const stage = document.createElement('div');
    stage.className = 'totem-name-stage';
    stage.id = 'totem-name-stage';
    stage.setAttribute('aria-live', 'polite');
    stage.innerHTML = '<p class="totem-name-stage-text" id="totem-name-stage-text"></p>';
    const board = $('totem-score-board');
    if (board) score.insertBefore(stage, board);
    else score.appendChild(stage);
  }
}

function prepareIntroReplay() {
  introPlayed = false;
  introGen += 1;
  const root = $('totem');
  if (!root) return;
  ensureIntroDom(root);
  root.classList.remove(
    'is-ready',
    'is-intro-play',
    'is-show-boom',
    'is-show-boom-2',
    'is-show-logo',
    'is-show-logo-out',
    'is-show-vs',
    'is-show-vs-out',
    'is-show-settle',
    'is-show-sides-a',
    'is-show-sides-b',
    'is-show-score',
    'is-presenting',
  );
  root.classList.add('is-intro');
}

async function runIntro(players) {
  const root = $('totem');
  if (!root || introPlayed) return;
  const myGen = ++introGen;
  introPlayed = true;
  ensureIntroDom(root);

  const stillMine = () => myGen === introGen;

  root.classList.add('is-intro');
  root.classList.remove(
    'is-ready',
    'is-intro-play',
    'is-show-boom',
    'is-show-boom-2',
    'is-show-logo',
    'is-show-logo-out',
    'is-show-vs',
    'is-show-vs-out',
    'is-show-settle',
    'is-show-score',
    'is-presenting',
  );
  spawnSparks($('totem-show-sparks'), 56);

  void root.offsetWidth;
  root.classList.add('is-intro-play');
  await wait(200);
  if (!stillMine()) return;
  root.classList.add('is-show-boom');
  await wait(700);
  if (!stillMine()) return;
  root.classList.add('is-show-boom-2');
  await wait(900);
  if (!stillMine()) return;

  root.classList.add('is-show-logo');
  await wait(2600);
  if (!stillMine()) return;
  root.classList.add('is-show-logo-out');
  await wait(700);
  if (!stillMine()) return;
  root.classList.remove('is-show-boom', 'is-show-boom-2', 'is-show-logo', 'is-show-logo-out');

  root.classList.add('is-show-sides-a');
  await wait(850);
  if (!stillMine()) return;
  await presentPlayer(players[0], { endPresenting: false });
  if (!stillMine()) return;
  await presentPlayer(players[1], { keepPresenting: true, endPresenting: true });
  if (!stillMine()) return;
  await wait(180);
  if (!stillMine()) return;

  root.classList.add('is-show-vs');
  await wait(1100);
  if (!stillMine()) return;
  root.classList.add('is-show-vs-out');
  await wait(450);
  if (!stillMine()) return;
  root.classList.remove('is-show-vs', 'is-show-vs-out');

  root.classList.add('is-show-sides-b');
  await wait(850);
  if (!stillMine()) return;
  await presentPlayer(players[2], { endPresenting: false });
  if (!stillMine()) return;
  await presentPlayer(players[3], { keepPresenting: true, endPresenting: true });
  if (!stillMine()) return;
  await wait(280);
  if (!stillMine()) return;

  root.classList.add('is-show-score');
  await wait(2000);
  if (!stillMine()) return;
  root.classList.add('is-show-settle');
  await wait(700);
  if (!stillMine()) return;

  root.classList.remove(
    'is-intro',
    'is-intro-play',
    'is-show-boom',
    'is-show-boom-2',
    'is-show-logo',
    'is-show-logo-out',
    'is-show-vs',
    'is-show-vs-out',
    'is-show-settle',
    'is-show-sides-a',
    'is-show-sides-b',
    'is-show-score',
    'is-presenting',
  );
  root.classList.add('is-ready');
  root.querySelectorAll('.totem-photo-label').forEach((el) => {
    const raw = el.textContent;
    el.innerHTML = `<span class="totem-photo-label-text">${escapeHtml(raw.trim())}</span>`;
  });
  root.querySelectorAll('.totem-photo-build, .totem-photo-scan').forEach((el) => el.remove());
  syncRailWidth();
  fitPhotoLabels(root);
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

async function fetchSelectedGameId(sb, boardId) {
  if (!boardId) return null;
  const { data, error } = await sb
    .from('scoreboard_selections')
    .select('game_id')
    .eq('scoreboard_id', boardId)
    .order('position', { ascending: true })
    .limit(1);
  if (error) {
    console.warn('selection:', error);
    return null;
  }
  return data?.[0]?.game_id || null;
}

(async () => {
  const root = $('totem');
  if (!root) return;

  const url = root.dataset.sbUrl || '';
  const anon = root.dataset.sbAnon || '';
  const forcedGameId = root.dataset.gameId || '';
  const screenKey = root.dataset.screen || 'default';
  const isEmbed = root.dataset.embed === '1';
  const isQuiet = root.dataset.quiet === '1'
    || new URLSearchParams(window.location.search).has('quiet');
  // quiet/embed: sem intro no 1.º paint; troca de jogo volta a animar
  const skipFirstIntro = isEmbed || isQuiet;

  const onResize = () => syncRailWidth();
  window.addEventListener('resize', onResize);
  if (typeof ResizeObserver !== 'undefined') {
    const ro = new ResizeObserver(() => syncRailWidth());
    ro.observe(root);
  }

  const showWaiting = (msg) => {
    root.classList.remove('is-intro', 'is-intro-play');
    root.classList.add('is-ready');
    const court = $('totem-court');
    if (court) court.textContent = msg || `À ESPERA · ${courtDisplayName(screenKey)}`;
  };

  try {
    if (!/^https:\/\/.+\.supabase\.co/i.test(url)) throw new Error('SUPABASE_URL inválida');
    const sb = createClient(url, anon, { realtime: { params: { eventsPerSecond: 5 } } });

    const { data: board, error: boardErr } = await sb
      .from('scoreboards')
      .select('id,key,title')
      .eq('key', screenKey)
      .maybeSingle();
    if (boardErr) console.warn('scoreboards:', boardErr);

    const courtName = String(screenKey || '').toUpperCase();
    let game = null;
    let otherGames = [];
    let gameChannel = null;
    let currentGameId = null;
    let currentAvatars = [null, null, null, null];
    let firstPaintDone = false;

    const refreshOthers = async () => {
      try {
        otherGames = await fetchOtherCourtGames(sb, [screenKey, courtName]);
        renderOtherCourts($('totem-others'), [], otherGames);
      } catch (_) { /* keep last */ }
    };

    const bindGameChannel = (gameId) => {
      if (gameChannel) {
        try { sb.removeChannel(gameChannel); } catch (_) { /* ignore */ }
        gameChannel = null;
      }
      if (!gameId) return;
      gameChannel = sb.channel(`totem-game-${gameId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'games', filter: `id=eq.${gameId}` },
          (payload) => {
            const next = payload.new;
            if (!next || next.id !== currentGameId) return;
            Object.assign(game, next);
            paint(game, courtName, screenKey, {
              playIntro: false,
              otherGames,
              avatars: currentAvatars,
            });
          },
        )
        .subscribe();
    };

    const applyGame = async (nextGame, { withIntro }) => {
      if (!nextGame?.id) return;
      game = nextGame;
      currentGameId = nextGame.id;
      bindGameChannel(nextGame.id);
      currentAvatars = await fetchMatchAvatars(nextGame.tournament_match_id);
      if (withIntro) prepareIntroReplay();
      paint(game, courtName, screenKey, {
        playIntro: withIntro,
        otherGames,
        avatars: currentAvatars,
      });
      firstPaintDone = true;
    };

    const clearGame = () => {
      game = null;
      currentGameId = null;
      currentAvatars = [null, null, null, null];
      bindGameChannel(null);
      showWaiting(`SEM JOGO · ${screenKey}`);
      const boardEl = $('totem-score-board');
      if (boardEl) boardEl.innerHTML = '';
      const a = $('photos-a');
      const b = $('photos-b');
      if (a) a.innerHTML = '';
      if (b) b.innerHTML = '';
    };

    const syncSelection = async ({ withIntro }) => {
      try {
        let gid = null;
        if (board?.id) {
          gid = await fetchSelectedGameId(sb, board.id);
        } else if (forcedGameId) {
          gid = forcedGameId;
        }
        if (!gid) {
          if (currentGameId) clearGame();
          else showWaiting(`SEM JOGO · ${screenKey}`);
          return;
        }
        if (gid === currentGameId) return;
        const next = await fetchGame(sb, gid);
        if (!next) {
          showWaiting(`JOGO INVÁLIDO · ${screenKey}`);
          return;
        }
        // 1.º jogo neste ecrã: respeitar quiet; trocas seguintes: sempre intro
        const play = firstPaintDone ? true : (withIntro && !skipFirstIntro);
        applyGame(next, { withIntro: play });
      } catch (e) {
        console.warn('sync selection:', e);
      }
    };

    // Estado inicial — NÃO abortar se ainda não houver jogo (mantém listeners)
    let selectedId = board?.id ? await fetchSelectedGameId(sb, board.id) : null;
    if (!selectedId && forcedGameId) selectedId = forcedGameId;

    try {
      otherGames = await fetchOtherCourtGames(sb, [screenKey, courtName]);
    } catch (e) {
      console.warn('outros campos (fallback demo):', e);
      otherGames = OTHER_COURTS_DEMO.filter(
        (g) => ![screenKey, courtName].map((x) => String(x || '').toUpperCase()).includes(String(g.court).toUpperCase()),
      ).slice(0, 3);
    }
    renderOtherCourts($('totem-others'), [], otherGames);

    if (selectedId) {
      const initial = await fetchGame(sb, selectedId);
      if (initial) {
        applyGame(initial, { withIntro: !skipFirstIntro });
      } else {
        showWaiting(`JOGO INVÁLIDO · ${screenKey}`);
      }
    } else {
      showWaiting(`SEM JOGO · ${screenKey}`);
    }

    sb.channel(`totem-others-${screenKey}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'games' }, () => {
        refreshOthers();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'scoreboard_selections' }, () => {
        refreshOthers();
        syncSelection({ withIntro: true });
      })
      .subscribe();

    if (board?.id) {
      sb.channel(`totem-sel-${board.id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'scoreboard_selections', filter: `scoreboard_id=eq.${board.id}` },
          () => {
            syncSelection({ withIntro: true });
          },
        )
        .subscribe();
    }

    // Fallback se o realtime falhar (comum em iframes / LED)
    setInterval(async () => {
      try {
        if (currentGameId && game) {
          const fresh = await fetchGame(sb, currentGameId);
          if (fresh) {
            const changed =
              JSON.stringify(fresh.score) !== JSON.stringify(game.score)
              || Number(fresh.server) !== Number(game.server)
              || fresh.player1 !== game.player1
              || fresh.player2 !== game.player2
              || fresh.player3 !== game.player3
              || fresh.player4 !== game.player4;
            if (changed) {
              Object.assign(game, fresh);
              paint(game, courtName, screenKey, { playIntro: false, otherGames, avatars: currentAvatars });
            }
          }
        }
      } catch (_) { /* ignore */ }
      syncSelection({ withIntro: true });
      refreshOthers();
    }, 3000);
  } catch (err) {
    console.error(err);
    showWaiting(err?.message || 'Erro ao carregar');
  }
})();
