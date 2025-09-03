// /public/js/scoreboard/sizing.js
export function fitNames(tile){
  const namesCell = tile.querySelector('td.names');
  if (!namesCell) return;
  const lines = namesCell.querySelectorAll('.line');
  if (!lines.length) return;

  // Mede a caixa disponível para os nomes
  const boxRect = namesCell.getBoundingClientRect();
  const maxW = boxRect.width;
  const maxH = boxRect.height;

  // Helpers (com pequena folga para evitar “colar”)
  const anyTooWide = () =>
    [...lines].some(l => l.getBoundingClientRect().width > maxW - 1);
  const tooTall = () =>
    namesCell.scrollHeight > maxH + 0.5;

  const getVar = (name) => parseFloat(getComputedStyle(tile).getPropertyValue(name)) || 0;
  let fs = getVar('--fs-name') || 22;

  let grew=0;
  while ((!anyTooWide() && !tooTall()) && grew < 150){
    fs += 1;
    tile.style.setProperty('--fs-name', `${fs}px`);
    grew++;
  }

  let tries = 0;
  while ((tooWide() || tooTall()) && tries < 50){
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

export function scaleNumbersToFit(root){
  const cells = root.querySelectorAll('td.set .cell, td.now .cell-now');
  cells.forEach(cell => {
    const num = cell.querySelector('.num');
    if (!num) return;

    num.style.transform = 'scale(1)';

    const { width: cw, height: ch } = cell.getBoundingClientRect();
    const { width: nw, height: nh } = num.getBoundingClientRect();
    if (!cw || !ch || !nw || !nh) return;

    // só encolhe; pequena margem 0.96 para não colar na borda/glow
    const shrink = 0.90 * Math.min(cw / nw, ch / nh);
    const s = Math.min(1, shrink);
    num.style.transform = `translateZ(0) scale(${s})`;
  });
}

export function setRowHeights(tile){
  const table = tile.querySelector('.scoretable');
  if (!table) return;

  const thead = table.tHead;
  const tbody = table.tBodies && table.tBodies[0];
  if (!tbody) return;

  const rows = tbody.rows.length || 2;

  // altura disponível na tabela
  const tableH = table.clientHeight;
  const headH  = thead ? thead.getBoundingClientRect().height : 0;

  // gap vertical entre linhas (usa a tua var --gap-v)
  const gap = parseFloat(getComputedStyle(tile).getPropertyValue('--gap-v')) || 0;

  // altura útil para o tbody (desconta cabeçalho e gaps entre linhas)
  const usable = Math.max(0, tableH - headH - gap * (rows - 1));
  const rowH   = Math.floor(usable / rows);

  // expõe para o CSS e aplica de imediato (evita jitter)
  tile.style.setProperty('--row-h', `${rowH}px`);
  [...tbody.rows].forEach(tr => tr.style.height = `${rowH}px`);
}

// --- ResizeObserver que repõe as variáveis por TILE ---
const ro = new ResizeObserver((entries) => {
  for (const { target, contentRect } of entries) {
    const w = contentRect.width || 0, h = contentRect.height || 0;
    const base = Math.max(0, Math.min(w, h));
    const clamp = (v,min,max)=>Math.max(min,Math.min(max,v));

    const fsName  = clamp(base * 0.28, 36, 160);
    const fsSet   = clamp(base * 0.40, 36, 220);
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

    if (target.dataset.sizingLock === '1') continue;
    target.dataset.sizingLock = '1';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        ensureNumWrappers(target);
        setRowHeights(target);       // <- primeiro fechamos a altura
        scaleNumbersToFit(target);   // <- depois cabemos o número na célula
        fitNames(target);
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

export function setRowHeightVar(tile){
  const table = tile.querySelector('.scoretable');
  if (!table) return;

  const csTile  = getComputedStyle(tile);
  const gapV    = parseFloat(csTile.getPropertyValue('--gap-v')) || 0;

  const thead   = table.tHead;
  const headH   = thead ? thead.offsetHeight : 0;

  // altura total do tile disponível
  const tileH   = tile.clientHeight;

  // margem-top da tabela (se existir, ex.: 8px)
  const mt      = parseFloat(getComputedStyle(table).marginTop || 0);

  // 2 linhas no tbody → 1 gap vertical entre elas
  const available = Math.max(0, tileH - headH - gapV - mt);

  const rowH = Math.max(44, Math.floor(available / 2)); // 44px mínimo por linha
  tile.style.setProperty('--row-h', `${rowH}px`);
}

