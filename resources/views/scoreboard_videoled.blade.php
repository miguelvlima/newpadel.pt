{{-- Video LED 1024×512 — 4 totems live (selection + placar), origem (0,0).

  Tipografia (escalas, 1 = tamanho base actual; tipicamente 0.5–2):
  ?zoom=1.1     → multiplica TUDO
  ?score=1.2    → placar central (cabeçalhos + números)
  ?sets=0.9     → só jogos/sets do placar (extra sobre score)
  ?pts=1.1      → só pontos do game actual (extra sobre score)
  ?others=1.3   → bloco "outros campos"
  ?footer=0.9   → "CAMPO …" + categoria/grupo em baixo

  Ex.: /scoreboard/videoled?score=1.15&others=1.2&footer=0.95
--}}
@php
  if (app()->bound('debugbar')) {
      try { app('debugbar')->disable(); } catch (\Throwable $e) {}
  }
  $screens = $screens ?? ['REMAX', 'PERMEDIA', 'AURA', 'HEINEKEN'];
  $iframeQs = ['videoled' => '1'];
  foreach (['zoom', 'score', 'sets', 'pts', 'others', 'footer'] as $k) {
      $raw = request()->query($k);
      if ($raw !== null && $raw !== '' && is_numeric($raw)) {
          $iframeQs[$k] = (string) max(0.35, min(4.0, (float) $raw));
      }
  }
  $iframeQuery = http_build_query($iframeQs);
@endphp
<!doctype html>
<html lang="pt">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=1024, height=512, initial-scale=1" />
  <title>Video LED · Scoreboards</title>
  <meta name="theme-color" content="#000000" />
  <link rel="stylesheet" href="/css/scoreboard/videoled.css?v=9" />
</head>
<body class="videoled-body">
  @foreach ($screens as $screen)
    {{-- Mesmo totem isolado: lê selection live; troca de jogo → intro --}}
    <iframe
      class="videoled-panel"
      src="{{ url('/scoreboard/'.$screen.'/totem').'?'.$iframeQuery }}"
      title="Totem {{ $screen }}"
      width="256"
      height="512"
      loading="eager"
      scrolling="no"
    ></iframe>
  @endforeach
</body>
</html>
