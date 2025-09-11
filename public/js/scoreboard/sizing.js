// /public/js/scoreboard/sizing.js

/* ================== Nomes ================== */
export function fitNames(tile){
  const namesCell = tile.querySelector('td.names');
  if (!namesCell) return;
  const lines = namesCell.querySelectorAll('.line');
  if (!lines.length) return;

  const csTile  = getComputedStyle(tile);
  const rowH    = parseFloat(csTile.getPropertyValue('--row-h')) || namesCell.clientHeight || 0;
  const maxFsByRow = Math.max(12, rowH * 0.48);

  let fs = parseFloat(csTile.getPropertyValue('--fs-name')) || 22;
  fs = Math.min(fs, maxFsByRow);
  tile.style.setProperty('--fs-name', `${fs}px`);

  const tooWide = () => [...lines].some(l => l.scrollWidth > namesCell.clientWidth - 1);
  const tooTall = () => namesCell.scrollHeight > namesCell.clientHeight + 0.5;

  let tries = 0;
  while ((tooWide() || tooTall()) && fs > 12 && tries < 100){
    fs -= 1;
    tile.style.setProperty('--fs-name', `${fs}px`);
    tries++;
  }
}

/* ================== Títulos do thead ================== */
export function fitHeadings(tile){
  const ths = tile.querySelectorAll('thead th.set, thead th.now');
  if (!ths.length) return;

  const getVar = (n) => parseFloat(getComputedStyle(tile).getPropertyValue(n)) || 0;
  let fs = getVar('--fs-head') || 12;

  const over = () => [...ths].some(th => th.scrollWidth > th.clientWidth);
  let tries = 0;
  while (over() && fs > 10 && tries < 30){
    fs -= 1;
    tile.style.setProperty('--fs-head', `${fs}px`);
    tries++;
  }
}

/* ================== Badges do header ================== */
export function fitBadges(tile){
  const left = tile.querySelector('.row .left');
  const right = tile.querySelector('.row .right');
  if (!left || !right) return;
  const court = tile.querySelector('.badge.court');
  const status = tile.querySelector('.badge.status');

  const getVar = (n) => parseFloat(getComputedStyle(tile).getPropertyValue(n)) || 0;
  let fs = getVar('--fs-badge') || 14;
  let tries = 0;
  const over = () =>
    (court && court.scrollWidth > left.clientWidth) ||
    (status && status.scrollWidth > right.clientWidth);

  while (over() && fs > 10 && tries < 24){
    fs -= 1;
    tile.style.setProperty('--fs-badge', `${fs}px`);
    tries++;
  }
}

/* ================== Garantir <span class="num"> ================== */
export function ensureNumWrappers(root){
  const cells = root.querySelectorAll('td.set .cell, td.now .cell-now');
  cells.forEach(cell => {
    if (!cell) return;
    if (cell.querySelector('.num')) return;
    const text = cell.textContent;
    cell.textContent = '';
    const span = document.createElement('span');
    span.className = 'num';
    span.textContent = text;
    cell.appendChild(span);
  });
}

