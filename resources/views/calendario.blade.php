<!doctype html>
<html lang="pt">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Calendário do Circuito Regional</title>
  <style>
    :root{
      --bg:#0b1220;
      --text:#e8eefc;
      --muted:#a9b6d6;
      --line:rgba(255,255,255,.10);
      --chip:rgba(255,255,255,.08);
      --chip2:rgba(255,255,255,.12);
    }
    *{box-sizing:border-box}
    body{
      margin:0;
      font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
      background: radial-gradient(1200px 700px at 20% 0%, rgba(125,211,252,.12), transparent 60%),
                  radial-gradient(1000px 600px at 90% 10%, rgba(52,211,153,.10), transparent 55%),
                  var(--bg);
      color:var(--text);
    }
    .wrap{max-width:1100px;margin:0 auto;padding:28px 16px 64px}
    header{
      display:flex;
      flex-direction:column;
      gap:14px;
      margin-bottom:18px;
    }
    .title h1{margin:0;font-size:22px}
    .title p{margin:6px 0 0;color:var(--muted);max-width:78ch;line-height:1.35}
    .controls{
      display:flex;
      gap:10px;
      align-items:flex-end;   /* 👈 ISTO resolve o alinhamento */
      flex-wrap:wrap;

      background:rgba(255,255,255,.03);
      border:1px solid var(--line);
      padding:10px;
      border-radius:14px;
    }
    .controls label{font-size:12px;color:var(--muted)}
    .controls input,.controls select{
      background:rgba(255,255,255,.04);
      border:1px solid var(--line);
      color:var(--text);
      padding:9px 10px;border-radius:12px;outline:none;min-width:160px;
    }
    .controls-left{
      align-self:flex-start;   /* força alinhamento à esquerda */
    }
    .controls input::placeholder{color:rgba(233,240,255,.45)}
    .btn{border:1px solid var(--line);background:rgba(255,255,255,.06);color:var(--text);padding:9px 12px;border-radius:12px;cursor:pointer;font-weight:600;}
    .btn:hover{background:rgba(255,255,255,.09)}
    .status{margin:10px 0 22px;padding:12px 14px;border:1px solid var(--line);background:rgba(255,255,255,.03);border-radius:14px;color:var(--muted);display:none;}

    .month-board{margin-top:22px;border:1px solid var(--line);background:linear-gradient(180deg, rgba(255,255,255,.03), rgba(255,255,255,.02));border-radius:18px;overflow:hidden;}
    .month-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;background:rgba(255,255,255,.03);border-bottom:1px solid var(--line);}
    .month-head h2{margin:0;font-size:16px}
    .month-head .count{color:var(--muted);font-size:12px}
    .cards{padding:14px;display:grid;grid-template-columns:repeat(12, 1fr);gap:12px;}
    .card{grid-column:span 12;background:rgba(255,255,255,.03);border:1px solid var(--line);border-radius:16px;overflow:hidden;display:flex;flex-direction:column;}
    @media (min-width:720px){ .card{grid-column:span 6;} }
    @media (min-width:980px){ .card{grid-column:span 4;} }

    .banner{position:relative;width:100%;aspect-ratio:2/1;background:linear-gradient(135deg, rgba(125,211,252,.20), rgba(52,211,153,.14));border-bottom:1px solid var(--line);overflow:hidden;}
    .banner img{width:100%;height:100%;object-fit:cover;display:block;opacity:.95;}
    .badge{position:absolute;left:10px;top:10px;font-size:11px;padding:6px 10px;border-radius:999px;border:1px solid var(--line);background: rgba(11,18,32,.55);backdrop-filter: blur(6px);color: rgba(232,238,252,.95);}
    .card-top{padding:14px 14px 10px;display:flex;gap:10px;align-items:flex-start;}
    .logo{
      width:42px;
      height:42px;
      border-radius:12px;
      border:1px solid var(--line);
      background:rgba(255,255,255,.04);
      display:flex;
      align-items:center;
      justify-content:center;
      overflow:hidden;
      flex:none;
    }

    .logo img{
      width:100%;
      height:100%;
      object-fit:contain; /* 👈 importante para logos */
      background:#0b1220;
    }
    .card h3{margin:0;font-size:14px;line-height:1.25}
    .meta{margin:6px 0 0;color:var(--muted);font-size:12px;line-height:1.35}
    .chips{padding:0 14px 12px;display:flex;flex-wrap:wrap;gap:6px}
    .chip{font-size:11px;padding:6px 8px;border-radius:999px;border:1px solid var(--line);background:var(--chip);color:rgba(232,238,252,.92);}
    .chip.strong{background:var(--chip2)}
    .card-bottom{margin-top:auto;padding:12px 14px 14px;border-top:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;gap:10px;}
    .prices{font-size:12px;color:var(--muted);line-height:1.3}
    .prices b{color:var(--text)}
    .pill{font-size:11px;padding:6px 10px;border-radius:999px;border:1px solid var(--line);background:rgba(125,211,252,.10);color:rgba(232,238,252,.95);white-space:nowrap;}
    .empty{margin-top:14px;padding:18px;border:1px dashed rgba(255,255,255,.18);border-radius:16px;color:var(--muted);text-align:center;}
    .link{font-size:12px;color:rgba(232,238,252,.9);text-decoration:none;border:1px solid var(--line);padding:8px 10px;border-radius:12px;background:rgba(255,255,255,.05);}
    .link:hover{background:rgba(255,255,255,.08)}
  </style>
