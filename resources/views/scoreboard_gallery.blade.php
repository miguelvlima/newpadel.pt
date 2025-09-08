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
  <title>Media • {{ $screen }}</title>
  <style>
    :root{
      --app-h: 100vh;
      --bg:#000; --fg:#fff;

      /* Alturas do header/footer */
      --header-h: clamp(60px, 12vh, 140px);
      --footer-h: clamp(52px, 10vh, 120px);

      /* Margens e raio do palco (slides) */
      --stage-pad-x: clamp(16px, 4vw, 64px);
      --stage-pad-y: clamp(16px, 5vh, 64px);
      --stage-radius: 0px;
    }

    *{box-sizing:border-box}
    html,body{height:var(--app-h); overflow:hidden}
    body{
      margin:0; background:var(--bg); color:var(--fg);
      font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif;
      display:grid; grid-template-rows: var(--header-h) 1fr var(--footer-h);
    }

    header, footer{
      display:flex; align-items:center; justify-content:center; padding:8px 12px;
      background:#000;
    }
    header{ border-bottom:1px solid rgba(255,255,255,.12); }
    footer{ border-top:1px solid rgba(255,255,255,.12); }

    .brand-img{
      max-height:100%;
      max-width:95%;
      object-fit:contain;
      display:block;
    }

    /* Palco */
    main#media-stage{
      position:relative;
      overflow:hidden;
      background:#000;
    }

    /* Cada slide respeita margens via inset */
#media-stage .slide{
  position:absolute;
  inset: var(--stage-pad-y) var(--stage-pad-x);
  display:flex; align-items:center; justify-content:center;
  opacity:0; transition:opacity .6s ease;
  background:#000;
  /* sem border-radius / overflow:hidden para não cortar */
}

#media-stage .slide.is-active{ opacity:1; }

#media-stage .slide img,
#media-stage .slide video{
  max-width:100%;
  max-height:100%;
  width:auto;
  height:auto;
  object-fit:contain;   /* não corta nada */
  display:block;
  background:#000;
}


    .hint{
      position:absolute; right:8px; bottom:8px;
      color:#9aa; font-size:12px; letter-spacing:.06em
    }
  </style>
</head>
<body>
  <header><img id="media-header" class="brand-img" alt="header"/></header>
  <main id="media-stage"><div class="hint">Sem slides</div></main>
  <footer><img id="media-footer" class="brand-img" alt="footer"/></footer>

  <script type="module" src="/js/scoreboard/screensaver.js?v=2" defer></script>
  <script>
    // Ajuste de 100vh real em mobile
    (function(){
      const setAppHeight = () => {
        document.documentElement.style.setProperty('--app-h', `${window.innerHeight}px`);
      };
      setAppHeight();
      window.addEventListener('resize', setAppHeight, { passive:true });
      window.addEventListener('orientationchange', setAppHeight, { passive:true });
      document.addEventListener('fullscreenchange', setAppHeight);
    })();

    // Expor config ao JS
    window.__SB = {
      url: @json($sbUrl),
      anon: @json($sbAnon),
      screen: @json($screen)
    };
  </script>
</body>
</html>
