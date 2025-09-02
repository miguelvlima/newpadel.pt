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

/* === ESCALA APENAS O NÚMERO (sem mexer na célula) === */
function ensureNum(container){
  if (!container) return null;
  let span = container.querySelector('.num');
  if (!span) {
    span = document.createElement('span');
    span.className='num';
    span.textContent = container.textContent || '';
    container.textContent = '';
    container.appendChild(span);
  }
  return span;
}
function scaleOneNumber(cell){
  const span = ensureNum(cell);
  if (!span) return;
  span.style.transform = 'translate(-50%, -50%) scale(1)';
  const fit = () => {
    const cw = cell.clientWidth, ch = cell.clientHeight;
    const r = span.getBoundingClientRect();
    if (!cw || !ch || !r.width || !r.height) return;
    const s = Math.max(0.1, Math.min((cw-2)/r.width, (ch-2)/r.height)) * 0.98;
    span.style.transform = `translate(-50%, -50%) scale(${s})`;
  };
  fit(); requestAnimationFrame(fit);
}
export function scaleNumbers(tile){
  tile.querySelectorAll('td.set .cell, td.now .cell-now').forEach(scaleOneNumber);
}
export function scaleAllTiles(){
  document.querySelectorAll('.tile').forEach(scaleNumbers);
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
