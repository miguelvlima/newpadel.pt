<?php

use Illuminate\Support\Facades\Route;

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
