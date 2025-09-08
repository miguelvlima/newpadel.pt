// /public/js/scoreboard/index.js

import { setAppHeight, onFullscreenToggle, byId } from './utils.js';
import {
  initSupabase,
  fetchScreen,
  fetchSlots,
  subscribeSelections,
  subscribeGames,
  subscribeScreenMeta
} from './supabase-api.js';
import {
  buildOrUpdateGrid,
  getCurrentSlots,
  setCurrentSlots
} from './ui.js';
import {
  ensureNumWrappers,
  setRowHeights,
  fitNames,
  scaleNumbersToFit,
  fitBadges
} from './sizing.js';

(async () => {
  // Ajuste do 100vh mobile
  setAppHeight();

  const grid     = document.getElementById('grid');
  const statusEl = document.getElementById('status');
  const logoEl   = document.getElementById('screen-logo');
  const titleEl  = document.getElementById('screen-title');
  const fsBtn    = document.getElementById('fs');

  const SUPABASE_URL  = grid?.dataset?.sbUrl || '';
  const SUPABASE_ANON = grid?.dataset?.sbAnon || '';
  const SCREEN_KEY    = grid?.dataset?.screen || 'default';

  // Helpers de redirecionamento para a galeria quando não há jogos
  const hasAnyGame = (slots) => Array.isArray(slots) && slots.some(Boolean);
  const redirectToGallery = () => {
    const key = SCREEN_KEY || 'default';
    window.location.assign(`/scoreboard/${encodeURIComponent(key)}/gallery`);
  };

  // Botão de Fullscreen
  fsBtn?.addEventListener('click', () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  });

  // Ao entrar/sair de Fullscreen, oculta botão e recalibra
  onFullscreenToggle(() => {
    if (fsBtn) fsBtn.style.display = document.fullscreenElement ? 'none' : '';
    // Atualiza --app-h e pede recalibração permitindo crescer em FS
    document.documentElement.style.setProperty('--app-h', `${window.innerHeight}px`);
    queueRefit(true);
  });

  // Relógio de estado
  const fmtTime = d => d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  let clockTimer = null;
  function startClock(){
    if (clockTimer) clearInterval(clockTimer);
    const tick = () => { const el = byId('status-clock'); if (el) el.textContent = fmtTime(new Date()); };
    tick();
    clockTimer = setInterval(tick, 1000);
  }
  function touch(text, ok){
    if (!statusEl) return;
    statusEl.innerHTML = `<span class="${ok ? 'status-ok' : 'status-bad'}">●</span> ${text} • <span id="status-clock"></span>`;
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

    // Se não houver jogos, redireciona para a galeria
    if (!hasAnyGame(pack.slots)) { redirectToGallery(); return; }

    buildOrUpdateGrid(grid, pack.positions, pack.slots);
    touch('Ligado', true);

    // Live: alterações nas seleções (add/move/remove)
    subscribeSelections(sb, screen.id, async () => {
      const p = await fetchSlots(sb, screen);
      setCurrentSlots(p.slots);

      if (!hasAnyGame(p.slots)) { redirectToGallery(); return; }

      buildOrUpdateGrid(grid, p.positions, p.slots);
      touch('Seleções atualizadas', true);
      // recalibra após rebuild
      queueRefit(false);
    });

    // Live: atualizações de jogos (pontuação em tempo real)
    subscribeGames(sb, () => getCurrentSlots(), (idx, game) => {
      // UI atualiza in-place; depois escalamos números (sem crescer layout)
      buildOrUpdateGrid(
        grid,
        screen.positions || getCurrentSlots().length,
        getCurrentSlots(),
        { patchIndex: idx, patchGame: game }
      );
      queueRefit(false);
      touch('Atualizado', true);
    });

    // Live: meta do ecrã (título/logo/positions/kiosk)
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

        if (!hasAnyGame(p.slots)) { redirectToGallery(); return; }

        buildOrUpdateGrid(grid, p.positions, p.slots);
        queueRefit(false);
      }
      if (row?.kiosk) document.body.classList.add('hide-cursor');
    });

  } catch (e) {
    console.error('Erro no bootstrap:', e);
    touch('Erro inicial', false);
  }

  // === Refit pipeline (em ordem) ===
  const refit = (allowGrow = false) => {
    document.querySelectorAll('.tile').forEach((tile) => {
      if (allowGrow) {
        // em FS permitimos largar a largura fixa dos sets
        tile.style.removeProperty('--set-w');
      }
      ensureNumWrappers(tile);
      setRowHeights(tile);       // fecha a altura das linhas
      fitNames(tile);            // encolhe nomes se necessário
      scaleNumbersToFit(tile);   // faz os números caberem na célula
      fitBadges(tile);           // ajusta badges do topo
    });
  };

  // Debounce via duplo rAF para esperar layout estabilizar
  let rafId = null;
  const queueRefit = (allowGrow = false) => {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      requestAnimationFrame(() => refit(allowGrow));
    });
  };

  // Eventos globais
  window.addEventListener('resize',            () => queueRefit(false));
  window.addEventListener('orientationchange', () => queueRefit(false));
  document.addEventListener('fullscreenchange', () => {
    // fallback: atualiza --app-h e refit com crescimento permitido
    document.documentElement.style.setProperty('--app-h', `${window.innerHeight}px`);
    queueRefit(true);
  });
  if (document.fonts?.ready) document.fonts.ready.then(() => queueRefit(false));

})();
