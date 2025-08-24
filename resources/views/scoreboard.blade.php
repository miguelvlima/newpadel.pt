{{-- resources/views/scoreboard.blade.php --}}
@php
  $sbUrl  = config('services.supabase.url');
  $sbAnon = config('services.supabase.anon');
  $screen = $screen ?? 'default';
@endphp
<!doctype html>
<html lang="pt">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Scoreboard</title>
  <style>
    /* Paleta + tamanhos base (JS ajusta via ResizeObserver) */
    :root{
      --bg:#000; --fg:#fff; --muted:#b7b7b7;
      --tile:#0b0b0b; --tile-grad:#141414;
      --set-bg:rgba(255,255,255,.08); --set-br:rgba(255,255,255,.16);
      --live:#ff4d4d; --now-fg:#e7ffee;

      --fs-name: 22px;  /* nomes */
      --fs-set:  26px;  /* números dos sets */
      --fs-now:  36px;  /* “AGORA” */
      --fs-head: 12px;  /* cabeçalhos */
    }

    *{box-sizing:border-box}
    html,body{height:100%;}
    body{overflow:auto;}
    body{
      margin:0; background:var(--bg); color:var(--fg);
      -webkit-font-smoothing:antialiased; -moz-osx-font-smoothing:grayscale;
      font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif;
      display:flex; flex-direction:column;
    }

    header, footer { padding:12px 16px; }
    header{
      display:flex; align-items:center; justify-content:space-between;
      border-bottom:1px solid rgba(255,255,255,.12)
    }
    footer{border-top:1px solid rgba(255,255,255,.12); text-align:center}
    .muted{color:var(--muted)}
    .status-ok{color:#5ee87b}
    .status-bad{color:#ff8a8a}
    button{
      background:rgba(255,255,255,.08); color:#fff; border:0; border-radius:14px;
      padding:8px 12px; cursor:pointer
    }
    button:hover{background:rgba(255,255,255,.16)}

    main{
    flex:1;
    /* height:100%;  ← remove */
    min-height:100svh;                /* ← cobre viewport móvel */
    /* fallback para browsers antigos */
    min-height:100vh;
    padding:16px;
    display:grid; gap:16px;
    grid-template-columns:repeat(2,1fr);
    grid-template-rows:repeat(2,1fr);
    place-items:stretch;
    /* overflow:hidden; ← remove */
    }

    /* quando quisermos bloquear scroll (kiosk/fullscreen) */
    .no-scroll{ overflow:hidden; }

    /* tile escuro */
    .tile{
      height:100%;
      border-radius:14px;
      border:1px solid rgba(255,255,255,.10);
      background:linear-gradient(135deg,var(--tile),var(--tile-grad));
      padding:12px; display:flex; flex-direction:column;
    }

    /* topo do tile */
    .row{display:flex;align-items:center;justify-content:space-between}
    .badge{
      font-size:12px; letter-spacing:.12em; text-transform:uppercase;
      padding:4px 10px; border-radius:999px;
      border:1px solid rgba(255,255,255,.18);
      background:rgba(255,255,255,.06);
    }
    .pulse{ animation:pulse 1s infinite; color:var(--live); font-weight:800; }
    @keyframes pulse{0%{opacity:1}50%{opacity:.55}100%{opacity:1}}

    /* tabela estilo TV */
    .scoretable{
      width:100%; table-layout:fixed;
      border-collapse:separate; border-spacing:0 10px; /* gap vertical entre equipas */
      margin-top:8px;
    }
    .scoretable thead th{
      font-size:var(--fs-head); text-transform:uppercase; letter-spacing:.08em;
      color:var(--muted); font-weight:700; text-align:center; padding-bottom:4px;
    }
    .scoretable thead th.names{ text-align:left; }

    .scoretable th, .scoretable td{
      border-bottom:0; padding:8px 10px; vertical-align:middle;
      background-clip:padding-box;   /* evita o fundo “sangrar” no gap */
    }

    .scoretable td.names{
      font-size:var(--fs-name); line-height:1.07;
      text-transform:uppercase;
    }
    .scoretable td.names .line{ white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

    /* centragem perfeita + caixas arredondadas nas células de sets/AGORA */
    .scoretable td.set, .scoretable td.now{ padding:0 !important; }

    .scoretable td.set > .cell{
      display:flex; align-items:center; justify-content:center;
      padding:10px 12px; min-height:2.4em;
      background:var(--set-bg); border:1px solid var(--set-br); border-radius:12px;
      font-weight:900; font-size:var(--fs-set); line-height:1; color:#fff;
    }

    .scoretable td.now > .cell-now{
      display:flex; align-items:center; justify-content:center;
      padding:10px 12px; min-height:2.6em;
      color:var(--now-fg);
      background:linear-gradient(180deg, rgba(0,255,163,.18), rgba(0,180,120,.14));
      border:1px solid rgba(0,255,163,.45); border-radius:12px;
      box-shadow: 0 0 0 2px rgba(0,255,163,.20) inset, 0 0 24px rgba(0,255,163,.15);
      font-weight:900; font-size:var(--fs-now); line-height:1;
    }

    /* placeholder e cursores */
    .placeholder{display:grid;place-items:center;color:#9b9b9b;font-size:18px}
    .hide-cursor *{cursor:none !important}

    /* responsivo */
    @media (max-width: 900px){
      header,footer{padding:10px 12px}
      main{gap:12px; padding:12px}
      .tile{padding:10px}
      .scoretable th, .scoretable td{ padding:6px 8px; }
    }

    /* overrides anti-reset */
    :root { color-scheme: dark; }
    html, body { background:#000 !important; color:#fff !important; }
    main { background:transparent !important; }
    .tile { background:linear-gradient(135deg,#0b0b0b,#141414) !important; border-color:rgba(255,255,255,.10) !important; }
  </style>
</head>
<body>
  <header>
    <strong id="screen-title">—</strong>
    <div class="muted" id="status">—</div>
    <div><button id="fs">Ecrã inteiro</button></div>
  </header>

  <main id="grid"
        data-sb-url="{{ $sbUrl }}"
        data-sb-anon="{{ $sbAnon }}"
        data-screen="{{ $screen }}">
    <div class="tile placeholder">Sem jogos configurados para este ecrã.</div>
  </main>

  <footer>
    <div class="muted">© New Padel Solutions 2025</div>
  </footer>

  <script type="module" src="/js/filament/scoreboard.js?v=24"></script>
</body>
</html>