/* ================== Escalar números p/ caber ================== */
export function scaleNumbersToFit(root, _rerun = false){
  const cells = root.querySelectorAll('td.set .cell, td.now .cell-now');
  if (!cells.length) return;

  const SAFE = 0.94;
  const css  = getComputedStyle(root);

  // largura atual (real, se não houver var)
  let setW = parseFloat(css.getPropertyValue('--set-w')) || 0;
  if (!setW) {
    const sample = root.querySelector('td.set .cell, td.now .cell-now');
    if (sample) setW = sample.clientWidth || 0;
  }

  // limites por tile (não roubar demasiado aos nomes)
  const tileW = root.getBoundingClientRect().width || 0;
  const thSet = root.querySelectorAll('thead th.set').length;
  const thNow = root.querySelector('thead th.now') ? 1 : 0;
  const nRes  = Math.max(1, thSet + thNow);

  const namesMinFrac = 0.40;
  const spacerFrac   = 0.03;
  const maxPerSet    = Math.max(48, ((tileW * (1 - namesMinFrac)) - (tileW * spacerFrac)) / nRes);

  const ABS_MIN = 64;
  const ABS_MAX = 200; // podes subir para 220 se quiseres mais largo

  let neededW = setW;

  cells.forEach(cell => {
    const num = cell.querySelector('.num');
    if (!num) return;

    // reset total para medir
    num.style.transform = 'none';
    cell.style.overflow = 'hidden';

    // mede área útil (sem padding)
    const cs = getComputedStyle(cell);
    const pl = parseFloat(cs.paddingLeft)   || 0;
    const pr = parseFloat(cs.paddingRight)  || 0;
    const pt = parseFloat(cs.paddingTop)    || 0;
    const pb = parseFloat(cs.paddingBottom) || 0;

    const cw = Math.max(0, cell.clientWidth  - pl - pr);
    const ch = Math.max(0, cell.clientHeight - pt - pb);

    const r  = num.getBoundingClientRect();
    if (!cw || !ch || !r.width || !r.height) return;

    // preferir altura (uniformiza 1/2 dígitos)
    const scaleByH   = SAFE * (ch / r.height);
    const scaleCap   = 1.22; // tampa crescimento anómalo
    const scaleH     = Math.min(scaleByH, scaleCap);
    const widthAfter = r.width * scaleH;

    if (widthAfter <= cw){
      num.style.transform = `translateZ(0) scale(${scaleH})`;
    } else {
      // não cabe em largura → regista largura necessária e encolhe por largura
      neededW = Math.max(neededW, Math.ceil(widthAfter + 2));
      const scaleByW = SAFE * (cw / r.width);
      num.style.transform = `translateZ(0) scale(${scaleByW})`;
    }
  });

  // se precisar, alarga a coluna (sem passar limites)
  const clampedNeeded = Math.max(ABS_MIN, Math.min(neededW, Math.min(maxPerSet, ABS_MAX)));
  const lastGrown = parseFloat(root.dataset.lastSetW || '0');

  if (clampedNeeded > (setW || 0) + 1 && clampedNeeded > lastGrown + 1 && !_rerun) {
    root.dataset.lastSetW = String(clampedNeeded);
    root.style.setProperty('--set-w', `${Math.round(clampedNeeded)}px`);
    requestAnimationFrame(() => scaleNumbersToFit(root, true));
  } else if (_rerun) {
    delete root.dataset.lastSetW;
  }
}

/* ================== Altura por linha ================== */
export function setRowHeights(tile){
  const table  = tile.querySelector('.scoretable');
  if (!table) return;

  // área útil do tile
  const csTile = getComputedStyle(tile);
  const padTop = parseFloat(csTile.paddingTop)    || 0;
  const padBot = parseFloat(csTile.paddingBottom) || 0;
  const tileH  = tile.clientHeight - padTop - padBot;

  // header (badges)
  const headerH = tile.querySelector('.row')?.getBoundingClientRect().height || 0;

  // margens e cabeçalho da tabela
  const csTable = getComputedStyle(table);
  const mt = parseFloat(csTable.marginTop)    || 0;
  const mb = parseFloat(csTable.marginBottom) || 0;
  const theadH = table.tHead ? table.tHead.getBoundingClientRect().height : 0;

  // altura útil
  const safety = 24; // extra para bordas/pixel snapping
  const tbodyUsable = Math.max(0, tileH - headerH - mt - mb - theadH - safety);

  const rowsEl = table.tBodies[0]?.rows;
  const rows   = rowsEl?.length || 2;
  const rowH   = Math.max(44, Math.floor(tbodyUsable / rows));

  tile.style.setProperty('--row-h', `${rowH}px`);
  if (rowsEl) [...rowsEl].forEach(tr => { tr.style.height = `${rowH}px`; });
}

