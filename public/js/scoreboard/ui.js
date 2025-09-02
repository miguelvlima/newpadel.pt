// /public/js/scoreboard/ui.js
import { parseFormat, isSetConcluded, countWonSets, tennisPoint, isNormalTBActive, superTBActive } from './rules.js';
import { fitNames, fitBadges, fitTileVertically, watchTile, ensureNumWrappers, scaleNumbersToFit, setRowHeightVar } from './sizing.js';

let TILE_ELS = [];
let CURRENT_SLOTS = [];

export function getTileEls(){ return TILE_ELS; }
export function getCurrentSlots(){ return CURRENT_SLOTS; }
export function setCurrentSlots(s){ CURRENT_SLOTS = s; }

function computeGridFromPositions(n){
  const portrait = window.innerHeight >= window.innerWidth;
  if (n<=1) return [1,1];
  if (n===2) return portrait ? [1,2] : [2,1];
  return [2,2]; // 3 ou 4 -> 2x2
}

function escapeHtml(s=''){return s.replace(/[&<>\"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}

function computeShape(game){
  const cfg = parseFormat(game.format);
  const s   = game.score || {};
  const sets = Array.isArray(s.sets) ? s.sets.slice(0,3) : [];
  const cur  = s.current || {};

  const setConcluded = [0,1,2].map(i => isSetConcluded(sets[i], cfg, i));
  const currentIndex = setConcluded.filter(Boolean).length;
  const [w1, w2] = countWonSets(sets, cfg);
  const matchOver = (w1 >= cfg.setsToWinMatch) || (w2 >= cfg.setsToWinMatch);
  const normalTB  = isNormalTBActive(cur, cfg);
  const superTB   = superTBActive(sets, cfg, matchOver);
  const isRegularPlaying = !cfg.isProset && !normalTB && !superTB;

  let lastConcludedIndex = -1;
  for (let i=2;i>=0;i--){ if (setConcluded[i]) { lastConcludedIndex = i; break; } }
  if (cfg.isProset && setConcluded[0]) lastConcludedIndex = 0;

  let cols = [], titles = [];
  if (cfg.isProset){
    cols.push(0); titles.push('Proset');
  } else {
    if (setConcluded[0] || (isRegularPlaying && currentIndex === 0) || (normalTB && currentIndex === 0)){ cols.push(0); titles.push('1º Set'); }
    if (setConcluded[0] && (setConcluded[1] || (isRegularPlaying && currentIndex === 1) || (normalTB && currentIndex === 1))){ cols.push(1); titles.push('2º Set'); }
    if (!cfg.isSuper) {
      if (setConcluded[2] || (isRegularPlaying && currentIndex === 2) || (normalTB && currentIndex === 2)) { cols.push(2); titles.push('3º Set'); }
    } else {
      if (setConcluded[2]) { cols.push(2); titles.push('Super Tie-break'); }
    }
  }

  // jogos terminados: última coluna (último set disputado) encostada à direita
  if (matchOver && lastConcludedIndex >= 0){
    const outCols = [], outTitles = [];
    for (let k=0;k<cols.length;k++){
      if (cols[k] === lastConcludedIndex) continue;
      outCols.push(cols[k]); outTitles.push(titles[k]);
    }
    outCols.push(lastConcludedIndex);
    outTitles.push(cfg.isProset ? 'Proset' : (lastConcludedIndex===0?'1º Set':lastConcludedIndex===1?'2º Set':(cfg.isSuper?'Super Tie-break':'3º Set')));
    cols = outCols; titles = outTitles;
  }

  const showNow  = !matchOver;
  const nowTitle = superTB ? 'Super Tie-break' : (normalTB ? 'Tie-break' : 'Jogo');
  const shapeKey = [cfg.isProset?'P':'N', titles.join('|')||'-', `NOW=${showNow?1:0}`].join('#');

  return { cfg, sets, cur, setConcluded, currentIndex, matchOver, normalTB, superTB, isRegularPlaying, cols, titles, nowTitle, showNow, shapeKey };
}

function setCellVal(meta, i, team){
  const { cfg, sets, cur, currentIndex, normalTB, isRegularPlaying } = meta;
  const g1 = Number(cur.games_team1||0), g2 = Number(cur.games_team2||0);
  if (cfg.isProset){
    const ss = sets[i];
    if (isSetConcluded(ss, cfg, i)) return String(team===1?(ss?.team1 ?? g1):(ss?.team2 ?? g2));
    return String(team===1?g1:g2);
  }
  if (normalTB && i === currentIndex) return '6';
  if (isRegularPlaying && i === currentIndex) return String(team===1?g1:g2);
  const ss = sets[i];
  if (!ss || !isSetConcluded(ss, cfg, i)) return '';
  return String(team===1?(ss.team1 ?? ''):(ss.team2 ?? ''));
}

function buildTile(game){
  const meta = computeShape(game);
  const pair1a = escapeHtml(game.player1||''), pair1b=escapeHtml(game.player2||'');
  const pair2a = escapeHtml(game.player3||''), pair2b=escapeHtml(game.player4||'');
  const courtName = game.court_name ? `${escapeHtml(game.court_name)}` : (game.court_id ? `CAMPO ${escapeHtml(String(game.court_id)).slice(0,8)}` : '');

  const { cfg, sets, cur } = meta;
  const g1 = Number(cur.games_team1||0), g2 = Number(cur.games_team2||0);
  const tb1= Number(cur.tb_team1||0),    tb2= Number(cur.tb_team2||0);
  const p1 = Number(cur.points_team1||0),p2 = Number(cur.points_team2||0);
  let nowTop='', nowBot='';
  if (meta.superTB){ const base1=Number(sets?.[2]?.team1||0), base2=Number(sets?.[2]?.team2||0); nowTop=String(tb1||base1); nowBot=String(tb2||base2); }
  else if (meta.normalTB){ nowTop=String(tb1); nowBot=String(tb2); }
  else { nowTop=String(tennisPoint(p1, cfg.isGP)); nowBot=String(tennisPoint(p2, cfg.isGP)); }

  const anySetFinished = meta.setConcluded.some(Boolean);
  const anySetFilled   = sets.some(ss => (Number(ss?.team1||0)+Number(ss?.team2||0))>0);
  const hasCurrent     = (g1+g2+p1+p2+tb1+tb2)>0;
  const started        = anySetFinished || anySetFilled || hasCurrent;
  const statusText     = meta.matchOver ? 'TERMINADO' : (started ? 'AO VIVO' : 'PRÉ-JOGO');
  const statusInner    = (started && !meta.matchOver) ? '<span class="pulse">AO VIVO</span>' : statusText;

  const wrap = document.createElement('div');
  wrap.className='tile'; wrap.dataset.gameId=game.id; wrap.dataset.shapeKey=meta.shapeKey;

  const headerSetTh = meta.titles.map(t => `<th class="set">${t}</th>`).join('');
  const rowTopSets  = meta.cols.map(i => `<td class="set"><div class="cell"><span class="num">${setCellVal(meta,i,1)}</span></div></td>`).join('');
  const rowBotSets  = meta.cols.map(i => `<td class="set"><div class="cell"><span class="num">${setCellVal(meta,i,2)}</span></div></td>`).join('');
  const maybeNowHeader = meta.showNow ? `<th class="now">${meta.nowTitle}</th>` : '';
  const maybeNowTopTd  = meta.showNow ? `<td class="now"><div class="cell-now"><span class="num">${nowTop}</span></div></td>` : '';
  const maybeNowBotTd  = meta.showNow ? `<td class="now"><div class="cell-now"><span class="num">${nowBot}</span></div></td>` : '';

  wrap.innerHTML = `
    <div class="row">
      <div class="left">${courtName ? `<span class="badge court">${courtName}</span>` : `<span class="badge court">—</span>`}</div>
      <div class="right"><span class="badge status">${statusInner}</span></div>
    </div>

    <table class="scoretable" aria-label="Scoreboard do jogo">
      <thead>
        <tr>
          <th class="names"></th>
          <th class="flexfill"></th>
          ${headerSetTh}
          ${maybeNowHeader}
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="names"><div class="line">${pair1a}</div><div class="line">${pair1b}</div></td>
          <td class="flexfill"></td>
          ${rowTopSets}
          ${maybeNowTopTd}
        </tr>
        <tr>
          <td class="names"><div class="line">${pair2a}</div><div class="line">${pair2b}</div></td>
          <td class="flexfill"></td>
          ${rowBotSets}
          ${maybeNowBotTd}
        </tr>
      </tbody>
    </table>
  `;

  // ajustes finais
  requestAnimationFrame(() => {
    setRowHeightVar(wrap);
    watchTile(wrap);           // << observa tamanho do tile
    fitNames(wrap);
    fitBadges(wrap);
    fitTileVertically(wrap);
    scaleNumbersToFit(wrap);
    ensureNumWrappers(wrap);
  });

  return wrap;
}

function updateTile(el, game){
  const meta = computeShape(game);
  if (el.dataset.shapeKey !== meta.shapeKey){
    const rep = buildTile(game);
    el.replaceWith(rep);
    watchTile(rep);
    return rep;
  }

  el.dataset.gameId = game.id;
  // court
  const row = el.querySelector('.row');
  const courtBadge = row?.querySelector('.badge.court');
  const courtName = game.court_name ? `${escapeHtml(game.court_name)}` : (game.court_id ? `CAMPO ${escapeHtml(String(game.court_id)).slice(0,8)}` : '');
  if (courtBadge) courtBadge.textContent = courtName || '—';

  // status
  const anySetFinished = meta.setConcluded.some(Boolean);
  const anySetFilled   = meta.sets.some(ss => (Number(ss?.team1||0)+Number(ss?.team2||0))>0);
  const g1 = Number(meta.cur.games_team1||0), g2 = Number(meta.cur.games_team2||0);
  const tb1= Number(meta.cur.tb_team1||0),    tb2= Number(meta.cur.tb_team2||0);
  const p1 = Number(meta.cur.points_team1||0),p2 = Number(meta.cur.points_team2||0);
  const hasCurrent = (g1+g2+p1+p2+tb1+tb2)>0;
  const started    = anySetFinished || anySetFilled || hasCurrent;
  const statusText = meta.matchOver ? 'TERMINADO' : (started ? 'AO VIVO' : 'PRÉ-JOGO');
  const statusBadge = row?.querySelector('.badge.status');
  if (statusBadge) statusBadge.innerHTML = (started && !meta.matchOver) ? '<span class="pulse">AO VIVO</span>' : statusText;

  // nomes
  const [n1a,n1b,n2a,n2b] = [game.player1||'', game.player2||'', game.player3||'', game.player4||''].map(escapeHtml);
  const nameLines = el.querySelectorAll('td.names .line');
  if (nameLines[0]) nameLines[0].textContent = n1a;
  if (nameLines[1]) nameLines[1].textContent = n1b;
  if (nameLines[2]) nameLines[2].textContent = n2a;
  if (nameLines[3]) nameLines[3].textContent = n2b;

  // NOW header + values (se existir)
  const thNow = el.querySelector('th.now');
  if (thNow) thNow.textContent = meta.superTB ? 'Super Tie-break' : (meta.normalTB ? 'Tie-break' : 'Jogo');
  const nowNums = el.querySelectorAll('td.now .cell-now .num');
  if (nowNums.length){
    let top='', bot='';
    if (meta.superTB){ const base1=Number(meta.sets?.[2]?.team1||0), base2=Number(meta.sets?.[2]?.team2||0); top=String(tb1||base1); bot=String(tb2||base2); }
    else if (meta.normalTB){ top=String(tb1); bot=String(tb2); }
    else { top=String(tennisPoint(p1, meta.cfg.isGP)); bot=String(tennisPoint(p2, meta.cfg.isGP)); }
    if (nowNums[0]) nowNums[0].textContent = top;
    if (nowNums[1]) nowNums[1].textContent = bot;
  }

  // sets
  const setNums = el.querySelectorAll('td.set .cell .num');
  const n = meta.cols.length;
  for (let c = 0; c < n; c++) {
    const i = meta.cols[c];
    const topEl = setNums[c];
    const botEl = setNums[n + c];
    if (topEl) topEl.textContent = setCellVal(meta, i, 1);
    if (botEl) botEl.textContent = setCellVal(meta, i, 2);
  }


    ensureNumWrappers(el);

  requestAnimationFrame(() => {
    setRowHeightVar(wrap);
    watchTile(wrap);           // << observa tamanho do tile
    fitNames(wrap);
    fitBadges(wrap);
    fitTileVertically(wrap);
    scaleNumbersToFit(wrap);
    ensureNumWrappers(wrap);
  });
  return el;
}

/* placeholders */
function emptyTile(){
  const wrap = document.createElement('div');
  wrap.className='tile'; wrap.dataset.type='empty';
  wrap.innerHTML = `
    <div class="row">
      <div class="left"><span class="badge court">—</span></div>
      <div class="right"><span class="badge status">—</span></div>
    </div>
    <div class="placeholder">Sem jogo configurado</div>
  `;
  return wrap;
}

/* render principal */
export function buildOrUpdateGrid(grid, positions, slots, patch){
  const [cols, rows] = computeGridFromPositions(positions);
  grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  grid.style.gridTemplateRows    = `repeat(${rows}, 1fr)`;

  // patch update (evita flicker)
  if (patch && TILE_ELS.length === positions){
    const { patchIndex, patchGame } = patch;
    if (patchGame && Number.isInteger(patchIndex) && TILE_ELS[patchIndex]){
      const el = TILE_ELS[patchIndex];
      const rep = updateTile(el, { ...(slots[patchIndex]||{}), ...patchGame });
      TILE_ELS[patchIndex] = rep;
      slots[patchIndex] = { ...(slots[patchIndex]||{}), ...patchGame };
      return;
    }
  }

  // full build / rebuild
  if (TILE_ELS.length !== positions){
    grid.innerHTML='';
    TILE_ELS = Array.from({length: positions}, (_, i) => {
      const item = slots[i];
      const el = item ? buildTile(item) : emptyTile();
      grid.appendChild(el);
      watchTile(el);
      return el;
    });
    return;
  }

  // update por slot
  for (let i=0;i<positions;i++){
    const item = slots[i];
    const el = TILE_ELS[i];
    if (!item){
      if (el?.dataset?.type !== 'empty'){
        const rep = emptyTile();
        el.replaceWith(rep); TILE_ELS[i]=rep;
      }
      continue;
    }
    if (!el || el.dataset.type === 'empty' || el.dataset.gameId !== item.id){
      const rep = buildTile(item);
      if (el && el.parentNode) el.replaceWith(rep); else grid.appendChild(rep);
      TILE_ELS[i]=rep;
    } else {
      TILE_ELS[i] = updateTile(el, item);
    }
  }
}
