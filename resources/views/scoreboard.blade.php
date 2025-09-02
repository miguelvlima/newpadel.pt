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

  <!-- Google Fonts (Bebas Neue) -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet">

  <!-- CSS do scoreboard -->
  <link rel="stylesheet" href="/css/scoreboard/scoreboard.css?v=1.0">
</head>
<body>
  <header class="app-header">
    <div class="left">
      <div id="status" class="muted">—</div>
    </div>
    <div class="center">
      <img id="screen-logo" alt="logo" style="display:none" />
      <strong id="screen-title">—</strong>
    </div>
    <div class="right">
      <button id="fs" title="Ecrã inteiro">Ecrã inteiro</button>
    </div>
  </header>

  <main id="grid"
        data-sb-url="{{ $sbUrl }}"
        data-sb-anon="{{ $sbAnon }}"
        data-screen="{{ $screen }}">
    <div class="tile placeholder">Sem jogos configurados para este ecrã.</div>
  </main>

  <footer>
    <div class="muted">© New Padel Solutions 2025</div>
  </footer>

  <!-- JS modular (ESM) -->
  <script type="module" src="/js/scoreboard/index.js?v=1.0"></script>
</body>
</html>
