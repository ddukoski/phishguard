<?php

use Illuminate\Support\Facades\Route;

// Catch-all for any non-API web routes — return JSON indicating API-only
Route::fallback(function () {
    return response()->json([
        'message' => 'This server is API only. Use /api/* endpoints instead.'
    ], 404);
});

