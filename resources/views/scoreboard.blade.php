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
    /* === Tema escuro sólido === */
    :root{
      --bg:#000;            /* fundo geral */
      --fg:#fff;            /* texto geral */
      --muted:#b7b7b7;      /* texto secundário */
      --tile:#0b0b0b;       /* cartão/tile */
      --tile-grad:#141414;
      --set-bg:rgba(255,255,255,.06);
      --set-br:rgba(255,255,255,.10);
      --live:#ff4d4d;       /* AO VIVO */
      --now-fg:#e7ffee;     /* texto AGORA */
    }
    *{box-sizing:border-box}
    html,body{height:100%; overflow:hidden}
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
    button{
      background:rgba(255,255,255,.08); color:#fff; border:0; border-radius:14px;
      padding:8px 12px; cursor:pointer
    }
    button:hover{background:rgba(255,255,255,.16)}

    /* grid de jogos (sem scroll) */
    main{
      flex:1; height:100%;
      padding:16px; display:grid; gap:16px;
      grid-template-columns:repeat(2,1fr);
      grid-template-rows:repeat(2,1fr);
      place-items:stretch; overflow:hidden;
    }

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
      width:100%; table-layout:fixed; border-collapse:separate; border-spacing:0;
      margin-top:8px;
    }
    .scoretable th, .scoretable td{
      padding:8px 10px; vertical-align:middle;
      border-bottom:1px solid rgba(255,255,255,.08);
    }
    .scoretable tr:last-child td{ border-bottom:0; }

    .scoretable thead th{
      font-size:12px; text-transform:uppercase; letter-spacing:.08em;
      color:var(--muted); font-weight:700; text-align:center;
    }
    .scoretable thead th.names{ text-align:left; }

    .scoretable td.names{
      width:56%; font-weight:800; line-height:1.05; text-transform:uppercase;
    }
    .scoretable td.names .line{ white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

    /* colunas de sets (discretas) */
    .scoretable td.set{
      width:8.5%; text-align:center; font-weight:900;
      font-size:clamp(16px,2.2vmin,24px);
      background:var(--set-bg);
      border-left:1px solid var(--set-br);
      border-right:1px solid var(--set-br);
      border-radius:8px;
    }

    /* coluna AGORA com realce verde */
    .scoretable th.now{ text-align:center; color:var(--now-fg); }
    .scoretable td.now{
      text-align:center; font-weight:900; letter-spacing:.02em;
      font-size:clamp(20px,3.2vmin,32px);
      color:var(--now-fg);
      background:linear-gradient(180deg, rgba(0,255,163,.18), rgba(0,180,120,.14));
      border:1px solid rgba(0,255,163,.45);
      border-radius:12px;
      box-shadow: 0 0 0 2px rgba(0,255,163,.20) inset, 0 0 24px rgba(0,255,163,.15);
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
      .scoretable td.names{ width:54%; }
      .scoretable td.now{ font-size:clamp(18px,4.5vmin,28px); }
    }
  </style>
</head>
<body>
  <header>
    <strong id="screen-title">—</strong>
    <div class="muted" id="status">—</div>
    <div><button id="fs">Ecrã inteiro</button></div>
  </header>

  <!-- Credenciais + screen key via data-* -->
  <main id="grid"
        data-sb-url="{{ $sbUrl }}"
        data-sb-anon="{{ $sbAnon }}"
        data-screen="{{ $screen }}">
    <div class="tile placeholder">Sem jogos configurados para este ecrã.</div>
  </main>

  <footer>
    <div class="muted">© New Padel Solutions 2025</div>
  </footer>

  <!-- aponto para o teu JS real -->
  <script type="module" src="/js/filament/scoreboard.js?v=18"></script>
</body>
</html>
