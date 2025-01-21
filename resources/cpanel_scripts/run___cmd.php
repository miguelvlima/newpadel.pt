<?php
// migrate.php


if (!isset($_GET['key']) || $_GET['key'] !== 'dsamodand98hw478h478hwd') {
    die('Invalid key');
}

// Enable error reporting
ini_set('display_errors', 1);
error_reporting(E_ALL);

try {
    require __DIR__.'/../vendor/autoload.php';
    $app = require_once __DIR__.'/../bootstrap/app.php';

    // Boot the application
    $app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

    // Run migration
    $output = Artisan::call('migrate', [
        '--force' => true,
        '--verbose' => true
    ]);

    echo "<pre>";
    echo "Migration Output:\n" . Artisan::output() . "\n";
    echo "Return Code: " . $output . "\n";

    // Test database connection
    if(DB::connection()->getDatabaseName()) {
        echo "Connected to database: " . DB::connection()->getDatabaseName();
    }

} catch (Exception $e) {
    echo "<pre>";
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    echo "Trace:\n" . $e->getTraceAsString() . "\n";
    echo "</pre>";
}
