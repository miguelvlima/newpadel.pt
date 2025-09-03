// /public/js/scoreboard/sizing.js
export function fitNames(tile){
  const lines = tile.querySelectorAll('td.names .line');
  if (!lines.length) return;

  const getVar = (name) => parseFloat(getComputedStyle(tile).getPropertyValue(name)) || 0;
  let fs = getVar('--fs-name') || 22;
  const min = 16; let tries = 0;

  const tooWide = () => [...lines].some(l => l.scrollWidth > l.clientWidth);
  const tooTall = () => tile.scrollHeight > tile.clientHeight;

  while ((tooWide() || tooTall()) && fs > min && tries < 60){
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

    const availW = Math.max(1, cell.clientWidth  - 2);
    const availH = Math.max(1, cell.clientHeight - 2);
    const r      = num.getBoundingClientRect();

    const needW  = r.width  > 0 ? (availW / r.width)  : 1;
    const needH  = r.height > 0 ? (availH / r.height) : 1;

    let s = 0.96 * Math.min(needW, needH);
    // Limite superior para não “estourar”
    s = Math.max(0.60, Math.min(2.50, s));  // ← podes afinar 2.2–2.8

    num.style.transform = `scale(${s})`;
  });
}



/* altura: encolhe margens/padding antes de reduzir fontes */
export function fitTileVertically(tile){
  const getVar = (name) => parseFloat(getComputedStyle(tile).getPropertyValue(name)) || 0;
  const setVar = (name,val) => tile.style.setProperty(name, val);
  let safety = 18;
  const step = () => {
    if (tile.scrollHeight <= tile.clientHeight || safety-- <= 0) return;
    const gap = getVar('--gap-v');
    const py  = getVar('--pad-cell-y');
    const px  = getVar('--pad-cell-x');
    if (gap > 8 || py > 10 || px > 12){
      setVar('--gap-v', `${Math.max(6, gap*0.96)}px`);
      setVar('--pad-cell-y', `${Math.max(8, py*0.96)}px`);
      setVar('--pad-cell-x', `${Math.max(10, px*0.96)}px`);
      return requestAnimationFrame(step);
    }
    // último recurso: reduzir ligeiramente nomes/headers
    const fsName = getVar('--fs-name'); const fsHead = getVar('--fs-head');
    if (fsName > 16) setVar('--fs-name', `${fsName*0.98}px`);
    if (fsHead > 10) setVar('--fs-head', `${fsHead*0.98}px`);
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// --- ResizeObserver que repõe as variáveis por TILE ---
const ro = new ResizeObserver((entries) => {
  for (const { target, contentRect } of entries) {
    const w = contentRect.width || 0, h = contentRect.height || 0;
    const base = Math.max(0, Math.min(w, h));
    const clamp = (v,min,max)=>Math.max(min,Math.min(max,v));

    const fsName  = clamp(base * 0.20, 36, 120);
    const fsSet   = clamp(base * 0.42, 36, 240);
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
        ensureNumWrappers(target); // garante <span class="num">
        setRowHeightVar(target);   // fixa --row-h pela altura real do tile
        scaleNumbersToFit(target); // números enchem célula (transform: scale)
        fitNames(target);          // baixa fs dos nomes se ainda não couberem
        fitBadges(target);         // ajusta badges se necessário
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

