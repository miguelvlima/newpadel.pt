// /public/js/scoreboard/screensaver.js
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cfg = window.__SB || {};
const supabase = createClient(cfg.url, cfg.anon, { realtime: { params: { eventsPerSecond: 5 } } });

const headerEl = document.getElementById('media-header');
const footerEl = document.getElementById('media-footer');
const stage    = document.getElementById('media-stage');

let slides = [];
let timer  = null;
let idx    = 0;
let screen = null;

/* ---------- viewport height css var ---------- */
function setAppHeight(){
  document.documentElement.style.setProperty('--app-h', `${window.innerHeight}px`);
}
setAppHeight();
window.addEventListener('resize', setAppHeight);
window.addEventListener('orientationchange', setAppHeight);
document.addEventListener('fullscreenchange', setAppHeight);

/* ---------- fullscreen helpers (best-effort auto FS) ---------- */
async function tryFullscreen() {
  const el = document.documentElement;
  if (!document.fullscreenElement && el.requestFullscreen) {
    try { await el.requestFullscreen(); } catch (_) {}
  }
}
function armUserGestureFullscreenOnce(){
  const once = async () => {
    cleanup();
    await tryFullscreen();
  };
  const cleanup = () => {
    document.removeEventListener('click', once);
    document.removeEventListener('keydown', once);
    document.removeEventListener('touchend', once);
  };
  document.addEventListener('click', once, { once: true });
  document.addEventListener('keydown', once, { once: true });
  document.addEventListener('touchend', once, { once: true });
}

/* ---------- utils ---------- */
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function fetchScreenByKey(key){
  const { data, error } = await supabase
    .from('scoreboards')
    .select('id, key, title, logo_url')
    .eq('key', key)
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

async function fetchMedia(screenId){
  const { data, error } = await supabase
    .from('scoreboard_media')
    .select('media_type, url, sort, duration_ms')
    .eq('scoreboard_id', screenId)
    .order('media_type', { ascending: true })
    .order('sort', { ascending: true });
  if (error) throw error;
  const header = data.find(m => m.media_type === 'header');
  const footer = data.find(m => m.media_type === 'footer');
  const slides = data.filter(m => m.media_type === 'slide');
  return { header, footer, slides };
}

function setImg(el, url){
  if (!el) return;
  if (url) { el.src = url; el.style.display=''; }
  else { el.removeAttribute('src'); el.style.display='none'; }
}

function renderSlides(list){
  stage.innerHTML = '';
  if (!list.length){
    const d = document.createElement('div');
    d.className = 'hint';
    d.textContent = 'Sem slides';
    stage.appendChild(d);
    slides = [];
    return;
  }
  slides = list.map((s, i) => {
    const div = document.createElement('div');
    div.className = 'slide' + (i === 0 ? ' is-active' : '');
    const img = document.createElement('img');
    img.alt = `slide-${i+1}`;
    img.decoding = 'async';
    img.loading  = 'eager';
    img.src = s.url;
    div.appendChild(img);
    stage.appendChild(div);
    return { el: div, duration: Number(s.duration_ms||6000) };
  });
  idx = 0;
}

function startLoop(){
  stopLoop();
  if (!slides.length) return;
  const step = () => {
    const cur = slides[idx];
    const nextIdx = (idx + 1) % slides.length;
    const next = slides[nextIdx];
    timer = setTimeout(() => {
      if (cur?.el) cur.el.classList.remove('is-active');
      if (next?.el) next.el.classList.add('is-active');
      idx = nextIdx;
      step();
    }, Math.max(1200, cur.duration));
  };
  step();
}
function stopLoop(){ if (timer) { clearTimeout(timer); timer=null; } }

/* ---------- boot ---------- */
async function boot(){
  // tenta fullscreen logo de início (alguns browsers deixam, outros não)
  await tryFullscreen();
  // se ainda não entrou, prepara 1º gesto do utilizador para forçar FS
  setTimeout(() => {
    if (!document.fullscreenElement) armUserGestureFullscreenOnce();
  }, 250);

  screen = await fetchScreenByKey(cfg.screen);
  if (!screen) return;

  const pack = await fetchMedia(screen.id);
  setImg(headerEl, pack.header?.url || screen.logo_url || '');
  setImg(footerEl, pack.footer?.url || '');
  renderSlides(pack.slides);
  startLoop();

  // live update às imagens
  supabase.channel('media-live')
    .on('postgres_changes', { event:'*', schema:'public', table:'scoreboard_media', filter:`scoreboard_id=eq.${screen.id}` }, async () => {
      const p = await fetchMedia(screen.id);
      setImg(headerEl, p.header?.url || screen.logo_url || '');
      setImg(footerEl, p.footer?.url || '');
      renderSlides(p.slides);
      startLoop();
    })
    .subscribe();

  // se aparecer um jogo neste scoreboard → volta ao scoreboard “normal”
  supabase.channel('selections-watch')
    .on('postgres_changes', { event:'*', schema:'public', table:'scoreboard_selections', filter:`scoreboard_id=eq.${screen.id}` }, async () => {
      const { data } = await supabase.from('scoreboard_selections').select('game_id').eq('scoreboard_id', screen.id).limit(1);
      if (data && data.some(r => r.game_id)) {
        window.location.assign(`/scoreboard/${encodeURIComponent(cfg.screen)}`);
      }
    })
    .subscribe();
}

/* ---------- page lifecycle ---------- */
window.addEventListener('pageshow', boot);
window.addEventListener('visibilitychange', () => {
  if (document.hidden) stopLoop(); else startLoop();
});
// também tenta reentrar em FS se o user sair dele
document.addEventListener('fullscreenchange', async () => {
  if (!document.fullscreenElement) {
    // arma novamente o “one-shot” para o próximo gesto
    armUserGestureFullscreenOnce();
  }
});
