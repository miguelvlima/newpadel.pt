// /public/js/scoreboard/sizing.js
// sizing.js
export function fitNames(tile){
  const namesCell = tile.querySelector('td.names');
  if (!namesCell) return;
  const lines = namesCell.querySelectorAll('.line');
  if (!lines.length) return;

  const csTile = getComputedStyle(tile);
  const csNames = getComputedStyle(namesCell);

  // Altura fixa da linha (já calculada por setRowHeights)
  const rowH = parseFloat(csTile.getPropertyValue('--row-h')) || namesCell.clientHeight || 0;

  // Limite superior seguro para o font-size dos nomes (diacríticos incluídos)
  const maxFsByRow = Math.max(12, rowH * 0.48);

  // Começa no valor atual mas NUNCA acima do permitido pela altura da linha
  let fs = parseFloat(csTile.getPropertyValue('--fs-name')) || 22;
  fs = Math.min(fs, maxFsByRow);
  tile.style.setProperty('--fs-name', `${fs}px`);

  // Helpers (usar dimensões ATUAIS do namesCell)
  const tooWide = () => [...lines].some(l => l.scrollWidth > namesCell.clientWidth - 1);
  const tooTall = () => namesCell.scrollHeight > namesCell.clientHeight + 0.5;

  // Só encolhe até caber em largura/altura
  let tries = 0;
  while ((tooWide() || tooTall()) && fs > 12 && tries < 100){
    fs -= 1;
    tile.style.setProperty('--fs-name', `${fs}px`);
    tries++;
  }
}



export function fitBadges(tile){
  const left = tile.querySelector('.row .left'), right = tile.querySelector('.row .right');
  if (!left || !right) return;
  const court = tile.querySelector('.badge.court'); const status = tile.querySelector('.badge.status');
  const root = tile;
  const getVar = (name) => parseFloat(getComputedStyle(root).getPropertyValue(name)) || 0;
  let fs = getVar('--fs-badge') || 14; let tries = 0;
  const over = () => (court && court.scrollWidth > left.clientWidth) || (status && status.scrollWidth > right.clientWidth);
  while (over() && fs > 10 && tries < 24){
    fs -= 1; root.style.setProperty('--fs-badge', `${fs}px`); tries++;
  }
}

export function ensureNumWrappers(root){
  const cells = root.querySelectorAll('td.set .cell, td.now .cell-now');
  cells.forEach(cell => {
    if (!cell) return;
    // já tem wrapper?
    if (cell.querySelector('.num')) return;
    // só texto? embrulhamos
    const text = cell.textContent;
    cell.textContent = '';
    const span = document.createElement('span');
    span.className = 'num';
    span.textContent = text;
    cell.appendChild(span);
  });
}

// sizing.js
export function scaleNumbersToFit(root){
  const cells = root.querySelectorAll('td.set .cell, td.now .cell-now');
  cells.forEach(cell => {
    const num = cell.querySelector('.num');
    if (!num) return;

    // reset p/ medir
    num.style.transform = 'scale(1)';

    const { width: cw, height: ch } = cell.getBoundingClientRect();
    const { width: nw, height: nh } = num.getBoundingClientRect();
    if (!cw || !ch || !nw || !nh) return;

    // margem para não colar nas bordas/glow
    const ratio = 0.96 * Math.min(cw / nw, ch / nh);

    // agora PODE crescer: até 1.6 (ajusta se quiseres)
    const MAX_GROW   = 1.6;
    const MIN_SHRINK = 0.60;

    const s = Math.max(MIN_SHRINK, Math.min(MAX_GROW, ratio));
    num.style.transform = `translateZ(0) scale(${s})`;
  });
}

// sizing.js
export function setRowHeights(tile){
  const table = tile.querySelector('.scoretable');
  if (!table) return;

  // 1) mede header (badges) e paddings do tile
  const headerH = tile.querySelector('.row')?.getBoundingClientRect().height || 0;
  const csTile  = getComputedStyle(tile);
  const padTop  = parseFloat(csTile.paddingTop)  || 0;
  const padBot  = parseFloat(csTile.paddingBottom) || 0;

  // 2) mede margens da tabela (contam para dentro do tile)
  const csTable = getComputedStyle(table);
  const mt = parseFloat(csTable.marginTop)  || 0;
  const mb = parseFloat(csTable.marginBottom) || 0;

  // 3) altura total do tile e do cabeçalho da tabela
  const tileH  = tile.getBoundingClientRect().height;
  const headH  = table.tHead?.getBoundingClientRect().height || 0;

  // 4) linhas e gaps
  const rowsEl = table.tBodies[0]?.rows;
  const rows   = rowsEl?.length || 2;
  const gapV   = parseFloat(csTile.getPropertyValue('--gap-v')) || 0;

  // 5) altura útil para o tbody
  const usable = Math.max(0, tileH - headerH - padTop - padBot - mt - mb - headH - gapV*(rows-1));
  const rowH   = Math.max(44, Math.floor(usable / rows)); // margem p/ diacríticos

  tile.style.setProperty('--row-h', `${rowH}px`);
  if (rowsEl) [...rowsEl].forEach(tr => tr.style.height = `${rowH}px`);
}


// --- ResizeObserver que repõe as variáveis por TILE ---
const ro = new ResizeObserver((entries) => {
  for (const { target, contentRect } of entries) {
    const w = contentRect.width || 0, h = contentRect.height || 0;
    const base = Math.max(0, Math.min(w, h));
    const clamp = (v,min,max)=>Math.max(min,Math.min(max,v));

    const setW = clamp(contentRect.width * 0.30, 90, 250);
    const fsName  = clamp(base * 0.28, 36, 120);
    const fsSet   = clamp(base * 0.40, 50, 220);
    const fsHead  = clamp(fsSet * 0.55, 12, 36);
    const fsBadge = clamp(base * 0.11, 12, 40);

    const gapV = clamp(base * 0.03, 8, 28);
    const padY = clamp(base * 0.045, 8, 26);
    const padX = clamp(base * 0.085, 10, 40);
    const setMinW = clamp(w * 0.22, 110, 320);

    target.style.setProperty('--fs-name',  `${fsName}px`);
    target.style.setProperty('--fs-set',   `${fsSet}px`);
    target.style.setProperty('--fs-now',   `${fsSet}px`);
    target.style.setProperty('--fs-head',  `${fsHead}px`);
    target.style.setProperty('--fs-badge', `${fsBadge}px`);
    target.style.setProperty('--gap-v',    `${gapV}px`);
    target.style.setProperty('--pad-cell-y', `${padY}px`);
    target.style.setProperty('--pad-cell-x', `${padX}px`);
    target.style.setProperty('--set-minw', `${setMinW}px`);
    target.style.setProperty('--set-w', `${setW}px`);

    if (target.dataset.sizingLock === '1') continue;
    target.dataset.sizingLock = '1';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        ensureNumWrappers(target);
        setRowHeights(target);       // <- primeiro fechamos a altura
        fitNames(target);
        scaleNumbersToFit(target);   // <- depois cabemos o número na célula
        fitBadges(target);
        delete target.dataset.sizingLock;
      });
    });

  }
});

// expõe para o UI observar cada tile
export function watchTile(tile){
  if (tile.dataset.observed) return;
  ro.observe(tile);
  tile.dataset.observed = '1';
}
