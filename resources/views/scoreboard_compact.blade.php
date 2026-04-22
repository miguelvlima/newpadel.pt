@php
$sbUrl = config('services.supabase.url');
$sbAnon = config('services.supabase.anon');
@endphp

<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="/css/scoreboard/compact.css">
</head>

<body data-screen="{{ $screen }}">
    
<div
id="compact-scoreboard"
data-sb-url="{{ $sbUrl }}"
data-sb-anon="{{ $sbAnon }}"
data-screen="{{ $screen }}"
></div>

<script type="module" src="/js/scoreboard/compact.js"></script>

</body>
</html>