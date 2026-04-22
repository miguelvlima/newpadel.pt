import {
  initSupabase,
  fetchScreen,
  fetchSlots,
  subscribeSelections,
  subscribeGames,
  subscribeScreenMeta
} from './supabase-api.js';

import { computeShape } from './ui.js';

const root = document.getElementById('compact-scoreboard');

const sb = initSupabase(
  root.dataset.sbUrl,
  root.dataset.sbAnon
);

const screenKey = root.dataset.screen;

let screen = null;

function esc(v=''){
  return String(v)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;');
}

function firstGame(slots){
  return slots?.find(x => x?.game) || slots?.[0] || null;
}

function rowHtml(name, values, current, serving){

  return `
  <div class="row">

    <div class="name ${serving ? 'serving':''}">
      ${esc(name)}
    </div>

    ${values.map(v => `<div class="set">${v}</div>`).join('')}

    <div class="game">${current}</div>

  </div>
  `;
}

function render(game){

  if(!game){
    root.innerHTML = '';
    return;
  }

  const shape = computeShape(game);

  const topName =
    `${game.player1 || ''} / ${game.player2 || ''}`;

  const botName =
    `${game.player3 || ''} / ${game.player4 || ''}`;

  const topSets = shape.rows[0].sets;
  const botSets = shape.rows[1].sets;

  const topCurrent = shape.rows[0].now;
  const botCurrent = shape.rows[1].now;

  root.innerHTML = `
    <section class="compact-card">

      ${rowHtml(
        topName,
        topSets,
        topCurrent,
        game.server === 'team1'
      )}

      ${rowHtml(
        botName,
        botSets,
        botCurrent,
        game.server === 'team2'
      )}

    </section>
  `;
}

async function refresh(){

  const pack = await fetchSlots(sb, screen);

  const slot = firstGame(pack.slots);

  if(slot?.game){
    render(slot.game);
  }
}

(async()=>{

  screen = await fetchScreen(sb, screenKey, {});

  await refresh();

  subscribeSelections(sb, screen.id, refresh);
  subscribeGames(sb, screen.id, refresh);
  subscribeScreenMeta(sb, screen.id, refresh);

})();