/* ================== ResizeObserver 2-pass ================== */
const ro = new ResizeObserver((entries) => {
  for (const { target, contentRect } of entries) {
    const w = contentRect.width  || 0;
    const h = contentRect.height || 0;
    const base = Math.max(0, Math.min(w, h));
    const clamp = (v,min,max)=>Math.max(min,Math.min(max,v));

    const css = getComputedStyle(target);

    // === tamanhos base (derivados da menor dimensão do tile) ===
    const fsName   = clamp(base * 0.28, 36, 120);
    const fsSetMax = parseFloat(css.getPropertyValue('--fs-set-max')) || 220;
    const fsSet    = clamp(base * 0.40, 36, fsSetMax);
    const fsHead   = clamp(fsSet * 0.55, 12, 36);
    const fsBadge  = clamp(base * 0.11, 12, 40);
    const gapV     = clamp(base * 0.03, 8, 28);
    const padY     = clamp(base * 0.045, 8, 26);
    const padX     = clamp(base * 0.085, 10, 40);

    // === cálculo da largura-base de cada coluna de resultados ===
    const thSet  = target.querySelectorAll('thead th.set').length;
    const thNow  = target.querySelector('thead th.now') ? 1 : 0;
    const nRes   = Math.max(1, thSet + thNow);

    const namesMinFrac = 0.40;
    const spacerFrac   = 0.03;
    const fracPerSet   = (nRes >= 4) ? 0.14 : (nRes === 3 ? 0.16 : 0.18);

    const desiredSetW = w * fracPerSet;
    const maxSetsArea = (w * (1 - namesMinFrac)) - (w * spacerFrac);
    const maxPerSet   = maxSetsArea / nRes;
    const baseSetW    = clamp(Math.floor(Math.min(desiredSetW, maxPerSet)), 72, 200);

    // === aplicar variáveis base do tile ===
    target.style.setProperty('--fs-name',  `${fsName}px`);
    target.style.setProperty('--fs-set',   `${fsSet}px`);
    target.style.setProperty('--fs-now',   `${fsSet}px`);
    target.style.setProperty('--fs-head',  `${fsHead}px`);
    target.style.setProperty('--fs-badge', `${fsBadge}px`);
    target.style.setProperty('--gap-v',    `${gapV}px`);
    target.style.setProperty('--pad-cell-y', `${padY}px`);
    target.style.setProperty('--pad-cell-x', `${padX}px`);

    // === largura das colunas de resultados (não encolher à toa) ===
    const prevComputed = parseFloat(css.getPropertyValue('--set-w')) || 0;
    // cap do anterior pelo máximo permitido no layout atual
    const prevCap = prevComputed ? Math.min(prevComputed, clamp(Math.floor(maxPerSet), 72, 200)) : 0;

    // escolhe o MAIOR entre o base atual e o anterior capado → evita encolher em FS
    const nextSetW = Math.max(baseSetW, prevCap || 0);
    target.style.setProperty('--set-w', `${Math.round(nextSetW)}px`);

    // === evitar reentrância enquanto fazemos o fit ===
    if (target.dataset.sizingLock === '1') continue;
    target.dataset.sizingLock = '1';

    // PASSO 1: fecha altura e encolhe topo (headings/badges)
    requestAnimationFrame(() => {
      setRowHeights(target);
      fitHeadings(target);
      fitBadges(target);

      // PASSO 2: fecha altura de novo, nomes e números
      requestAnimationFrame(() => {
        setRowHeights(target);
        fitNames(target);
        ensureNumWrappers(target);
        scaleNumbersToFit(target);
        delete target.dataset.sizingLock;
      });
    });
  }
});

/* ================== watch ================== */
export function watchTile(tile){
  if (tile.dataset.observed) return;
  ro.observe(tile);
  tile.dataset.observed = '1';
}
