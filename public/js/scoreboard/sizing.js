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
  if (!cells.length) return;

  const SAFE = 0.96; // folga para não colar nas bordas
  const css  = getComputedStyle(root);
  let setW   = parseFloat(css.getPropertyValue('--set-w')) || 0;

  // largura máx. que podemos dar a cada coluna de resultados sem “comer” demasiado nomes
  const tileW = root.getBoundingClientRect().width || 0;
  const thSet = root.querySelectorAll('thead th.set').length;
  const thNow = root.querySelector('thead th.now') ? 1 : 0;
  const nRes  = Math.max(1, thSet + thNow);

  const namesMinFrac = 0.40; // mantemos ~40% para nomes
  const spacerFrac   = 0.03;
  const maxPerSet    = ((tileW * (1 - namesMinFrac)) - (tileW * spacerFrac)) / nRes;

  const ABS_MIN = 64;   // travões absolutos
  const ABS_MAX = 260;

  let neededW = setW;   // se algum número pedir mais largura, subimos isto

  cells.forEach(cell => {
    const num = cell.querySelector('.num');
    if (!num) return;

    // reset para medir
    num.style.transform = 'scale(1)';

    const cw = cell.clientWidth;
    const ch = cell.clientHeight;
    const rb = num.getBoundingClientRect();
    if (!cw || !ch || !rb.width || !rb.height) return;

    // 1) escala por ALTURA (queremos sempre a mesma altura visual)
    const scaleByH = (ch / rb.height) * SAFE;
    const widthAfter = rb.width * scaleByH;

    if (widthAfter <= cw){
      // cabe → aplicamos a escala por altura
      num.style.transform = `translateZ(0) scale(${scaleByH})`;
    } else {
      // não cabe em largura → registamos a largura necessária e,
      // por agora, encolhemos só para caber (para não haver corte visual)
      neededW = Math.max(neededW, Math.ceil(widthAfter + 2));
      const scaleByW = (cw / rb.width) * SAFE;
      num.style.transform = `translateZ(0) scale(${scaleByW})`;
    }
  });

  // 2) Se alguma célula precisou de mais largura, alargamos a coluna (dentro de limites)
  const clampedNeeded = Math.max(ABS_MIN, Math.min(neededW, Math.min(maxPerSet, ABS_MAX)));
  if (clampedNeeded > setW + 1) {
    root.style.setProperty('--set-w', `${Math.round(clampedNeeded)}px`);
    // Re-executa uma vez para aplicar a escala por altura com a nova largura
    requestAnimationFrame(() => scaleNumbersToFit(root));
  }
}


// sizing.js
export function setRowHeights(tile){
  const table  = tile.querySelector('.scoretable');
  if (!table) return;

  // 1) Medidas do TILE (área útil = clientHeight - padding)
  const csTile = getComputedStyle(tile);
  const padTop = parseFloat(csTile.paddingTop)    || 0;
  const padBot = parseFloat(csTile.paddingBottom) || 0;
  const tileH  = tile.clientHeight - padTop - padBot;

  // 2) Header do tile (badges)
  const headerH = tile.querySelector('.row')?.getBoundingClientRect().height || 0;

  // 3) Margens da tabela
  const csTable = getComputedStyle(table);
  const mt = parseFloat(csTable.marginTop)    || 0;
  const mb = parseFloat(csTable.marginBottom) || 0;

  // 4) Cabeçalho da tabela (thead)
  const theadH = table.tHead ? table.tHead.getBoundingClientRect().height : 0;

  // 5) Altura útil para o tbody (duas linhas)
  const safety = 2; // para arredondamentos/bordas
  const tbodyUsable = Math.max(0, tileH - headerH - mt - mb - theadH - safety);

  // 6) Define a altura por linha
  const rowsEl = table.tBodies[0]?.rows;
  const rows   = rowsEl?.length || 2;
  const rowH   = Math.max(44, Math.floor(tbodyUsable / rows));

  // 7) Aplica (var + direto nas <tr> para evitar jitter)
  tile.style.setProperty('--row-h', `${rowH}px`);
  if (rowsEl) [...rowsEl].forEach(tr => { tr.style.height = `${rowH}px`; });
}



// --- ResizeObserver que repõe as variáveis por TILE ---
const ro = new ResizeObserver((entries) => {
  for (const { target, contentRect } of entries) {
    const w = contentRect.width  || 0;
    const h = contentRect.height || 0;
    const base = Math.max(0, Math.min(w, h));
    const clamp = (v,min,max)=>Math.max(min,Math.min(max,v));

    // ====== tamanhos de fonte / paddings (como tinhas) ======
    const fsName  = clamp(base * 0.28, 36, 120);

    const css = getComputedStyle(target);
    const fsSetMax = parseFloat(css.getPropertyValue('--fs-set-max')) || 220;
    const fsSet    = clamp(base * 0.40, 36, fsSetMax);

    const fsHead  = clamp(fsSet * 0.55, 12, 36);
    const fsBadge = clamp(base * 0.11, 12, 40);

    const gapV = clamp(base * 0.03, 8, 28);
    const padY = clamp(base * 0.045, 8, 26);
    const padX = clamp(base * 0.085, 10, 40);

    // ====== quantas colunas de resultados existem neste tile? ======
    const thSet  = target.querySelectorAll('thead th.set').length;
    const thNow  = target.querySelector('thead th.now') ? 1 : 0;
    const nRes   = Math.max(1, thSet + thNow); // 1..4

    // ====== reservar largura mínima para Nomes e dimensionar colunas ======
    const namesMinFrac = 0.40;             // 40% do tile é sempre para nomes
    const spacerFrac   = 0.03;             // ~3% para o “flexfill”/respiração
    const fracPerSet   = (nRes >= 4) ? 0.14 : (nRes === 3 ? 0.16 : 0.18);

    // largura pretendida por coluna de resultados
    let desiredSetW = w * fracPerSet;

    // máximo que os sets podem ocupar sem roubar aos nomes
    const maxSetsArea = (w * (1 - namesMinFrac)) - (w * spacerFrac);
    const maxPerSet   = maxSetsArea / nRes;

    // escolhe o menor entre o desejado e o necessário para caber tudo
    let setW = Math.min(desiredSetW, maxPerSet);
    setW = clamp(Math.floor(setW), 72, 200); // travões absolutos

    // aplica
    target.style.setProperty('--fs-name',  `${fsName}px`);
    target.style.setProperty('--fs-set',   `${fsSet}px`);
    target.style.setProperty('--fs-now',   `${fsSet}px`);
    target.style.setProperty('--fs-head',  `${fsHead}px`);
    target.style.setProperty('--fs-badge', `${fsBadge}px`);
    target.style.setProperty('--gap-v',    `${gapV}px`);
    target.style.setProperty('--pad-cell-y', `${padY}px`);
    target.style.setProperty('--pad-cell-x', `${padX}px`);

    // NOVO: largura **fixa** por coluna de resultados (th/td.set/now)
    target.style.setProperty('--set-w', `${setW}px`);

    // evita loop reentrante
    if (target.dataset.sizingLock === '1') continue;
    target.dataset.sizingLock = '1';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setRowHeights(target);     // fecha a altura das linhas primeiro
        fitNames(target);          // nomes encolhem se faltar espaço
        scaleNumbersToFit(target); // números encolhem para caber na célula
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
