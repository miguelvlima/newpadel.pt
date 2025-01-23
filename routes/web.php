<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {

    $rankLinks = [
        "M2" => "https://www.tiepadel.com/Rankings/7a803300-c54f-49d5-96b5-2cbd6a6bbcbd",
        "M3" => "https://www.tiepadel.com/Rankings/dc32d083-b423-4df2-bc5e-08057dc171d7",
        "M4" => "https://www.tiepadel.com/Rankings/79981824-7532-494e-b236-3fb378c0990d",
        "M5" => "https://www.tiepadel.com/Rankings/8f366b80-88bd-48fc-8de0-a36c653e8b2b",
        "F4" => "https://www.tiepadel.com/Rankings/6f7b7f5e-f68b-4ae7-9562-d25ccf9634c3",
        "F5" => "https://www.tiepadel.com/Rankings/6518768b-b43c-40cf-8b11-ab6b24b108fb",
        "MX3" => "https://www.tiepadel.com/Rankings/282d8a4e-31ec-466e-b8e4-d18426ecee42",
        "MX4" => "https://www.tiepadel.com/Rankings/32c9148a-214b-4de5-ad95-ef6b6a9dd9c4",
    ];

    return view('welcome', [
        'rankLinks' => $rankLinks,
    ]);
});

Route::get('/ementa', function () {
    return view('ementa');
});
