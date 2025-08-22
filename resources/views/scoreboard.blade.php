{{-- resources/views/scoreboard.blade.php --}}
@php
  // Puxa as credenciais do Supabase (podes trocar por strings fixas se quiseres)
  $sbUrl  = config('services.supabase.url');
  $sbAnon = config('services.supabase.anon');
@endphp
<!doctype html>
<html lang="pt">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Scoreboard – Padel (ao vivo)</title>
  <style>
    :root { --bg:#000; --fg:#fff; --muted:#b8b8b8; }
    *{box-sizing:border-box}
    html,body{height:100%; overflow:hidden}
    body{
      margin:0; background:var(--bg); color:var(--fg);
      font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif;
      display:flex; flex-direction:column;
    }
    header{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid rgba(255,255,255,.1)}
    .brand{display:flex;align-items:center;gap:10px}
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

    /* Responsivo: tablets/telemóveis */
    @media (max-width: 900px){
      header{padding:10px 12px}
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
  </style>
</head>
<body>
  <header>
    <div class="brand"><span>🎾</span><strong>Scoreboard Padel</strong><span class="muted">ao vivo (Supabase)</span></div>
    <div class="muted" id="status">—</div>
    <div><button id="fs">Ecrã inteiro</button></div>
  </header>

  <!-- Passamos as credenciais ao JS via data-attributes -->
  <main id="grid"
        data-sb-url="{{ $sbUrl }}"
        data-sb-anon="{{ $sbAnon }}">
    <div class="tile placeholder">Seleciona jogos com <code>?ids=&lt;uuid1&gt;,&lt;uuid2&gt;</code> (máx 4) • <code>&kiosk=1</code> para TV</div>
  </main>

  <!-- JS externo (module). Garante que existe em public/js/scoreboard.js -->
  <script type="module" src="/js/filament/scoreboard.js?v=2"></script>
</body>
</html>
