<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'supabase' => [
        'url'  => 'https://fdyqkgprxtileyhctkgn.supabase.co',
        'anon' => 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkeXFrZ3ByeHRpbGV5aGN0a2duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0MzQzODMsImV4cCI6MjA3MTAxMDM4M30.PvHpyPt7Ksjpgj0xfVIK1D6PwGlmVDGbKWO4aB0mEpk',
    ],

    'padel_calendar_supabase' => [
        'url'  => 'https://kjtkqbisuuhbxjatbaoj.supabase.co',
        'anon' => 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqdGtxYmlzdXVoYnhqYXRiYW9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMjkwMTYsImV4cCI6MjA4MzYwNTAxNn0.-2csT07fSlLDAYOypC_-HB5T0gZBa2zpUTRum5NtCts',
    ],

];
