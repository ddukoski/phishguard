<?php

use Illuminate\Support\Facades\Route;

Route::fallback(function () {
    return response()->json([
        'message' => 'This server is API only. Use /api/* endpoints instead.'
    ], 404);
});
