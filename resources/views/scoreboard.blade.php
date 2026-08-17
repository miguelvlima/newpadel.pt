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

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">

  <link rel="stylesheet" href="/css/scoreboard/scoreboard.css?v=5.0">
</head>
<body>

  <main id="grid"
        data-sb-url="{{ $sbUrl }}"
        data-sb-anon="{{ $sbAnon }}"
        data-screen="{{ $screen }}"
        data-brand-category="M2"
        data-brand-group="Grupo A">
    <div class="tile placeholder">Sem jogos configurados para este ecrã.</div>
  </main>

  <script type="module" src="/js/scoreboard/index.js?v=5.0"></script>
</body>
</html>
