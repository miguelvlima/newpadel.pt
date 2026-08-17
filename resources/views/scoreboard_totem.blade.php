{{-- Totem LED 480×1080 — estilo Open dos Ouriços. Não partilha UI com compact/gallery. --}}
@php
  $sbUrl  = config('services.supabase.url');
  $sbAnon = config('services.supabase.anon');
  $screen = $screen ?? 'default';
  $demoGameId = $demoGameId ?? 'fa9333dd-1b93-4948-8a95-879d6f9eb198';
@endphp
<!doctype html>
<html lang="pt">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=480, height=1080, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <title>Totem · {{ $screen }}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/css/scoreboard/totem.css?v=20" />
</head>
<body class="totem-body">
  <div
    id="totem"
    class="totem"
    data-sb-url="{{ $sbUrl }}"
    data-sb-anon="{{ $sbAnon }}"
    data-screen="{{ $screen }}"
    data-demo-game-id="{{ $demoGameId }}"
  >
    <header class="totem-header">
      <img
        class="totem-logo"
        src="/images/tournaments/3-open-dos-ouricos-logo-horizontal.png?v=2"
        alt="3º Open dos Ouriços"
        width="420"
        height="120"
      />
    </header>

    <section class="totem-side totem-side-a" aria-label="Dupla A">
      <div class="totem-photos" id="photos-a"></div>
    </section>

    <section class="totem-score" aria-label="Resultado">
      <div class="totem-score-board" id="totem-score-board"></div>
      <p class="totem-points-label" id="totem-points-label">Pontos</p>
    </section>

    <section class="totem-side totem-side-b" aria-label="Dupla B">
      <div class="totem-photos" id="photos-b"></div>
    </section>

    <footer class="totem-footer">
      <h1 class="totem-court" id="totem-court">CAMPO {{ strtoupper($screen) }}</h1>
      <p class="totem-meta" id="totem-meta">
        <span id="totem-category">M2</span>
        <span class="totem-meta-sep" aria-hidden="true">·</span>
        <span id="totem-group">Grupo A</span>
      </p>
    </footer>
  </div>

  <script type="module" src="/js/scoreboard/totem.js?v=15"></script>
</body>
</html>
