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
    /* defaults (serão substituídos via JS por tile) */
    :root{
    --fs-name: 22px;   /* nomes (duas linhas) */
    --fs-set:  26px;   /* números dos sets */
    --fs-now:  36px;   /* “AGORA” bem grande */
    --fs-head: 12px;   /* cabeçalhos das colunas */
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

    /* mantém o espaçamento vertical entre as duas filas (equipas) */
    .scoretable{
    border-collapse: separate;
    border-spacing: 0 8px;
    }
    .scoretable th,
    .scoretable td{
    border-bottom:0 !important;
    padding:8px 10px;
    vertical-align:middle;
    background-clip: padding-box;
    }

    .scoretable thead th{ font-size: var(--fs-head); }
    .scoretable thead th.names{ text-align:left; }

    .scoretable td.names{ font-size: var(--fs-name); line-height:1.07; }
    .scoretable td.names .line{ white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

    /* colunas de sets (discretas) */
    .scoretable td.set{   font-size: var(--fs-set);  font-weight:900; }

    /* coluna AGORA com realce verde */
    .scoretable th.now,
    .scoretable td.now{   font-size: var(--fs-now); }

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

    /* --- overrides anti-reset: tema escuro forçado --- */
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
  <script type="module" src="/js/filament/scoreboard.js?v=20"></script>
</body>
</html>
