@php
    $sbUrl = config('services.supabase.url');
    $sbAnon = config('services.supabase.anon');
    $screen = $screen ?? 'default';
@endphp

<!doctype html>
<html lang="pt">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Scoreboard Compact</title>

    <link rel="stylesheet" href="/css/scoreboard/scoreboard.css?v=3.3">
    <link rel="stylesheet" href="/css/scoreboard/compact.css?v=3.3">
</head>
<body class="compact">

    <header class="screenbar">
        <img id="screen-logo" alt="" style="display:none;">
        <div id="screen-title">{{ $screen }}</div>
        <div id="status"></div>
        <button id="fs" type="button">FS</button>
    </header>

    <main
        id="grid"
        data-sb-url="{{ $sbUrl }}"
        data-sb-anon="{{ $sbAnon }}"
        data-screen="{{ $screen }}"
    ></main>

    <script type="module" src="/js/scoreboard/index.js?v=3.3"></script>
</body>
</html>
