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

  <!-- Google Fonts: Bebas Neue -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet">

  <style>
    :root{
      --bg:#000; --fg:#fff; --muted:#b7b7b7;
      --tile:#0b0b0b; --tile-grad:#141414;
      --set-bg:rgba(255,255,255,.08); --set-br:rgba(255,255,255,.16);
      --live:#9fce64; --now-fg:#9fce64;
      --app-h: 100vh;
      --now-glow: 159,206,100;   /* r,g,b */

      --fs-name: 22px;  --fs-set: 26px;  --fs-now: 26px;  --fs-head: 12px;
      --fs-badge: 14px;
      --set-minw: 110px;
      --spacer-w: 18px;

      --gap-v: 10px; --pad-cell-y: 10px; --pad-cell-x: 12px;
      --badge-pad-y: 6px; --badge-pad-x: 12px; --badge-radius: 999px;
      --names-pad-l: var(--pad-cell-x);
      --grid-pad: 16px; --grid-gap: 16px; --tile-pad: 12px;

      --header-logo-h: 48px;

      --pad-cell-y-tight: calc(var(--pad-cell-y) * .66);
      --pad-cell-x-tight: calc(var(--pad-cell-x) * .80);

    }

    *{box-sizing:border-box}
    html,body{ height: var(--app-h); overflow:hidden; }
    body{
      margin:0; background:var(--bg); color:var(--fg);
      -webkit-font-smoothing:antialiased; -moz-osx-font-smoothing:grayscale;
      font-family:'Bebas Neue', system-ui,-apple-system,'Segoe UI',Roboto,Ubuntu,Cantarell,'Noto Sans',sans-serif;
      letter-spacing:.02em;
      display:flex; flex-direction:column;
      text-transform:uppercase;
    }

    header, footer { padding:12px 16px; flex: 0 0 auto; }
    header{ display:grid; grid-template-columns: 1fr auto auto; align-items:center; gap:12px; border-bottom:1px solid rgba(255,255,255,.12) }
    footer{ border-top:1px solid rgba(255,255,255,.12); text-align:center }
    .muted{color:var(--muted)} .status-ok{color:#5ee87b} .status-bad{color:#ff8a8a}
    button{ background:rgba(255,255,255,.08); color:#fff; border:0; padding:8px 12px; cursor:pointer; font-family:inherit }
    button:hover{background:rgba(255,255,255,.16)}

    main{
      flex:1 1 auto; min-height:0;
      padding:var(--grid-pad); display:grid; gap:var(--grid-gap);
      grid-template-columns:repeat(2,1fr); grid-template-rows:repeat(2,1fr);
      place-items:stretch; overflow:hidden;
    }

    .tile{
      height:100%;
      border:1px solid rgba(255,255,255,.10);
      background:linear-gradient(135deg,var(--tile),var(--tile-grad));
      padding:var(--tile-pad); display:flex; flex-direction:column; min-height:0; overflow:hidden;
    }

    .row{ display:grid; grid-template-columns: 1fr auto; align-items:center; }
    .row .left{ min-width:0; overflow:hidden; } .row .right{ justify-self:end; }

    .badge{ display:inline-flex; align-items:center; justify-content:center; font-size: var(--fs-badge);
      letter-spacing:.08em; padding: var(--badge-pad-y) var(--badge-pad-x);
      border:1px solid rgba(255,255,255,.18); background:rgba(255,255,255,.06);
      line-height:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width: 100%;
    }
    .row .badge.court{ margin-left: var(--names-pad-l); }
    .row .badge.status{ border-color: rgba(255,255,255,.22); }
    .pulse{ animation:pulse 1s infinite; color:var(--live); font-weight:800 }
    @keyframes pulse{0%{opacity:1}50%{opacity:.55}100%{opacity:1}}

    /* Right-aligned results block with small spacer */
    .scoretable{ width:100%; table-layout:auto; border-collapse:separate; border-spacing:0 var(--gap-v); margin-top:8px; }
    .scoretable thead th{ font-size:var(--fs-head); letter-spacing:.08em; color:var(--muted); font-weight:700; text-align:center; padding-bottom:4px; }
    .scoretable thead th.names{ text-align:left; }
    .scoretable th, .scoretable td{ border-bottom:0; padding:8px 10px; vertical-align:middle; background-clip:padding-box }
    .scoretable td.names{ font-size:var(--fs-name); line-height:1.07; padding-left: var(--names-pad-l); }
    .scoretable td.names .line{ white-space:nowrap; overflow:hidden; text-overflow:ellipsis }
    .scoretable th.flexfill, .scoretable td.flexfill{ width: var(--spacer-w); padding:0; }

    .scoretable td.set, .scoretable td.now{ padding:0 !important; }

    .scoretable td.set > .cell{
      display:flex; align-items:center; justify-content:center;
  padding: var(--pad-cell-y-tight) var(--pad-cell-x-tight);
  line-height: 1;               /* já deves ter, mas ajuda a caber mais */
  min-height: 2.4em;            /* opcional: baixa ligeiramente (era 2.6em) */
      min-width: var(--set-minw);
      background:var(--set-bg); border:1px solid var(--set-br);
      font-weight:900; font-size:var(--fs-set); line-height:1; color:#fff;
      font-variant-numeric: tabular-nums;
      overflow: hidden;
    }

    .scoretable td.now > .cell-now{
      display:flex; align-items:center; justify-content:center;
  padding: var(--pad-cell-y-tight) var(--pad-cell-x-tight);
  line-height: 1;               /* já deves ter, mas ajuda a caber mais */
  min-height: 2.4em;            /* opcional: baixa ligeiramente (era 2.6em) */
      min-width: var(--set-minw);
      color:var(--now-fg);
      background:linear-gradient(180deg, rgba(var(--now-glow), .18), rgba(var(--now-glow), .10));
      border:1px solid rgba(var(--now-glow), .45);
      box-shadow: 0 0 0 2px rgba(var(--now-glow), .20) inset, 0 0 24px rgba(var(--now-glow), .15);
      font-weight:900; font-size:var(--fs-set); line-height:1;
      font-variant-numeric: tabular-nums;
      overflow: hidden;
    }

    .scoretable .cell .num,
    .scoretable .cell-now .num{
        display: inline-block;      /* necessário para medir e escalar */
        line-height: 1;
        transform-origin: center;
        will-change: transform;
    }

    .placeholder{display:grid;place-items:center;color:#9b9b9b;font-size:18px}
    .hide-cursor *{cursor:none !important}

    .app-header{
        display:grid;
        grid-template-columns: 1fr auto 1fr; /* status à esquerda, logo ao centro, botão à direita */
        align-items:center;
        gap:12px;
        padding:12px 16px;
        border-bottom:1px solid rgba(255,255,255,.12);
        }

        .app-header .left { justify-self:start; min-width:0; }
        .app-header .center { justify-self:center; text-align:center; min-width:0; }
        .app-header .right { justify-self:end; }

        #screen-logo{
        max-height: var(--header-logo-h);
        max-width: min(50vw, 320px);
        object-fit: contain;
        display:inline-block;            /* é mostrado/ocultado via JS */
        vertical-align:middle;
        }

        #screen-title{
        /* fallback quando não há logo */
        display:inline-block;
        font-size: 18px;
        letter-spacing:.14em;
        }

    #status { font-variant-numeric: tabular-nums; }

    @media (max-width: 900px){
      header,footer{padding:10px 12px}
      main{gap:12px; padding:12px}
      .tile{padding:10px}
      .scoretable th, .scoretable td{ padding:6px 8px; }
    }
  </style>
</head>
<body>
    <header class="app-header">
    <div class="left">
        <div class="muted" id="status">—</div>
    </div>

    <div class="center">
        <img id="screen-logo" alt="logo" style="display:none" />
        <strong id="screen-title" style="display:none">—</strong>
    </div>

    <div class="right">
        <button id="fs">Ecrã inteiro</button>
    </div>
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

  <script type="module" src="/js/filament/scoreboard.js?v=76"></script>
</body>
</html>
