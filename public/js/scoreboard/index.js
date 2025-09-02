// /public/js/scoreboard/index.js
import { setAppHeight, onFullscreenToggle, byId } from './utils.js';
import { initSupabase, fetchScreen, fetchSlots, subscribeSelections, subscribeGames, subscribeScreenMeta } from './supabase-api.js';
import { buildOrUpdateGrid, getTileEls, getCurrentSlots, setCurrentSlots } from './ui.js';
import { scaleAllTiles } from './sizing.js';

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
    requestAnimationFrame(scaleAllTiles);
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
      requestAnimationFrame(scaleAllTiles);
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

  // Responsivo
  window.addEventListener('resize', () => {
    requestAnimationFrame(() => {
      buildOrUpdateGrid(grid, screen?.positions || getCurrentSlots().length || 1, getCurrentSlots());
      scaleAllTiles();
    });
  });
  window.addEventListener('orientationchange', () => {
    requestAnimationFrame(() => {
      buildOrUpdateGrid(grid, screen?.positions || getCurrentSlots().length || 1, getCurrentSlots());
      scaleAllTiles();
    });
  });
})();
