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
  const step = async () => {
    const cur = slides[idx];
    const nextIdx = (idx + 1) % slides.length;
    const next = slides[nextIdx];

    // avança após duração
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

async function boot(){
  screen = await fetchScreenByKey(cfg.screen);
  if (!screen) return;

  // carrega media
  const pack = await fetchMedia(screen.id);
  setImg(headerEl, pack.header?.url || screen.logo_url || '');
  setImg(footerEl, pack.footer?.url || '');
  renderSlides(pack.slides);
  startLoop();

  // live update às imagens
  supabase.channel('media-live')
    .on('postgres_changes', { event:'*', schema:'public', table:'scoreboard_media', filter:`scoreboard_id=eq.${screen.id}` }, async () => {
      const pack = await fetchMedia(screen.id);
      setImg(headerEl, pack.header?.url || screen.logo_url || '');
      setImg(footerEl, pack.footer?.url || '');
      renderSlides(pack.slides);
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

window.addEventListener('pageshow', boot);
window.addEventListener('visibilitychange', () => {
  if (document.hidden) stopLoop(); else startLoop();
});
