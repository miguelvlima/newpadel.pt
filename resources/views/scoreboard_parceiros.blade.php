{{-- Video LED 2048×1024 — 4 blocos iguais ao /scoreboard/videoled, a rodar parceiros.

  ?slug=3-open-dos-ouricos
  ?interval=12   → segundos por parceiro em cada retângulo (ciclo completo)
--}}
@php
  if (app()->bound('debugbar')) {
      try { app('debugbar')->disable(); } catch (\Throwable $e) {}
  }
  $slug = preg_match('/^[a-z0-9-]{3,80}$/i', (string) request()->query('slug', ''))
      ? (string) request()->query('slug')
      : '3-open-dos-ouricos';
  $intervalRaw = request()->query('interval');
  $interval = is_numeric($intervalRaw) ? max(4, min(60, (float) $intervalRaw)) : 12;
  $partnersJson = json_encode($partners ?? [], JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP);
@endphp
<!doctype html>
<html lang="pt">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=2048, height=1024, initial-scale=1" />
  <title>Video LED · Parceiros</title>
  <meta name="theme-color" content="#000000" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/css/scoreboard/videoled.css?v=10" />
  <link rel="stylesheet" href="/css/scoreboard/parceiros.css?v=2" />
</head>
<body class="videoled-body parceiros-body" data-slug="{{ $slug }}" data-interval="{{ $interval }}">
  @for ($i = 0; $i < 4; $i++)
    <article class="videoled-panel parceiros-panel" data-slot="{{ $i }}" aria-live="polite">
      <header class="parceiros-header">
        <img
          class="parceiros-event-logo"
          src="/images/tournaments/3-open-dos-ouricos-logo-horizontal.png?v=2"
          alt="3º Open dos Ouriços"
          width="220"
          height="64"
        />
      </header>
      <div class="parceiros-card">
        <div class="parceiros-logo-wrap">
          <img class="parceiros-logo" alt="" hidden />
          <span class="parceiros-logo-fallback" hidden></span>
        </div>
        <p class="parceiros-name"></p>
        <p class="parceiros-desc"></p>
      </div>
    </article>
  @endfor
  <script type="application/json" id="parceiros-boot">{!! $partnersJson !!}</script>
  <script type="module" src="/js/scoreboard/parceiros.js?v=4"></script>
</body>
</html>
