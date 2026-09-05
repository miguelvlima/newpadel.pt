{{-- Video LED 1024×512 — 4 totems idênticos aos isolados, em (0,0). --}}
@php
  if (app()->bound('debugbar')) {
      try { app('debugbar')->disable(); } catch (\Throwable $e) {}
  }
  $screens = $screens ?? ['REMAX', 'PERMEDIA', 'AURA', 'HEINEKEN'];
  $gameIds = $gameIds ?? [];
@endphp
<!doctype html>
<html lang="pt">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=1024, height=512, initial-scale=1" />
  <title>Video LED · Scoreboards</title>
  <meta name="theme-color" content="#000000" />
  <link rel="stylesheet" href="/css/scoreboard/videoled.css?v=6" />
</head>
<body class="videoled-body">
  @foreach ($screens as $screen)
    @php
      $gid = $gameIds[$screen] ?? null;
      // Mesmo URL do totem isolado — só quiet=1 para não repetir a intro ×4
      $src = url('/scoreboard/'.$screen.'/totem').'?quiet=1';
      if ($gid) {
          $src .= '&game='.urlencode($gid);
      }
    @endphp
    <iframe
      class="videoled-panel"
      src="{{ $src }}"
      title="Totem {{ $screen }}"
      width="256"
      height="512"
      loading="eager"
      scrolling="no"
    ></iframe>
  @endforeach
</body>
</html>