</head>

<body>
  <div class="wrap">
    <header>
      <div class="title">
        <h1 id="calendarTitle">Circuito Social Regionalde Padel</h1>
      </div>

      <div class="controls controls-left">
        <div>
          <label for="year">Ano</label><br/>
          <select id="year"></select>
        </div>
        <div>
          <label for="q">Pesquisar</label><br/>
          <input id="q" placeholder="nome, clube, categoria…" />
        </div>
        <button class="btn" id="reload">Atualizar</button>
      </div>
    </header>

    <div class="status" id="status"></div>
    <div id="content"></div>
  </div>

  <script>
    // Ano inicial vindo do backend (mantém coerência com ?events-year)
    const INITIAL_YEAR = @json($year);

    const elContent = document.getElementById("content");
    const elStatus  = document.getElementById("status");
    const elYear    = document.getElementById("year");
    const elQ       = document.getElementById("q");
    const elReload  = document.getElementById("reload");

    const monthNames = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

    const FALLBACK_BANNER_SVG =
      "data:image/svg+xml;charset=utf-8," +
      encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="600">
          <defs>
            <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stop-color="#1e3a8a" stop-opacity="0.55"/>
              <stop offset="1" stop-color="#065f46" stop-opacity="0.45"/>
            </linearGradient>
          </defs>
          <rect width="1200" height="600" fill="#0b1220"/>
          <rect width="1200" height="600" fill="url(#g)"/>
          <circle cx="260" cy="290" r="180" fill="#7dd3fc" fill-opacity="0.10"/>
          <circle cx="980" cy="260" r="220" fill="#34d399" fill-opacity="0.10"/>
          <text x="60" y="520" fill="#e8eefc" fill-opacity="0.82" font-family="system-ui, -apple-system, Segoe UI, Roboto, Arial" font-size="42" font-weight="700">
            Torneio de Padel
          </text>
        </svg>
      `);

    function setStatus(msg, show=true){
      elStatus.textContent = msg;
      elStatus.style.display = show ? "block" : "none";
    }
    function normalize(s){ return (s ?? "").toString().toLowerCase(); }

    function fillYearSelect(selected){
      const current = new Date().getFullYear();
      const years = [];
      for (let y = current - 2; y <= current + 3; y++) years.push(y);
      if (!years.includes(selected)) years.unshift(selected);
      elYear.innerHTML = years.sort((a,b)=>a-b).map(y => `<option value="${y}" ${y===selected?"selected":""}>${y}</option>`).join("");
    }

    function updateUrlYear(year){
      const u = new URL(window.location.href);
      u.searchParams.set("events-year", String(year));
      history.replaceState(null, "", u.toString());
    }

    function parseISODate(d){
      const [y,m,day] = d.split("-").map(Number);
      return new Date(Date.UTC(y, m-1, day));
    }
    function formatRange(startISO, endISO){
      const s = parseISODate(startISO);
      const e = parseISODate(endISO);
      const opts = { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" };
      const fs = s.toLocaleDateString("pt-PT", opts);
      const fe = e.toLocaleDateString("pt-PT", opts);
      return (fs === fe) ? fs : `${fs} → ${fe}`;
    }
    function euros(n){
      const val = Number(n);
      if (!Number.isFinite(val)) return "—";
      return val.toLocaleString("pt-PT", { style: "currency", currency: "EUR" });
    }

    function escapeHtml(str){
      return String(str ?? "")
        .replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")
        .replaceAll('"',"&quot;").replaceAll("'","&#039;");
    }

    function groupByMonth(events){
      const map = new Map();
      for (const ev of events){
        const d = parseISODate(ev.data_inicio);
        const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,"0")}`;
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(ev);
      }
      const keys = [...map.keys()].sort();
      return keys.map(k => ({ key:k, items: map.get(k).sort((a,b)=>a.data_inicio.localeCompare(b.data_inicio)) }));
    }

    function fillYearSelectFromEvents(events, selectedYear) {
      const yearsSet = new Set();

      for (const ev of events) {
        if (ev.data_inicio) {
          yearsSet.add(Number(ev.data_inicio.slice(0, 4)));
        }
      }

      const years = Array.from(yearsSet).sort((a, b) => a - b);

      // fallback de segurança
      if (!years.length) years.push(selectedYear);

      elYear.innerHTML = years
        .map(y => `<option value="${y}" ${y === selectedYear ? "selected" : ""}>${y}</option>`)
        .join("");
    }


    function renderMonthBoard(key, items){
      const [y, m] = key.split("-").map(Number);
      const monthLabel = `${monthNames[m-1]} ${y}`;

      const cards = items.map(ev => {
        const logoText = (ev.nome || "T").trim().slice(0,1).toUpperCase();
        const cats = Array.isArray(ev.categorias) ? ev.categorias : [];
        const catChips = cats.length
          ? cats.map(c => `<span class="chip">${escapeHtml(c.codigo || c.nome || "Cat")}</span>`).join("")
          : `<span class="chip">Sem categorias</span>`;

        const bannerUrl = ev.banner_url || FALLBACK_BANNER_SVG;
        const inscricao = ev.url_inscricao ? `<a class="link" href="${escapeHtml(ev.url_inscricao)}" target="_blank" rel="noopener">Inscrição</a>` : `<span class="pill">Calendário</span>`;

        return `
          <article class="card">
            <div class="banner">
              <img src="${escapeHtml(bannerUrl)}"
                   alt="Banner do torneio ${escapeHtml(ev.nome ?? "Torneio")}"
                   loading="lazy"
                   onerror="this.onerror=null; this.src='${escapeHtml(FALLBACK_BANNER_SVG)}';" />
              <div class="badge">${escapeHtml(formatRange(ev.data_inicio, ev.data_fim))}</div>
            </div>

            <div class="card-top">
              <div class="logo">
                ${
                  ev.clube_logo_url
                    ? `<img src="${escapeHtml(ev.clube_logo_url)}"
                            alt="Logo do clube ${escapeHtml(ev.clube)}"
                            loading="lazy"
                            onerror="this.style.display='none'">`
                    : escapeHtml(logoText)
                }
              </div>
              <div>
                <h3>${escapeHtml(ev.nome ?? "Torneio")}</h3>
                <div class="meta"><b>Clube:</b> ${escapeHtml(ev.clube ?? "—")}</div>
              </div>
            </div>

            <div class="chips">
              <span class="chip strong">Categorias</span>
              ${catChips}
            </div>

            <div class="card-bottom">
              <div class="prices">
                Público: <b>${escapeHtml(euros(ev.preco_publico))}</b><br/>
                Sócio: <b>${escapeHtml(euros(ev.preco_socio))}</b>
              </div>
              ${inscricao}
            </div>
          </article>
        `;
      }).join("");

      return `
        <section class="month-board">
          <div class="month-head">
            <h2>${escapeHtml(monthLabel)}</h2>
            <div class="count">${items.length} torneio(s)</div>
          </div>
          <div class="cards">${cards}</div>
        </section>
      `;
    }

    async function loadAndRender(){
      const year = Number(elYear.value) || INITIAL_YEAR;

      document.getElementById("calendarTitle").textContent =
          `Circuito Regional Social de Padel · ${year}`;

      const q = normalize(elQ.value);

      setStatus("A carregar torneios…", true);
      elContent.innerHTML = "";

      const url = new URL("/api/calendario", window.location.origin);
      url.searchParams.set("year", String(year));
      if (q) url.searchParams.set("q", q);

      const res = await fetch(url.toString(), { headers: { "Accept":"application/json" } });
      if (!res.ok){
        setStatus("Erro a carregar o calendário (API). Vê logs do Laravel.", true);
        elContent.innerHTML = `<div class="empty">Não foi possível carregar os dados.</div>`;
        return;
      }

      const payload = await res.json();
      const events = payload.events || [];

      // 👉 atualizar dropdown com base nos eventos reais
      fillYearSelectFromEvents(events, year);


      if (!events.length){
        setStatus("", false);
        elContent.innerHTML = `<div class="empty">Sem torneios para mostrar (verifica o ano/filtros).</div>`;
        return;
      }

      const groups = groupByMonth(events);
      elContent.innerHTML = groups.map(g => renderMonthBoard(g.key, g.items)).join("");
      setStatus("", false);
    }

    // init
    updateUrlYear(INITIAL_YEAR);

    elYear.addEventListener("change", () => {
      const year = Number(elYear.value);
      updateUrlYear(year);
      loadAndRender();
    });

    let qTimer = null;
    elQ.addEventListener("input", () => {
      clearTimeout(qTimer);
      qTimer = setTimeout(loadAndRender, 180);
    });

    elReload.addEventListener("click", loadAndRender);

    loadAndRender();
  </script>
</body>
</html>
