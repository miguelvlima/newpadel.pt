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
    :root { --bg:#000; --fg:#fff; --muted:#b8b8b8; }
    *{box-sizing:border-box}
    html,body{height:100%; overflow:hidden}
    body{
      margin:0; background:var(--bg); color:var(--fg);
      font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif;
      display:flex; flex-direction:column;
    }
    header, footer { padding:12px 16px; }
    header{display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,.1)}
    footer{border-top:1px solid rgba(255,255,255,.1); text-align:center}
    .muted{color:var(--muted)}
    button{background:rgba(255,255,255,.1);color:#fff;border:0;border-radius:14px;padding:8px 12px;cursor:pointer}
    button:hover{background:rgba(255,255,255,.2)}

    /* Ocupa SEMPRE 100% do ecrã, sem scroll */
    main{
      flex:1; height:100%;
      padding:16px;
      display:grid; gap:16px;
      grid-template-columns:repeat(2,1fr);
      grid-template-rows:repeat(2,1fr);
      place-items:stretch;
      overflow:hidden;
    }
    .tile{
      height:100%;
      border-radius:18px;
      border:1px solid rgba(255,255,255,.12);
      background:linear-gradient(135deg, rgba(255,255,255,.10), rgba(255,255,255,.05));
      padding:14px; display:flex; flex-direction:column;
    }
    .row{display:flex;align-items:center;justify-content:space-between}
    .badge{font-size:12px;letter-spacing:.12em;text-transform:uppercase;background:rgba(255,255,255,.1);padding:4px 8px;border-radius:6px}
    .teams{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:8px}
    .pair{display:flex;align-items:center;gap:10px;max-width:45%}
    .pair.right{justify-content:flex-end;text-align:right}
    .pair .names{font-weight:700;font-size:clamp(14px,2.2vmin,22px);line-height:1.15}
    .scoreBox{display:flex;flex-direction:column;align-items:center;min-width:40%}
    .games{font-weight:900;font-size:clamp(24px,9vmin,72px);line-height:1}
    .points{margin-top:4px;color:#eaeaea}
    .sets{margin-top:10px;display:flex;gap:6px;justify-content:center;flex-wrap:wrap}
    .set{min-width:34px;padding:6px 8px;border-radius:10px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);text-align:center}
    .set strong{font-size:16px}
    .set small{display:block;color:#ddd;font-size:11px}
    .set.current{outline:2px solid #fff;}
    .status-ok{color:#5ee87b}
    .status-bad{color:#ff8a8a}
    .placeholder{display:grid;place-items:center;color:#aaa;font-size:18px}
    .pulse{animation:pulse 1s infinite}
    @keyframes pulse{0%{opacity:1}50%{opacity:.4}100%{opacity:1}}
    .hide-cursor *{cursor:none !important}

    /* Responsivo */
    @media (max-width: 900px){
      header,footer{padding:10px 12px}
      main{gap:12px; padding:12px}
      .tile{padding:10px; border-radius:16px}
      .pair .names{font-size:clamp(12px, 3vmin, 20px)}
      .games{font-size:clamp(22px, 10vmin, 64px)}
      .set{min-width:30px; padding:5px 6px}
    }
    @media (max-width: 600px){
      .pair .names{font-size:clamp(12px, 3.5vmin, 18px)}
      .games{font-size:clamp(20px, 11vmin, 56px)}
    }

    /* --- Tabela estilo TV --- */
    .scoretable{
    width:100%; height:100%;
    table-layout:fixed; border-collapse:separate; border-spacing:0;
    }
    .scoretable td{
    vertical-align:middle; padding:8px 10px;
    border-bottom:1px solid rgba(255,255,255,.08);
    font-size:clamp(14px,2.2vmin,22px);
    }
    .scoretable tr:last-child td{ border-bottom:0; }

    .scoretable td.names{
    width:56%; font-weight:800; line-height:1.05; text-transform:uppercase;
    }
    .scoretable td.names .line{
    white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
    }

    .scoretable td.set{
    width:8.5%; text-align:center; font-weight:900;
    font-size:clamp(16px,2.2vmin,24px);
    background:rgba(255,255,255,.06);
    border-left:1px solid rgba(255,255,255,.10);
    border-right:1px solid rgba(255,255,255,.10);
    }

    .scoretable td.now{
    width:19%; text-align:center;
    font-weight:900; letter-spacing:.02em;
    font-size:clamp(20px,3.2vmin,32px);
    color:#1c1c1c;
    background:linear-gradient(180deg,#ffd877,#ffb52e);
    border-left:1px solid rgba(0,0,0,.15);
    border-right:1px solid rgba(0,0,0,.15);
    border-radius:10px;
    }
    .scoretable .now small{display:block; font-weight:700; font-size:.8em; opacity:.85;}

    /* Ajustes mobile/tablet */
    @media (max-width: 900px){
    .scoretable td{ padding:6px 8px; }
    .scoretable td.names{ width:54%; }
    .scoretable td.now{ font-size:clamp(18px,4.5vmin,28px); }
    }


  </style>
</head>
<body>
  <header>
    <!-- só o título do scoreboard (vindo da DB via JS) -->
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

  <script type="module" src="/js/filament/scoreboard.js?v=6"></script>
</body>
</html>
