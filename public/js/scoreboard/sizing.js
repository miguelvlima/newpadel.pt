// /public/js/scoreboard/sizing.js
export function fitNames(tile){
  const namesCell = tile.querySelector('td.names');
  if (!namesCell) return;
  const lines = namesCell.querySelectorAll('.line');
  if (!lines.length) return;

  const boxRect = namesCell.getBoundingClientRect();
  const maxW = boxRect.width;
  const maxH = boxRect.height;

  const anyTooWide = () => [...lines].some(l => l.getBoundingClientRect().width > maxW - 1);
  const tooTall    = () => namesCell.scrollHeight > maxH + 0.5;

  const getVar = (name) => parseFloat(getComputedStyle(tile).getPropertyValue(name)) || 0;
  let fs = getVar('--fs-name') || 22;

  // cresce até “tocar” nos limites
  let grew=0;
  while (!anyTooWide() && !tooTall() && grew < 150){
    fs += 1;
    tile.style.setProperty('--fs-name', `${fs}px`);
    grew++;
  }

  // recua se passou
  let tries = 0;
  while ((anyTooWide() || tooTall()) && tries < 50){
    fs -= 1;
    tile.style.setProperty('--fs-name', `${fs}px`);
    tries++;
  }
}

export function fitBadges(tile){
  const left = tile.querySelector('.row .left'), right = tile.querySelector('.row .right');
  if (!left || !right) return;
  const court = tile.querySelector('.badge.court'); const status = tile.querySelector('.badge.status');
  const getVar = (name) => parseFloat(getComputedStyle(tile).getPropertyValue(name)) || 0;
  let fs = getVar('--fs-badge') || 14; let tries = 0;
  const over = () => (court && court.scrollWidth > left.clientWidth) || (status && status.scrollWidth > right.clientWidth);
  while (over() && fs > 10 && tries < 24){
    fs -= 1; tile.style.setProperty('--fs-badge', `${fs}px`); tries++;
  }
}

// Garante que cada célula tem <span class="num"> para podermos escalar
function ensureNumWrapperFor(cell){
  if (!cell) return null;
  let num = cell.querySelector('.num');
  if (!num){
    const text = cell.textContent;
    cell.textContent = '';
    num = document.createElement('span');
    num.className = 'num';
    num.textContent = text;
    cell.appendChild(num);
  }
  return num;
}

export function ensureNumWrappers(root){
  const cells = root.querySelectorAll('td.set .cell, td.now .cell-now');
  cells.forEach(c => ensureNumWrapperFor(c));
}

// Só encolhe para caber (não aumenta). Recria wrapper se tiver sido apagado num update.
export function scaleNumbersToFit(root){
  const cells = root.querySelectorAll('td.set .cell, td.now .cell-now');
  cells.forEach(cell => {
    const num = ensureNumWrapperFor(cell);
    if (!num) return;

    // reset e medir
    num.style.transform = 'scale(1)';
    const { width: cw, height: ch } = cell.getBoundingClientRect();
    const { width: nw, height: nh } = num.getBoundingClientRect();
    if (!cw || !ch || !nw || !nh) return;

    // margem 0.90 para não colar em glow/borda
    let s = 0.90 * Math.min(cw / nw, ch / nh);
    s = Math.min(1, Math.max(0.60, s));
    num.style.transform = `translateZ(0) scale(${s})`;
  });
}

// Fecha a altura das linhas com base na ALTURA REAL da tabela
export function setRowHeights(tile){
  const table = tile.querySelector('.scoretable');
  if (!table) return;

  const header = tile.querySelector('.row');
  const headerH = header ? header.getBoundingClientRect().height : 0;

  const csTile = getComputedStyle(tile);
  const padTop = parseFloat(csTile.paddingTop)  || 0;
  const padBot = parseFloat(csTile.paddingBottom) || 0;

  const csTable = getComputedStyle(table);
  const mt = parseFloat(csTable.marginTop)  || 0;
  const mb = parseFloat(csTable.marginBottom) || 0;

  const tileH  = tile.clientHeight;
  const tableH = Math.max(0, tileH - headerH - padTop - padBot - mt - mb);

  const thead  = table.tHead;
  const headH  = thead ? thead.getBoundingClientRect().height : 0;

  const rowsEl = table.tBodies[0]?.rows;
  const rows   = rowsEl?.length || 2;

  const gapV   = parseFloat(csTile.getPropertyValue('--gap-v')) || 0;
  const tbodyUsable = Math.max(0, tableH - headH - gapV * (rows - 1));

  const baseRowH = Math.floor(tbodyUsable / rows);
  const rowH     = Math.max(44, baseRowH + 2);

  tile.style.setProperty('--row-h', `${rowH}px`);
  if (rowsEl) [...rowsEl].forEach(tr => { tr.style.height = `${rowH}px`; });
}

/* Ajustes responsivos por tile */
const ro = new ResizeObserver((entries) => {
  for (const { target, contentRect } of entries) {
    const w = contentRect.width || 0, h = contentRect.height || 0;
    const base = Math.max(0, Math.min(w, h));
    const clamp = (v,min,max)=>Math.max(min,Math.min(max,v));

    // Nomes um pouco maiores; Sets ligeiramente mais comedidos para 2x2
    const fsName  = clamp(base * 0.30, 28, 160);
    const fsSet   = clamp(base * 0.38, 34, 200);
    const fsHead  = clamp(fsSet * 0.55, 12, 36);
    const fsBadge = clamp(base * 0.11, 12, 40);

    const gapV = clamp(base * 0.03, 8, 24);
    const padY = clamp(base * 0.045, 6, 22);
    const padX = clamp(base * 0.085, 8, 32);

    // Min-width mais baixo para caber em 4 tiles
    const setMinW = clamp(w * 0.20, 84, 260);

    target.style.setProperty('--fs-name',  `${fsName}px`);
    target.style.setProperty('--fs-set',   `${fsSet}px`);
    target.style.setProperty('--fs-now',   `${fsSet}px`);
    target.style.setProperty('--fs-head',  `${fsHead}px`);
    target.style.setProperty('--fs-badge', `${fsBadge}px`);
    target.style.setProperty('--gap-v',    `${gapV}px`);
    target.style.setProperty('--pad-cell-y', `${padY}px`);
    target.style.setProperty('--pad-cell-x', `${padX}px`);
    target.style.setProperty('--set-minw', `${setMinW}px`);

    // Pipeline consistente (fecha altura → cabe nomes → cabe números)
    if (target.dataset.sizingLock === '1') continue;
    target.dataset.sizingLock = '1';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        ensureNumWrappers(target);
        setRowHeights(target);
        fitNames(target);
        scaleNumbersToFit(target);
        fitBadges(target);
        delete target.dataset.sizingLock;
      });
    });
  }
});

export function watchTile(tile){
  if (tile.dataset.observed) return;
  ro.observe(tile);
  tile.dataset.observed = '1';
}
