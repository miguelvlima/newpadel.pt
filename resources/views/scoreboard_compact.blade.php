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

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">

    <link rel="stylesheet" href="/css/scoreboard/scoreboard.css?v=5.0">
    <link rel="stylesheet" href="/css/scoreboard/compact.css?v=5.5">
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
        data-brand-logo="/images/tournaments/3-open-dos-ouricos-logo.png"
        data-brand-category="M2"
        data-brand-group="Grupo A"
    ></main>

    <script type="module" src="/js/scoreboard/index.js?v=5.6"></script>
</body>
</html>
