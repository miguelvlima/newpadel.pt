import {
  initSupabase,
  fetchScreen,
  fetchSlots,
  subscribeSelections,
  subscribeGames,
  subscribeScreenMeta
} from './supabase-api.js';

const root = document.getElementById('compact-scoreboard');

const SUPABASE_URL = root?.dataset?.sbUrl || '';
const SUPABASE_ANON = root?.dataset?.sbAnon || '';
const SCREEN_KEY = root?.dataset?.screen || 'default';

function safe(v) {
  return String(v ?? '').replace(/[&<>"']/g, s => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[s]));
}

function firstActiveGame(slots) {
  return Array.isArray(slots) ? slots.find(Boolean) || null : null;
}

function teamName(game, top = true) {
  if (top) return [game.player1, game.player2].filter(Boolean).join(' / ');
  return [game.player3, game.player4].filter(Boolean).join(' / ');
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function hasAnyValue(a, b) {
  return num(a) > 0 || num(b) > 0;
}

function tennisPointLabel(v) {
  const n = num(v);

  if (n === 0) return '0';
  if (n === 1) return '15';
  if (n === 2) return '30';
  if (n === 3) return '40';
  if (n === 4) return 'AD';

  return String(n);
}

function detectSets(game) {
  const sets = [
    { top: num(game.set1_team1), bot: num(game.set1_team2) },
    { top: num(game.set2_team1), bot: num(game.set2_team2) },
    { top: num(game.set3_team1), bot: num(game.set3_team2) }
  ];

  const tbTop = num(game.tb_team1 ?? game.current_tb_team1);
  const tbBot = num(game.tb_team2 ?? game.current_tb_team2);

  const hasThirdSet = hasAnyValue(sets[2].top, sets[2].bot);
  const hasSecondSet = hasAnyValue(sets[1].top, sets[1].bot);
  const hasFirstSet = hasAnyValue(sets[0].top, sets[0].bot);

  // Se existir 3.º set preenchido, mostramos 3 colunas.
  if (hasThirdSet) return sets;

  // Se houver 2 sets preenchidos e TB atual, mostramos a 3.ª coluna com TB/SuperTB.
  if (hasSecondSet && hasAnyValue(tbTop, tbBot)) {
    return [
      sets[0],
      sets[1],
      { top: tbTop, bot: tbBot }
    ];
  }

  // Se houver 2 sets, mostramos 2 colunas.
  if (hasSecondSet) return [sets[0], sets[1]];

  // Se só houver 1 set, mostramos 1 coluna.
  if (hasFirstSet) return [sets[0]];

  // Pré-jogo: mostra 1 coluna a zero para não colapsar layout.
  return [{ top: 0, bot: 0 }];
}

function detectCurrentGamePoints(game) {
  const pointsTop = game.points_team1 ?? game.current_points_team1;
  const pointsBot = game.points_team2 ?? game.current_points_team2;

  const gamesTop = game.games_team1 ?? game.current_games_team1;
  const gamesBot = game.games_team2 ?? game.current_games_team2;

  const tbTop = game.tb_team1 ?? game.current_tb_team1;
  const tbBot = game.tb_team2 ?? game.current_tb_team2;

  // Se houver pontos de ténis, usar 0/15/30/40/AD
  if (pointsTop != null || pointsBot != null) {
    return {
      top: tennisPointLabel(pointsTop),
      bot: tennisPointLabel(pointsBot)
    };
  }

  // Se houver games correntes, usar esses
  if (gamesTop != null || gamesBot != null) {
    return {
      top: String(num(gamesTop)),
      bot: String(num(gamesBot))
    };
  }

  // fallback para TB corrente
  if (tbTop != null || tbBot != null) {
    return {
      top: String(num(tbTop)),
      bot: String(num(tbBot))
    };
  }

  return { top: '0', bot: '0' };
}

function rowClass(setCount) {
  if (setCount >= 3) return 'row row--3sets';
  if (setCount === 2) return 'row row--2sets';
  return 'row row--1sets';
}

function renderSetCells(sets, side) {
  return sets.map(set => {
    const value = side === 'top' ? set.top : set.bot;
    return `<div class="set">${safe(String(value))}</div>`;
  }).join('');
}

function render(game) {
  if (!game) {
    root.innerHTML = `<div class="compact-card is-empty"></div>`;
    return;
  }

  const sets = detectSets(game);
  const current = detectCurrentGamePoints(game);

  const topServing = String(game.server || '') === 'team1';
  const botServing = String(game.server || '') === 'team2';

  const cls = rowClass(sets.length);

  root.innerHTML = `
    <section class="compact-card">
      <div class="compact-grid">
        <div class="${cls}">
          <div class="name ${topServing ? 'serving' : ''}">${safe(teamName(game, true))}</div>
          ${renderSetCells(sets, 'top')}
          <div class="game">${safe(current.top)}</div>
        </div>

        <div class="${cls}">
          <div class="name ${botServing ? 'serving' : ''}">${safe(teamName(game, false))}</div>
          ${renderSetCells(sets, 'bot')}
          <div class="game">${safe(current.bot)}</div>
        </div>
      </div>
    </section>
  `;
}

(async () => {
  const sb = initSupabase(SUPABASE_URL, SUPABASE_ANON);
  const screen = await fetchScreen(sb, SCREEN_KEY, {});

  async function refresh() {
    const pack = await fetchSlots(sb, screen);
    render(firstActiveGame(pack.slots));
  }

  await refresh();

  subscribeSelections(sb, screen.id, refresh);
  subscribeGames(sb, screen.id, refresh);
  subscribeScreenMeta(sb, screen.id, refresh);
})();