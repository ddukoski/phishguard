<?php

use Illuminate\Support\Facades\Route;

Route::any('/', function () {
    return response()->json([
        'message' => 'This server is API-only. Use /api/* endpoints.',
    ], 404);
});

Route::any('{any}', function () {
    return response()->json([
        'message' => 'This server serves API endpoints only. See /api for available routes.',
    ], 404);
})->where('any', '.*');
