@php
  $sbUrl = config('services.supabase.url');
  $sbAnon = config('services.supabase.anon');
  $screen = $screen ?? 'default';
@endphp

<!doctype html>
<html lang="pt">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Scoreboard Compact</title>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@500;700;900&display=swap" rel="stylesheet">

  <link rel="stylesheet" href="/css/scoreboard/compact.css?v=1">
</head>
<body>
  <main
    id="compact-scoreboard"
    data-sb-url="{{ $sbUrl }}"
    data-sb-anon="{{ $sbAnon }}"
    data-screen="{{ $screen }}"
  >
    <div class="compact-card is-empty">Sem jogo configurado</div>
  </main>

  <script type="module" src="/js/scoreboard/compact.js?v=1"></script>
</body>
</html>