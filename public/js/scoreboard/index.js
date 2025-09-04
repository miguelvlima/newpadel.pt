// /public/js/scoreboard/index.js

import { setAppHeight, onFullscreenToggle, byId } from './utils.js';
import { initSupabase, fetchScreen, fetchSlots, subscribeSelections, subscribeGames, subscribeScreenMeta } from './supabase-api.js';
import { buildOrUpdateGrid, getCurrentSlots, setCurrentSlots } from './ui.js';
import { ensureNumWrappers, setRowHeights, fitNames, scaleNumbersToFit, fitBadges } from './sizing.js';


(async () => {
  setAppHeight();

  const grid     = document.getElementById('grid');
  const statusEl = document.getElementById('status');
  const logoEl   = document.getElementById('screen-logo');
  const titleEl  = document.getElementById('screen-title');
  const fsBtn    = document.getElementById('fs');

  const SUPABASE_URL  = grid?.dataset?.sbUrl || '';
  const SUPABASE_ANON = grid?.dataset?.sbAnon || '';
  const SCREEN_KEY    = grid?.dataset?.screen || 'default';

  // FS button behaviour
  fsBtn?.addEventListener('click', () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  });
  onFullscreenToggle(() => {
    if (fsBtn) fsBtn.style.display = document.fullscreenElement ? 'none' : '';
    // Recalibra números ao entrar/sair de fullscreen
    requestAnimationFrame(rescaleAllTiles);
  });

  // Status clock
  const fmtTime = d => d.toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit',second:'2-digit'});
  let clockTimer = null;
  function startClock(){
    if (clockTimer) clearInterval(clockTimer);
    const tick = () => { const el=byId('status-clock'); if (el) el.textContent = fmtTime(new Date()); };
    tick();
    clockTimer = setInterval(tick, 1000);
  }
  function touch(text, ok){
    if (!statusEl) return;
    statusEl.innerHTML = `<span class="${ok?'status-ok':'status-bad'}">●</span> ${text} • <span id="status-clock"></span>`;
    startClock();
  }

  // Supabase
  const sb = initSupabase(SUPABASE_URL, SUPABASE_ANON);
  let screen = null;

  // Bootstrap
  try {
    screen = await fetchScreen(sb, SCREEN_KEY, { logoEl, titleEl });
    const pack = await fetchSlots(sb, screen);
    setCurrentSlots(pack.slots);
    buildOrUpdateGrid(grid, pack.positions, pack.slots);
    touch('Ligado', true);

    // Live
    subscribeSelections(sb, screen.id, async () => {
      const p = await fetchSlots(sb, screen);
      setCurrentSlots(p.slots);
      buildOrUpdateGrid(grid, p.positions, p.slots);
      touch('Seleções atualizadas', true);
    });

    subscribeGames(sb, () => getCurrentSlots(), (idx, game) => {
      // UI atualiza in-place; depois escalamos números
      buildOrUpdateGrid(grid, screen.positions || getCurrentSlots().length, getCurrentSlots(), { patchIndex: idx, patchGame: game });
      requestAnimationFrame(rescaleAllTiles);
      touch('Atualizado', true);
    });

    subscribeScreenMeta(sb, screen.id, async (row) => {
      if (row?.title !== undefined) { titleEl.textContent = row.title || SCREEN_KEY; }
      if (row?.logo_url !== undefined) {
        if (row.logo_url) { logoEl.src = row.logo_url; logoEl.style.display=''; titleEl.style.display='none'; }
        else { logoEl.removeAttribute('src'); logoEl.style.display='none'; titleEl.style.display=''; }
      }
      if (row?.positions !== undefined) {
        screen.positions = row.positions;
        const p = await fetchSlots(sb, screen);
        setCurrentSlots(p.slots);
        buildOrUpdateGrid(grid, p.positions, p.slots);
      }
      if (row?.kiosk) document.body.classList.add('hide-cursor');
    });

  } catch (e) {
    console.error('Erro no bootstrap:', e);
    touch('Erro inicial', false);
  }

  const refit = (allowGrow = false) => {
    document.querySelectorAll('.tile').forEach(tile => {
    if (allowGrow) {
      // solta a largura fixa para permitir recalcular maior se for preciso
      tile.style.removeProperty('--set-w');
    }
        ensureNumWrappers(t);
        setRowHeights(t);       // <- primeiro fechamos a altura
        fitNames(t);
        scaleNumbersToFit(t);   // <- depois cabemos o número na célula
        fitBadges(t);
    });
  };

  // 2) pequena fila com duplo rAF (garante layout estabilizado)
    let rafId = null;
    const queueRefit = (allowGrow = false) => {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
        requestAnimationFrame(() => refit(allowGrow));
    });
    };

    // 3) eventos globais
    window.addEventListener('resize', () => queueRefit(false));
    window.addEventListener('orientationchange', () => queueRefit(false));
    document.addEventListener('fullscreenchange', () => {
    if (typeof setAppHeight === 'function') setAppHeight(); // atualiza --app-h
    queueRefit(true);  // em FS, deixa crescer: limpa --set-w e refaz
    });
    if (document.fonts?.ready) document.fonts.ready.then(() => queueRefit(false));

})();
