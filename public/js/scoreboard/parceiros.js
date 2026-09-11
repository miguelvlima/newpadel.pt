const COLS = 4;

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

function paint(panel, partner) {
  const logo = panel.querySelector('.parceiros-logo');
  const fallback = panel.querySelector('.parceiros-logo-fallback');
  const name = panel.querySelector('.parceiros-name');
  const desc = panel.querySelector('.parceiros-desc');
  if (!logo || !fallback || !name || !desc) return;

  name.textContent = partner?.name ?? '';
  desc.textContent = partner?.description ?? '';
  panel.classList.toggle('is-empty', !partner);

  const url = partner?.logoUrl || '';
  if (url) {
    logo.hidden = false;
    fallback.hidden = true;
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
