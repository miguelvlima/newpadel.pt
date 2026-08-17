// /public/js/scoreboard/ui.js
import { parseFormat, isSetConcluded, countWonSets, tennisPoint, isNormalTBActive, superTBActive } from './rules.js?v=5.4';
import { fitNames, fitBadges, watchTile, ensureNumWrappers, scaleNumbersToFit, setRowHeights } from './sizing.js?v=5.4';

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

function applyServerIndicator(rootEl, server) {
  const lines = rootEl.querySelectorAll('td.names .line');
  const s = Number(server); // 1..4
  lines.forEach((ln, idx) => {
    ln.classList.toggle('is-serving', s === (idx + 1));
  });
}


export function computeShape(game){
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
    const canShowLive = !matchOver; // ✅ não mostrar “set corrente” se já terminou

    if (
      setConcluded[0] ||
      (canShowLive && isRegularPlaying && currentIndex === 0) ||
      (canShowLive && normalTB && currentIndex === 0)
    ){
      cols.push(0); titles.push('1º Set');
    }

    if (
      setConcluded[0] &&
      (
        setConcluded[1] ||
        (canShowLive && isRegularPlaying && currentIndex === 1) ||
        (canShowLive && normalTB && currentIndex === 1)
      )
    ){
      cols.push(1); titles.push('2º Set');
    }

    if (!cfg.isSuper) {
      if (
        setConcluded[2] ||
        (canShowLive && isRegularPlaying && currentIndex === 2) ||
        (canShowLive && normalTB && currentIndex === 2)
      ) {
        cols.push(2); titles.push('3º Set');
      }
    } else {
      if (setConcluded[2]) { cols.push(2); titles.push('Super TB'); }
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
    outTitles.push(cfg.isProset ? 'Proset' : (lastConcludedIndex===0?'1º Set':lastConcludedIndex===1?'2º Set':(cfg.isSuper?'Super TB':'3º Set')));
    cols = outCols; titles = outTitles;
  }

  const showNow  = !matchOver;
  const nowTitle = superTB ? 'Super TB' : (normalTB ? 'Tie-break' : 'Jogo');
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

// ——— PROSET helpers ————————————————————————————————————————

function getProsetDisplay(meta){
  const s = meta?.sets?.[0];
  const a = Number(s?.team1 || 0);
  const b = Number(s?.team2 || 0);
  if (a || b) return [a, b]; // já fechado ou já com valores
  // fallback enquanto está a decorrer
  return [Number(meta?.cur?.games_team1 || 0), Number(meta?.cur?.games_team2 || 0)];
}

function isProsetFormat(game, meta){
  const f1 = String(game?.format || '').toLowerCase();
  const f2 = String(meta?.cfg?.format || meta?.cfg?.name || '').toLowerCase();
  if (f1.includes('proset') || f2.includes('proset')) return true;
  const t0 = (meta?.titles && meta.titles[0]) ? String(meta.titles[0]).toLowerCase() : '';
  return t0.includes('proset');
}

function isProsetTieBreak(game, meta){
  if (!isProsetFormat(game, meta)) return false;
  const g1 = Number(meta?.cur?.games_team1 || 0);
  const g2 = Number(meta?.cur?.games_team2 || 0);
  // TB em PROSET só existe quando o set está empatado a 8
  return g1 === 8 && g2 === 8 && !meta?.matchOver;
}

function isProsetFinished(game, meta){
  if (!isProsetFormat(game, meta)) return false;
  const s = meta?.sets?.[0] || {};
  const a = Number(s.team1 || 0);
  const b = Number(s.team2 || 0);
  // PROSET termina quando alguém tem pelo menos 9 e está à frente.
  // (ex.: 9–8 depois do TB)
  return (a >= 9 || b >= 9) && a !== b;
}





function buildTile(game){
  const meta = computeShape(game);

  const pair1a = escapeHtml(abbreviatePersonName(game.player1||'')), pair1b=escapeHtml(abbreviatePersonName(game.player2||''));
  const pair2a = escapeHtml(abbreviatePersonName(game.player3||'')), pair2b=escapeHtml(abbreviatePersonName(game.player4||''));

  const { cfg, sets, cur } = meta;
  const g1 = Number(cur.games_team1||0), g2 = Number(cur.games_team2||0);
  const tb1= Number(cur.tb_team1||0),    tb2= Number(cur.tb_team2||0);
  const p1 = Number(cur.points_team1||0),p2 = Number(cur.points_team2||0);

  // PROSET estado
  const prosetTB        = isProsetTieBreak(game, meta);
  const prosetFinished  = isProsetFinished(game, meta);

  // **decidimos localmente** se mostramos a coluna do "agora"
  const showNow = meta.superTB ? true : (prosetTB ? true : (!prosetFinished && !meta.matchOver));

  let nowTop='', nowBot='';
  if (meta.superTB){
    const base1=Number(sets?.[2]?.team1||0), base2=Number(sets?.[2]?.team2||0);
    nowTop=String(tb1||base1); nowBot=String(tb2||base2);
  } else if (prosetTB || meta.normalTB){
    nowTop=String(tb1); nowBot=String(tb2);
  } else {
    nowTop=String(tennisPoint(p1, cfg.isGP)); nowBot=String(tennisPoint(p2, cfg.isGP));
  }

  const anySetFinished = meta.setConcluded.some(Boolean);
  const anySetFilled   = meta.sets.some(ss => (Number(ss?.team1||0)+Number(ss?.team2||0))>0);
  const hasCurrent     = (g1+g2+p1+p2+tb1+tb2)>0;
  const started        = anySetFinished || anySetFilled || hasCurrent;

  // se prosetFinished, força TERMINADO
  const isOver         = meta.matchOver || prosetFinished;

  const nowLabel = meta.superTB ? 'Super TB' : (prosetTB || meta.normalTB ? 'TB' : 'JOGO');

  const wrap = document.createElement('div');
  wrap.className='tile';
  wrap.dataset.gameId=game.id;
  wrap.dataset.shapeKey=meta.shapeKey + (showNow ? ':now' : ':nonow'); // bloqueia “shape” quando entra/sai NOW
  wrap.classList.toggle('is-tb', (prosetTB || meta.normalTB));
  wrap.classList.toggle('is-live', started && !isOver);
  wrap.classList.toggle('is-over', isOver);
  wrap.classList.toggle('is-pregame', !started && !isOver);

  const headerSetTh = meta.titles.map(t => `<th class="set">${t}</th>`).join('');

  let rowTopSets = '';
  let rowBotSets = '';
  if (isProsetFormat(game, meta)) {
    // PROSET: escreve sempre o valor do set (fechado ou corrente)
    const [ps1, ps2] = getProsetDisplay(meta);
    rowTopSets = `<td class="set"><div class="cell"><span class="num">${ps1}</span></div></td>`;
    rowBotSets = `<td class="set"><div class="cell"><span class="num">${ps2}</span></div></td>`;
  } else {
    // restantes formatos: como tinhas
    rowTopSets = meta.cols.map(i => `<td class="set"><div class="cell"><span class="num">${setCellVal(meta,i,1)}</span></div></td>`).join('');
    rowBotSets = meta.cols.map(i => `<td class="set"><div class="cell"><span class="num">${setCellVal(meta,i,2)}</span></div></td>`).join('');
  }

  const maybeNowHeader = showNow ? `<th class="now">${nowLabel}</th>` : '';
  const maybeNowTopTd  = showNow ? `<td class="now"><div class="cell-now"><span class="num">${nowTop}</span></div></td>` : '';
  const maybeNowBotTd  = showNow ? `<td class="now"><div class="cell-now"><span class="num">${nowBot}</span></div></td>` : '';

  const gridEl = document.getElementById('grid');
  const brandCategory = gridEl?.dataset?.brandCategory || 'M2';
  const brandGroup = gridEl?.dataset?.brandGroup || 'Grupo A';
  const rawCourt = String(game.court_name || gridEl?.dataset?.screen || '').trim();
  const courtLabel = rawCourt
    ? `CAMPO ${rawCourt.replace(/^campo\s+/i, '').toUpperCase()}`
    : 'CAMPO —';

  wrap.innerHTML = `
    <div class="tile-content">
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
    </div>
    <footer class="tile-bar">
      <span class="tile-bar-court">${escapeHtml(courtLabel)}</span>
      <span class="tile-bar-meta">
        <span class="tile-bar-cat">${escapeHtml(brandCategory)}</span>
        <span class="tile-bar-sep" aria-hidden="true">·</span>
        <span class="tile-bar-group">${escapeHtml(brandGroup)}</span>
      </span>
    </footer>
  `;

  applyServerIndicator(wrap, game.server);

  requestAnimationFrame(() => {
    ensureNumWrappers(wrap);
    setRowHeights(wrap);
    fitNames(wrap);
    scaleNumbersToFit(wrap);
    watchTile(wrap);
  });

  return wrap;
}




function updateTile(el, game){
  const meta = computeShape(game);

  // mesma “shapeKey” + decisão local sobre NOW (evita layout marado)
  const prosetTB       = isProsetTieBreak(game, meta);
  const prosetFinished = isProsetFinished(game, meta);
  const showNow        = meta.superTB ? true : (prosetTB ? true : (!prosetFinished && !meta.matchOver));
  const newShapeKey    = meta.shapeKey + (showNow ? ':now' : ':nonow');

  if (el.dataset.shapeKey !== newShapeKey){
    const rep = buildTile(game);
    el.replaceWith(rep);
    watchTile(rep);
    return rep;
  }

  el.dataset.gameId = game.id;

  const gridEl = document.getElementById('grid');
  const brandCategory = gridEl?.dataset?.brandCategory || 'M2';
  const brandGroup = gridEl?.dataset?.brandGroup || 'Grupo A';
  const rawCourt = String(game.court_name || gridEl?.dataset?.screen || '').trim();
  const courtLabel = rawCourt
    ? `CAMPO ${rawCourt.replace(/^campo\s+/i, '').toUpperCase()}`
    : 'CAMPO —';
  const courtEl = el.querySelector('.tile-bar-court');
  const catEl = el.querySelector('.tile-bar-cat');
  const groupEl = el.querySelector('.tile-bar-group');
  if (courtEl) courtEl.textContent = courtLabel;
  if (catEl) catEl.textContent = brandCategory;
  if (groupEl) groupEl.textContent = brandGroup;

  const anySetFinished = meta.setConcluded.some(Boolean);
  const anySetFilled   = meta.sets.some(ss => (Number(ss?.team1||0)+Number(ss?.team2||0))>0);
  const g1 = Number(meta.cur.games_team1||0), g2 = Number(meta.cur.games_team2||0);
  const tb1= Number(meta.cur.tb_team1||0),    tb2= Number(meta.cur.tb_team2||0);
  const p1 = Number(meta.cur.points_team1||0),p2 = Number(meta.cur.points_team2||0);
  const hasCurrent = (g1+g2+p1+p2+tb1+tb2)>0;
  const started    = anySetFinished || anySetFilled || hasCurrent;

  const isOver     = meta.matchOver || prosetFinished;

  el.classList.toggle('is-live', started && !isOver);
  el.classList.toggle('is-over', isOver);
  el.classList.toggle('is-pregame', !started && !isOver);

  // nomes
  const [n1a,n1b,n2a,n2b] = [game.player1||'', game.player2||'', game.player3||'', game.player4||'']
    .map(abbreviatePersonName)
    .map(escapeHtml);
  const nameLines = el.querySelectorAll('td.names .line');
  if (nameLines[0]) nameLines[0].textContent = n1a;
  if (nameLines[1]) nameLines[1].textContent = n1b;
  if (nameLines[2]) nameLines[2].textContent = n2a;
  if (nameLines[3]) nameLines[3].textContent = n2b;

  applyServerIndicator(el, game.server);

  // NOW header + values (se existir)
  const thNow = el.querySelector('th.now');
  if (thNow){
    const wantLabel = meta.superTB ? 'Super TB' : (prosetTB || meta.normalTB ? 'TB' : 'JOGO');
    if (thNow.textContent !== wantLabel) thNow.textContent = wantLabel;
  }
  const nowNums = el.querySelectorAll('td.now .cell-now .num');
  if (nowNums.length){
    let top='', bot='';
    if (meta.superTB){
      const base1=Number(meta.sets?.[2]?.team1||0), base2=Number(meta.sets?.[2]?.team2||0);
      top=String(tb1||base1); bot=String(tb2||base2);
    } else if (prosetTB || meta.normalTB){
      top=String(tb1); bot=String(tb2);
    } else {
      top=String(tennisPoint(Number(meta.cur.points_team1||0), meta.cfg.isGP));
      bot=String(tennisPoint(Number(meta.cur.points_team2||0), meta.cfg.isGP));
    }
    if (nowNums[0]) nowNums[0].textContent = top;
    if (nowNums[1]) nowNums[1].textContent = bot;
  }

  // sets
  const setNums = el.querySelectorAll('td.set .cell .num');
  const n = meta.cols.length || 1;

  if (isProsetFormat(game, meta)) {
    // PROSET tem 1 coluna: índice 0 (top) e n+0 (bottom)
    const [ps1, ps2] = getProsetDisplay(meta);
    if (setNums[0]) setNums[0].textContent = ps1;
    if (setNums[n]) setNums[n].textContent = ps2;
  } else {
    for (let c = 0; c < n; c++) {
      const i = meta.cols[c];
      const topEl = setNums[c];
      const botEl = setNums[n + c];
      if (topEl) topEl.textContent = setCellVal(meta, i, 1);
      if (botEl) botEl.textContent = setCellVal(meta, i, 2);
    }
  }

  requestAnimationFrame(() => {
    ensureNumWrappers(el);
    setRowHeights(el);
    fitNames(el);
    scaleNumbersToFit(el);
  });
  return el;
}




/* placeholders */
function emptyTile(){
  const wrap = document.createElement('div');
  wrap.className='tile'; wrap.dataset.type='empty';
  const gridEl = document.getElementById('grid');
  const brandCategory = gridEl?.dataset?.brandCategory || 'M2';
  const brandGroup = gridEl?.dataset?.brandGroup || 'Grupo A';
  const rawCourt = String(gridEl?.dataset?.screen || '').trim();
  const courtLabel = rawCourt
    ? `CAMPO ${rawCourt.replace(/^campo\s+/i, '').toUpperCase()}`
    : 'CAMPO —';
  wrap.innerHTML = `
    <div class="tile-content">
      <div class="placeholder">Sem jogo configurado</div>
    </div>
    <footer class="tile-bar">
      <span class="tile-bar-court">${escapeHtml(courtLabel)}</span>
      <span class="tile-bar-meta">
        <span class="tile-bar-cat">${escapeHtml(brandCategory)}</span>
        <span class="tile-bar-sep" aria-hidden="true">·</span>
        <span class="tile-bar-group">${escapeHtml(brandGroup)}</span>
      </span>
    </footer>
  `;
  return wrap;
}

/* render principal */
export function buildOrUpdateGrid(grid, positions, slots, patch){
  const [cols, rows] = computeGridFromPositions(positions);
  grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  grid.style.gridTemplateRows    = `repeat(${rows}, 1fr)`;

  const fsMax =
  positions >= 3 ? 90 :      // 2x2 (4 tiles) → números com teto ~110px
  positions === 2 ? 160 :     // 1x2 ou 2x1 (2 tiles)
  220;                        // 1 tile (full-screen) → máximo

    grid.style.setProperty('--fs-set-max', `${fsMax}px`);

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


function compactEscape(v = '') {
  return String(v)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

const NAME_PARTICLES = new Set([
  'de', 'da', 'do', 'das', 'dos', 'e', 'del', 'della', 'di', 'du', 'van', 'von',
]);

function abbreviatePersonName(name = '') {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0];

  // apelido = última palavra que não é partícula (ignora "de", "da", ...)
  let surnameIdx = parts.length - 1;
  while (surnameIdx > 0 && NAME_PARTICLES.has(parts[surnameIdx].toLowerCase())) {
    surnameIdx -= 1;
  }

  const initial = parts[0].charAt(0).toUpperCase();
  return `${initial}. ${parts[surnameIdx]}`;
}

function compactTeamLabel(...rawNames) {
  const players = rawNames
    .flatMap((n) => String(n || '').split('/'))
    .map((s) => s.trim())
    .filter(Boolean);

  if (players.length === 0) return '';
  if (players.length === 1) return players[0];

  // dupla: abrevia ambos (E. Costa / N. Lopes)
  return players.map(abbreviatePersonName).join(' / ');
}

function compactPadSets(values) {
  const out = Array.isArray(values) ? values.slice(0, 3) : [];
  while (out.length < 3) out.push('');
  return out;
}

function compactVisibleSetCount(topSets, botSets) {
  const maxLen = Math.max(topSets.length, botSets.length, 1);

  for (let i = maxLen - 1; i >= 0; i--) {
    const topVal = String(topSets[i] ?? '').trim();
    const botVal = String(botSets[i] ?? '').trim();

    if (topVal !== '' || botVal !== '') {
      return i + 1;
    }
  }

  return 1;
}

function compactSetValues(game, meta, teamNo) {
  if (isProsetFormat(game, meta)) {
    const [ps1, ps2] = getProsetDisplay(meta);
    return compactPadSets([teamNo === 1 ? ps1 : ps2]);
  }

  const vals = (meta.cols || []).map(i => String(setCellVal(meta, i, teamNo) ?? ''));
  return compactPadSets(vals);
}

function compactNowValues(game, meta) {
  const { cfg, sets, cur } = meta;

  const tb1 = Number(cur.tb_team1 || 0);
  const tb2 = Number(cur.tb_team2 || 0);
  const p1 = Number(cur.points_team1 || 0);
  const p2 = Number(cur.points_team2 || 0);

  const prosetTB = isProsetTieBreak(game, meta);
  const prosetFinished = isProsetFinished(game, meta);
  const showNow = meta.superTB ? true : (prosetTB ? true : (!prosetFinished && !meta.matchOver));

  if (!showNow) return ['', ''];

  if (meta.superTB) {
    const base1 = Number(sets?.[2]?.team1 || 0);
    const base2 = Number(sets?.[2]?.team2 || 0);
    return [String(tb1 || base1), String(tb2 || base2)];
  }

  if (prosetTB || meta.normalTB) {
    return [String(tb1), String(tb2)];
  }

  return [
    String(tennisPoint(p1, cfg.isGP)),
    String(tennisPoint(p2, cfg.isGP)),
  ];
}

function compactRowHtml(name, sets, now, serving, setCount, setFlags = []) {
  const visibleSets = compactPadSets(sets).slice(0, setCount);
  const rowClass = `compact-row compact-row--sets-${setCount}`;

  return `
    <div class="${rowClass}">
      <div class="compact-name ${serving ? 'is-serving' : ''}"><span class="compact-name__text">${compactEscape(name)}</span></div>
      ${visibleSets
        .map((v, i) => {
          const flag = setFlags[i] || '';
          return `<div class="compact-set${flag ? ` ${flag}` : ''}">${compactEscape(v)}</div>`;
        })
        .join('')}
      <div class="compact-now">${compactEscape(now)}</div>
    </div>
  `;
}

export function fitCompactNames(root) {
  if (!root) return;

  root.querySelectorAll('.compact-name').forEach((cell) => {
    const text = cell.querySelector('.compact-name__text');
    if (!text) return;

    cell.style.fontSize = '';
    let fs = parseFloat(getComputedStyle(cell).fontSize) || 22;
    cell.style.fontSize = `${fs}px`;

    while (fs > 12 && text.scrollWidth > text.clientWidth + 1) {
      fs -= 1;
      cell.style.fontSize = `${fs}px`;
    }
  });
}

export function buildOrUpdateCompactGrid(grid, positions, slots, patch) {
  if (!grid) return;

  const list = Array.isArray(slots) ? [...slots] : [];

  if (patch && Number.isInteger(patch.patchIndex) && patch.patchGame) {
    const i = patch.patchIndex;
    if (i >= 0 && i < list.length) {
      list[i] = { ...(list[i] || {}), ...patch.patchGame };
    }
  }

  const game = list.find(Boolean) || null;

  if (!game) {
    grid.innerHTML = '';
    return;
  }

  const brand = {
    logo: grid.dataset.brandLogo || '/images/tournaments/3-open-dos-ouricos-logo.png',
    category: grid.dataset.brandCategory || 'M2',
    group: grid.dataset.brandGroup || 'Grupo A',
  };

  const meta = computeShape(game);

  const topName = compactTeamLabel(game.player1, game.player2);
  const botName = compactTeamLabel(game.player3, game.player4);

  const topSets = compactSetValues(game, meta, 1);
  const botSets = compactSetValues(game, meta, 2);
  const setCount = compactVisibleSetCount(topSets, botSets);

  const [topNow, botNow] = compactNowValues(game, meta);

  const topServing = Number(game.server) === 1 || Number(game.server) === 2;
  const botServing = Number(game.server) === 3 || Number(game.server) === 4;

  grid.style.display = 'block';
  grid.style.gridTemplateColumns = '';
  grid.style.gridTemplateRows = '';

  const anySetFinished = meta.setConcluded.some(Boolean);
  const anySetFilled = meta.sets.some(ss => (Number(ss?.team1 || 0) + Number(ss?.team2 || 0)) > 0);
  const g1 = Number(meta.cur.games_team1 || 0);
  const g2 = Number(meta.cur.games_team2 || 0);
  const tb1 = Number(meta.cur.tb_team1 || 0);
  const tb2 = Number(meta.cur.tb_team2 || 0);
  const p1 = Number(meta.cur.points_team1 || 0);
  const p2 = Number(meta.cur.points_team2 || 0);
  const hasCurrent = (g1 + g2 + p1 + p2 + tb1 + tb2) > 0;
  const started = anySetFinished || anySetFilled || hasCurrent;
  const prosetFinished = isProsetFinished(game, meta);
  const isOver = meta.matchOver || prosetFinished;
  const boardState = isOver ? 'is-over' : (started ? 'is-live' : 'is-pregame');

  const topVisible = compactPadSets(topSets).slice(0, setCount);
  const botVisible = compactPadSets(botSets).slice(0, setCount);
  const topFlags = [];
  const botFlags = [];
  for (let i = 0; i < setCount; i++) {
    const a = String(topVisible[i] ?? '').trim();
    const b = String(botVisible[i] ?? '').trim();
    const aNum = Number(a);
    const bNum = Number(b);
    const bothNumeric = a !== '' && b !== '' && Number.isFinite(aNum) && Number.isFinite(bNum);
    const isLast = i === setCount - 1;
    if (!isOver && isLast && started) {
      topFlags[i] = 'is-live';
      botFlags[i] = 'is-live';
    } else if (bothNumeric && aNum !== bNum) {
      topFlags[i] = aNum > bNum ? 'is-won' : '';
      botFlags[i] = bNum > aNum ? 'is-won' : '';
    } else {
      topFlags[i] = '';
      botFlags[i] = '';
    }
  }

  const rawCourt = String(game.court_name || grid.dataset.screen || '').trim();
  const courtLabel = rawCourt
    ? `CAMPO ${rawCourt.replace(/^campo\s+/i, '').toUpperCase()}`
    : 'CAMPO —';

  grid.innerHTML = `
    <section class="compact-board ${boardState}">
      <aside class="compact-brand">
        <img class="compact-brand-logo" src="${compactEscape(brand.logo)}" alt="" />
      </aside>
      <div class="compact-rows">
        ${compactRowHtml(topName, topSets, topNow, topServing, setCount, topFlags)}
        ${compactRowHtml(botName, botSets, botNow, botServing, setCount, botFlags)}
      </div>
      <footer class="compact-bar">
        <span class="compact-bar-court">${compactEscape(courtLabel)}</span>
        <span class="compact-bar-meta">
          <span class="compact-bar-cat">${compactEscape(brand.category)}</span>
          <span class="compact-bar-sep" aria-hidden="true">·</span>
          <span class="compact-bar-group">${compactEscape(brand.group)}</span>
        </span>
      </footer>
    </section>
  `;

  fitCompactNames(grid);
}
