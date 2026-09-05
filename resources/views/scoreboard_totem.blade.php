{{-- Totem LED 256×512 — estilo Open dos Ouriços. Não partilha UI com compact/gallery. --}}
@php
  if (app()->bound('debugbar')) {
      app('debugbar')->disable();
  }
  $sbUrl  = config('services.supabase.url');
  $sbAnon = config('services.supabase.anon');
  $screen = $screen ?? 'default';
  $embed = request()->boolean('embed');
  $quiet = request()->boolean('quiet') || $embed;
  $gameId = request()->query('game') ?: ($demoGameId ?? null);
  // Em embed nunca usar o jogo demo antigo — só selection/?game=
  if ($embed && !request()->query('game')) {
      $gameId = null;
  }
@endphp
<!doctype html>
<html lang="pt" class="totem-html{{ $embed ? ' is-embed' : '' }}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
  <title>Totem · {{ $screen }}</title>
  <meta name="theme-color" content="#080b10" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="mobile-web-app-capable" content="yes" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/css/scoreboard/totem.css?v=48" />
</head>
<body class="totem-body{{ $embed ? ' is-embed' : '' }}">
  <div
    id="totem"
    class="totem is-intro"
    data-sb-url="{{ $sbUrl }}"
    data-sb-anon="{{ $sbAnon }}"
    data-screen="{{ $screen }}"
    data-game-id="{{ $gameId }}"
    data-embed="{{ $embed ? '1' : '0' }}"
    data-quiet="{{ $quiet ? '1' : '0' }}"
  >
    <header class="totem-header">
      <img
        class="totem-logo"
        src="/images/tournaments/3-open-dos-ouricos-logo-horizontal.png?v=2"
        alt="3º Open dos Ouriços"
        width="220"
        height="64"
      />
    </header>

    <section class="totem-side totem-side-a" aria-label="Dupla A">
      <div class="totem-photos" id="photos-a"></div>
    </section>

    <section class="totem-score" aria-label="Resultado">
      <div class="totem-show-vs" id="totem-show-vs" aria-hidden="true">
        <span class="totem-show-vs-text">VS</span>
      </div>
      <div class="totem-name-stage" id="totem-name-stage" aria-live="polite">
        <p class="totem-name-stage-text" id="totem-name-stage-text"></p>
      </div>
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

    <section class="totem-others" id="totem-others" aria-label="Outros campos"></section>

    {{-- Camada SHOW TOTAL (só na intro) --}}
    <div class="totem-show" id="totem-show" aria-hidden="true">
      <div class="totem-show-flash"></div>
      <div class="totem-show-beams"></div>
      <div class="totem-show-sparks" id="totem-show-sparks"></div>
      <div class="totem-show-logo-wrap" id="totem-show-logo-wrap">
        <img
          class="totem-show-logo"
          src="/images/tournaments/3-open-dos-ouricos-logo-horizontal.png?v=2"
          alt=""
          width="220"
          height="64"
        />
      </div>
    </div>
  </div>

  <script type="module" src="/js/scoreboard/totem.js?v=37"></script>
</body>
</html>
