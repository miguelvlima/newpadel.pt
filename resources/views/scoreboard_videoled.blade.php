{{-- Video LED 1024×512 — 4 totems live (selection + placar), origem (0,0). --}}
@php
  if (app()->bound('debugbar')) {
      try { app('debugbar')->disable(); } catch (\Throwable $e) {}
  }
  $screens = $screens ?? ['REMAX', 'PERMEDIA', 'AURA', 'HEINEKEN'];
@endphp
<!doctype html>
<html lang="pt">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=1024, height=512, initial-scale=1" />
  <title>Video LED · Scoreboards</title>
  <meta name="theme-color" content="#000000" />
  <link rel="stylesheet" href="/css/scoreboard/videoled.css?v=7" />
</head>
<body class="videoled-body">
  @foreach ($screens as $screen)
    {{-- Mesmo totem isolado: lê selection live; troca de jogo → intro --}}
    <iframe
      class="videoled-panel"
      src="{{ url('/scoreboard/'.$screen.'/totem') }}"
      title="Totem {{ $screen }}"
      width="256"
      height="512"
      loading="eager"
      scrolling="no"
    ></iframe>
  @endforeach
</body>
</html>
