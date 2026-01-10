<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

Route::get('/', function () {

    $rankLinks = [
        "M2" => "https://www.tiepadel.com/Rankings/514f428f-d845-49d1-8b9e-28e6cab2d7b0",
        "M3" => "https://www.tiepadel.com/Rankings/033580d9-777f-4f95-8e02-bc1d494e6614",
        "M4" => "https://www.tiepadel.com/Rankings/e566b977-9ce2-485d-ae3e-a966c86b297d",
        "M5" => "https://www.tiepadel.com/Rankings/7ebfc2c2-eeda-40a1-8f8d-5c14694d3a4e",
        "F3" => "https://www.tiepadel.com/Rankings/2d59a44e-aa80-4f07-97cb-5714bba2f2d8",
        "F4" => "https://www.tiepadel.com/Rankings/ff77831e-9fe3-4b1a-b62a-0a5ee1650922",
        "F5" => "https://www.tiepadel.com/Rankings/eaac73f1-3381-4e72-bf4f-f32a24a68bc9",
        "MX3" => "https://www.tiepadel.com/Rankings/b8696ed2-4974-4a7a-9418-e0a83477be8b",
        "MX4" => "https://www.tiepadel.com/Rankings/d11e5723-7213-44c7-a49a-740d5ec84370",
    ];

    return view('welcome', [
        'rankLinks' => $rankLinks,
    ]);
});

Route::get('/ementa', function () {
    return view('ementa');
});

Route::get('/scoreboard/{screen?}', function (string $screen = 'default') {
    return view('scoreboard', ['screen' => $screen]); // o Blade já usa $screen
})->where('screen', '[A-Za-z0-9_-]+');

Route::get('/scoreboard/{screen}/gallery', function (string $screen) {
    return view('scoreboard_gallery', ['screen' => $screen]);
})->name('scoreboard.gallery');

Route::get('/calendario', function (Request $request) {
    // Ano via ?events-year=2026 (igual ao exemplo)
    $year = (int)($request->query('events-year', now()->year));

    return view('calendario', [
        'year' => $year,
    ]);
});

Route::get('/api/calendario', function (Request $request) {
    $year = (int)($request->query('year', now()->year));
    $q = trim((string)$request->query('q', ''));

    $start = sprintf('%04d-01-01', $year);
    $end   = sprintf('%04d-12-31', $year);

    $base = rtrim(config('services.padel_calendar_supabase.url'), '/');
    $key  = config('services.padel_calendar_supabase.anon');

    $url = $base . '/rest/v1/v_torneios_com_categorias';

    // filtro por ano (data_inicio)
    $params = [
        'select' => 'id,nome,clube,data_inicio,data_fim,preco_publico,preco_socio,categorias,banner_path,url_inscricao',
        'data_inicio' => "gte.$start",
        'data_inicio' => "gte.$start", // placeholder (vai ser sobrescrito? não)
    ];

    // Em vez de params duplicados, vamos montar query manualmente (mais claro)
    $query = http_build_query([
        'select' => 'id,nome,clube,clube_logo_path,data_inicio,data_fim,preco_publico,preco_socio,categorias,banner_path,url_inscricao',
        'data_inicio' => "gte.$start",
        'data_inicio' => "gte.$start",
    ]);

    // Laravel não gosta de keys repetidas em arrays; fazemos query string manual:
    $query = 'select=' . rawurlencode('id,nome,clube,clube_logo_path,data_inicio,data_fim,preco_publico,preco_socio,categorias,banner_path,url_inscricao')
           . '&data_inicio=gte.' . rawurlencode($start)
           . '&data_inicio=lte.' . rawurlencode($end)
           . '&order=' . rawurlencode('data_inicio.asc');

    $res = Http::withHeaders([
        'apikey' => $key,
        'Authorization' => 'Bearer ' . $key,
        'Accept' => 'application/json',
    ])->get($url . '?' . $query);

    if (!$res->ok()) {
        return response()->json([
            'error' => 'Supabase error',
            'status' => $res->status(),
            'body' => $res->json(),
        ], 500);
    }

    $data = $res->json() ?? [];

    // Pesquisa simples no backend (opcional) — nome/clube/categorias
    if ($q !== '') {
        $qq = mb_strtolower($q);
        $data = array_values(array_filter($data, function ($ev) use ($qq) {
            $cats = '';
            if (isset($ev['categorias']) && is_array($ev['categorias'])) {
                foreach ($ev['categorias'] as $c) {
                    $cats .= ' ' . ($c['codigo'] ?? '') . ' ' . ($c['nome'] ?? '');
                }
            }
            $hay = mb_strtolower(($ev['nome'] ?? '') . ' ' . ($ev['clube'] ?? '') . ' ' . $cats);
            return str_contains($hay, $qq);
        }));
    }

    $base = $url . '/storage/v1/object/public/';
    foreach ($data as &$ev) {
        $path = $ev['banner_path'] ?? null;
        $ev['banner_url'] = $path ? $path : null;

        $logo = $ev['clube_logo_path'] ?? null;
        $ev['clube_logo_url'] = $logo ? $logo : null;
    }
    unset($ev);

    // devolve
    return response()->json([
        'year' => $year,
        'count' => count($data),
        'events' => $data,
    ]);
});
