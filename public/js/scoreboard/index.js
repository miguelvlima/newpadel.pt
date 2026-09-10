// /public/js/scoreboard/index.js
// Cache-bust dos módulos (ui.js sem ?v= ficava stale em prod).

import { setAppHeight, onFullscreenToggle, byId } from './utils.js?v=5.7';
import {
  initSupabase,
  fetchScreen,
  fetchSlots,
  subscribeSelections,
  subscribeGames,
  subscribeScreenMeta
} from './supabase-api.js?v=5.7';
import {
  buildOrUpdateGrid,
  buildOrUpdateCompactGrid,
  fitCompactNames,
  getCurrentSlots,
  setCurrentSlots
} from './ui.js?v=5.7';
import {
  ensureNumWrappers,
  setRowHeights,
  fitNames,
  scaleNumbersToFit,
  fitBadges,
  fitHeadings,
} from './sizing.js?v=5.7';

const matchMetaCache = new Map();

async function fetchMatchMeta(matchId) {
  const empty = { category: '', group: '' };
  const id = String(matchId || '').trim();
  if (!id) return empty;
  if (matchMetaCache.has(id)) return matchMetaCache.get(id);
  try {
    const res = await fetch(`/api/scoreboard/match-context?matchId=${encodeURIComponent(id)}`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`match-context ${res.status}`);
    const data = await res.json();
    const category = String(data?.categoryName || '').trim();
    let group = String(data?.groupLabel || '').trim();
    if (!group) {
      const code = String(data?.groupCode || '').trim();
      const phase = String(data?.phase || '').trim().toLowerCase();
      if (code) {
        group = /^grupo\b/i.test(code) ? code : `Grupo ${code}`;
      } else if (phase === 'eliminatorio') {
        const br = data?.bracketRound;
        group = br != null && Number.isFinite(Number(br)) ? `Ronda ${Number(br)}` : 'Eliminatória';
      }
    }
    const meta = { category, group };
    matchMetaCache.set(id, meta);
    return meta;
  } catch (e) {
    console.warn('compact match-context:', e);
    return empty;
  }
}

async function applyCompactBrandMeta(grid, slots) {
  if (!grid) return;
  const game = Array.isArray(slots) ? slots.find(Boolean) : null;
  const meta = await fetchMatchMeta(game?.tournament_match_id);
  grid.dataset.brandCategory = meta.category || '';
  grid.dataset.brandGroup = meta.group || '';
}

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

  // Helpers: detetar jogos e redirecionar p/ galeria
  const hasAnyGame = (slots) => Array.isArray(slots) && slots.some(Boolean);
  const redirectToGallery = () => {
    const key = SCREEN_KEY || 'default';
    window.location.assign(`/scoreboard/${encodeURIComponent(key)}/gallery`);
  };

  const enterFullscreen = () => {
    if (document.fullscreenElement || document.webkitFullscreenElement) return;
    const el = document.documentElement;
    (el.requestFullscreen || el.webkitRequestFullscreen)?.call(el);
    };

  // Botão de Fullscreen
  fsBtn?.addEventListener('click', () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  });
  if (fsBtn) fsBtn.style.display = document.fullscreenElement ? 'none' : '';

  // Ao entrar/sair de Fullscreen, oculta botão e recalibra (permitindo crescer)
  onFullscreenToggle(() => {
    if (fsBtn) fsBtn.style.display = document.fullscreenElement ? 'none' : '';
    document.documentElement.style.setProperty('--app-h', `${window.innerHeight}px`);
    queueRefit(true); // allowGrow=true → limpa --set-w e deixa recalcular mais largo
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

  // === Refit pipeline (em ordem) ===
  const refit = (allowGrow = false) => {
    if (document.body.classList.contains('compact')) {
      fitCompactNames(grid);
      return;
    }

    document.querySelectorAll('.tile').forEach((tile) => {

        ensureNumWrappers(tile);

        // PASSO 1
        setRowHeights(tile);
        fitHeadings(tile);
        fitBadges(tile);

        // PASSO 2
        requestAnimationFrame(() => {
        setRowHeights(tile);
        fitNames(tile);
        scaleNumbersToFit(tile);
        });
    });
    };

    let rafId = null;
    const queueRefit = (allowGrow = false) => {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
        requestAnimationFrame(() => refit(allowGrow));
    });
    };

    const isCompact = document.body.classList.contains('compact');
    const renderGrid = isCompact ? buildOrUpdateCompactGrid : buildOrUpdateGrid;

  // Bootstrap
  try {
    screen = await fetchScreen(sb, SCREEN_KEY, { logoEl, titleEl });

    const pack = await fetchSlots(sb, screen);
    setCurrentSlots(pack.slots);

    // Se não houver jogos, redireciona para a galeria
    if (!hasAnyGame(pack.slots)) { redirectToGallery(); return; }

    if (isCompact) await applyCompactBrandMeta(grid, pack.slots);
    renderGrid(grid, pack.positions, pack.slots);
    touch('Ligado', true);

    // Recalibração inicial após o primeiro render
    queueRefit(false);

    // Live: alterações nas seleções (add/move/remove)
    subscribeSelections(sb, screen.id, async () => {
      const p = await fetchSlots(sb, screen);
      setCurrentSlots(p.slots);

      if (!hasAnyGame(p.slots)) { redirectToGallery(); return; }

      if (isCompact) await applyCompactBrandMeta(grid, p.slots);
      renderGrid(grid, p.positions, p.slots);
      touch('Seleções atualizadas', true);
      queueRefit(false);
    });

    // Live: atualizações de jogos (pontuação em tempo real)
    subscribeGames(sb, () => getCurrentSlots(), async (idx, game) => {
      if (isCompact && game?.tournament_match_id) {
        await applyCompactBrandMeta(grid, [game]);
      }
      renderGrid(
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

        if (isCompact) await applyCompactBrandMeta(grid, p.slots);
        renderGrid(grid, p.positions, p.slots);
        queueRefit(false);
      }
      if (row?.kiosk) document.body.classList.add('hide-cursor');
    });

  } catch (e) {
    console.error('Erro no bootstrap:', e);
    touch('Erro inicial', false);
  }

  // Eventos globais
  window.addEventListener('resize',            () => queueRefit(false));
  window.addEventListener('orientationchange', () => queueRefit(false));
    document.addEventListener('fullscreenchange', () => {
    document.documentElement.style.setProperty('--app-h', `${window.innerHeight}px`);
    // limpar por prevenção (entra/sai)
    document.querySelectorAll('.tile').forEach((tile) => {
        tile.style.removeProperty('--set-w');
        delete tile.dataset.lastSetW;
    });
    queueRefit(true);
    });

    // qualquer clique/pointer em qualquer sítio entra em fullscreen (se ainda não estiver)
    document.addEventListener('pointerdown', () => enterFullscreen(), { passive: true });

    // opcional: tecla "f" também entra em fullscreen
    document.addEventListener('keydown', (e) => {
    if ((e.key === 'f' || e.key === 'F') && !document.fullscreenElement) enterFullscreen();
    });

})();
