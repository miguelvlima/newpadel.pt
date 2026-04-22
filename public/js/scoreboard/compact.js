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

function currentSet(game) {
  // fallback simples; se quiseres, podes alinhar isto 100% com a lógica de computeShape(ui.js)
  const s1a = Number(game.set1_team1 || 0);
  const s1b = Number(game.set1_team2 || 0);
  const s2a = Number(game.set2_team1 || 0);
  const s2b = Number(game.set2_team2 || 0);
  const s3a = Number(game.set3_team1 || 0);
  const s3b = Number(game.set3_team2 || 0);

  if (s3a || s3b) return [s3a, s3b];
  if (s2a || s2b) return [s2a, s2b];
  return [s1a, s1b];
}

function currentPoints(game) {
  // tenta usar games correntes; ajusta os campos se o payload vier com outro naming
  const a = Number(game.games_team1 ?? game.current_games_team1 ?? 0);
  const b = Number(game.games_team2 ?? game.current_games_team2 ?? 0);
  return [a, b];
}

function matchStatus(game) {
  if (game.match_over) return 'Terminado';
  const hasStarted =
    Number(game.games_team1 || 0) ||
    Number(game.games_team2 || 0) ||
    Number(game.points_team1 || 0) ||
    Number(game.points_team2 || 0) ||
    Number(game.set1_team1 || 0) ||
    Number(game.set1_team2 || 0);

  return hasStarted ? 'Ao vivo' : 'Pré-jogo';
}

function render(game) {
  if (!game) {
    root.innerHTML = `<div class="compact-card is-empty">Sem jogo configurado</div>`;
    return;
  }

  const [setTop, setBot] = currentSet(game);
  const [scoreTop, scoreBot] = currentPoints(game);
  const status = matchStatus(game);

  const topServing = String(game.server || '') === 'team1';
  const botServing = String(game.server || '') === 'team2';

  root.innerHTML = `
    <section class="compact-card">
      <div class="meta-bar">
        <div class="meta-left">
          <span>${safe(game.court_name || 'Campo')}</span>
          <span class="badge-live">${safe(status)}</span>
        </div>
        <div>${safe(SCREEN_KEY)}</div>
      </div>

      <div class="compact-grid">
        <div class="team">
          <div class="team-name ${topServing ? 'is-serving' : ''}">${safe(teamName(game, true))}</div>
          <div class="team-set set-header">${safe(setTop)}</div>
          <div class="team-score">${safe(scoreTop)}</div>
        </div>

        <div class="team">
          <div class="team-name ${botServing ? 'is-serving' : ''}">${safe(teamName(game, false))}</div>
          <div class="team-set">${safe(setBot)}</div>
          <div class="team-score">${safe(scoreBot)}</div>
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