const COLS = 4;
const lightCache = new Map();

function readBoot() {
  const el = document.getElementById('parceiros-boot');
  if (!el) return [];
  try {
    const parsed = JSON.parse(el.textContent || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function fetchPartners(slug) {
  const res = await fetch(`/api/scoreboard/partners?slug=${encodeURIComponent(slug)}`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`partners ${res.status}`);
  const data = await res.json();
  return Array.isArray(data?.partners) ? data.partners : [];
}

function marksAreLight(rgba) {
  let sum = 0;
  let weight = 0;
  for (let i = 0; i + 3 < rgba.length; i += 4) {
    const a = rgba[i + 3];
    if (a < 24) continue;
    const w = a / 255;
    const lum = 0.2126 * rgba[i] + 0.7152 * rgba[i + 1] + 0.0722 * rgba[i + 2];
    sum += lum * w;
    weight += w;
  }
  if (weight < 1) return null;
  return sum / weight >= 140;
}

function probeLogoLight(src) {
  if (lightCache.has(src)) return Promise.resolve(lightCache.get(src));
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const maxSide = 64;
        const nw = Math.max(1, img.naturalWidth || img.width);
        const nh = Math.max(1, img.naturalHeight || img.height);
        const scale = Math.min(1, maxSide / Math.max(nw, nh));
        const w = Math.max(1, Math.round(nw * scale));
        const h = Math.max(1, Math.round(nh * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          lightCache.set(src, null);
          resolve(null);
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        const light = marksAreLight(ctx.getImageData(0, 0, w, h).data);
        lightCache.set(src, light);
        resolve(light);
      } catch {
        lightCache.set(src, null);
        resolve(null);
      }
    };
    img.onerror = () => {
      lightCache.set(src, null);
      resolve(null);
    };
    img.src = src;
  });
}

function applyLogoTone(wrap, src) {
  wrap.classList.remove('is-to-light');
  if (!src) return;
  const cached = lightCache.get(src);
  if (cached === false) wrap.classList.add('is-to-light');
  if (cached !== undefined) return;
  probeLogoLight(src).then((light) => {
    if (wrap.dataset.logoSrc !== src) return;
    wrap.classList.toggle('is-to-light', light === false);
  });
}

function paint(panel, partner) {
  const wrap = panel.querySelector('.parceiros-logo-wrap');
  const logo = panel.querySelector('.parceiros-logo');
  const fallback = panel.querySelector('.parceiros-logo-fallback');
  const name = panel.querySelector('.parceiros-name');
  const desc = panel.querySelector('.parceiros-desc');
  if (!wrap || !logo || !fallback || !name || !desc) return;

  name.textContent = partner?.name ?? '';
  desc.textContent = partner?.description ?? '';
  panel.classList.toggle('is-empty', !partner);

  const url = partner?.logoUrl || '';
  wrap.dataset.logoSrc = url;
  applyLogoTone(wrap, url);

  if (url) {
    logo.hidden = false;
    fallback.hidden = true;
    fallback.textContent = '';
    logo.alt = partner.name || '';
    logo.src = url;
  } else {
    logo.hidden = true;
    logo.removeAttribute('src');
    fallback.hidden = false;
    fallback.textContent = (partner?.name || '?').slice(0, 1).toUpperCase();
  }
}

function pagePartners(partners, page) {
  if (!partners.length) return [null, null, null, null];
  return Array.from({ length: COLS }, (_, i) => partners[(page * COLS + i) % partners.length]);
}

function main() {
  const body = document.body;
  const slug = body.dataset.slug || '3-open-dos-ouricos';
  const intervalMs = Math.round(Number(body.dataset.interval || 12) * 1000);
  const panels = [...document.querySelectorAll('.parceiros-panel')];
  let partners = readBoot();
  let page = 0;
  let timer = null;

  function render(nextPage, { fade } = { fade: false }) {
    const slice = pagePartners(partners, nextPage);
    const apply = () => {
      panels.forEach((panel, i) => paint(panel, slice[i]));
      page = nextPage;
    };
    if (!fade || !partners.length) {
      apply();
      return;
    }
    panels.forEach((p) => p.classList.add('is-fading'));
    window.setTimeout(() => {
      apply();
      panels.forEach((p) => p.classList.remove('is-fading'));
    }, 320);
  }

  function startRotate() {
    if (timer) window.clearInterval(timer);
    if (partners.length <= COLS) {
      render(0, { fade: false });
      return;
    }
    const pages = Math.ceil(partners.length / COLS);
    timer = window.setInterval(() => {
      render((page + 1) % pages, { fade: true });
    }, intervalMs);
  }

  render(0, { fade: false });
  startRotate();

  const refresh = async () => {
    try {
      const next = await fetchPartners(slug);
      if (!next.length) return;
      partners = next;
      render(page % Math.max(1, Math.ceil(partners.length / COLS)), { fade: false });
      startRotate();
    } catch (e) {
      console.warn('parceiros academy:', e);
    }
  };

  if (!partners.length) refresh();
  window.setInterval(refresh, 5 * 60 * 1000);
}

main();
