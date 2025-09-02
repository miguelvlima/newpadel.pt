// /public/js/scoreboard/sizing.js
export function fitNames(tile){
  const names = tile.querySelectorAll('td.names .line');
  if (!names.length) return;
  const root = tile; // escopo do tile
  const getVar = (name) => parseFloat(getComputedStyle(root).getPropertyValue(name)) || 0;
  let fs = getVar('--fs-name') || 22;
  const min = 16; let tries = 0;
  const tooWide = () => [...names].some(d => d.scrollWidth > d.clientWidth);
  while (tooWide() && fs > min && tries < 30){
    fs -= 1; root.style.setProperty('--fs-name', `${fs}px`); tries++;
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

    // reset para medir "tamanho real"
    num.style.transform = 'scale(1)';
    // medir caixa disponível
    const w = cell.clientWidth;
    const h = cell.clientHeight;
    // medir conteúdo
    const r = num.getBoundingClientRect();
    const scaleW = w > 0 && r.width  > 0 ? (w / r.width)  : 1;
    const scaleH = h > 0 && r.height > 0 ? (h / r.height) : 1;
    // margem de segurança para não colar nas bordas
    let s = 0.94 * Math.min(scaleW, scaleH);
    // limites razoáveis
    s = Math.max(0.60, Math.min(1.80, s));
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

    const fsName  = clamp(base * 0.34, 28, 200);
    const fsCell  = clamp(base * 0.42, 44, 280); // << baseline da célula
    const fsHead  = clamp(fsCell * 0.55, 12, 36);
    const fsBadge = clamp(base * 0.11, 12, 40);

    const gapV = clamp(base * 0.03, 8, 28);
    const padY = clamp(base * 0.045, 8, 26);
    const padX = clamp(base * 0.085, 10, 40);

    const setMinW = clamp(w * 0.22, 120, 320);

    target.style.setProperty('--fs-name',  `${fsName}px`);
    target.style.setProperty('--fs-cell',  `${fsCell}px`);   // << ESSENCIAL
    target.style.setProperty('--fs-head',  `${fsHead}px`);
    target.style.setProperty('--fs-badge', `${fsBadge}px`);
    target.style.setProperty('--gap-v',    `${gapV}px`);
    target.style.setProperty('--pad-cell-y', `${padY}px`);
    target.style.setProperty('--pad-cell-x', `${padX}px`);
    target.style.setProperty('--set-minw', `${setMinW}px`);
  }
});

// expõe para o UI observar cada tile
export function watchTile(tile){
  try { ro.observe(tile); } catch {}
}
