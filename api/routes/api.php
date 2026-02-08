<?php

use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\AdminScenarioController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProgressController;
use App\Http\Controllers\ScenarioController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Services\OpenAIService;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

Route::get('/ping', fn () => response()->json(['pong' => true]));

/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    // Profile
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::put('/profile/password', [ProfileController::class, 'updatePassword']);

    // Scenarios
    Route::get('/scenarios', [ScenarioController::class, 'index']);
    Route::get('/scenarios/{id}', [ScenarioController::class, 'show']);
    Route::post('/scenarios/{id}/start', [ScenarioController::class, 'start']);
    Route::post('/attempts/{attemptId}/action', [ScenarioController::class, 'submitAction']);
    Route::post('/attempts/{attemptId}/complete', [ScenarioController::class, 'complete']);

    // Progress & Dashboard
    Route::get('/progress/dashboard', [ProgressController::class, 'dashboard']);
    Route::get('/progress/history', [ProgressController::class, 'history']);
    Route::get('/progress/leaderboard', [ProgressController::class, 'leaderboard']);

    /*
    |--------------------------------------------------------------------------
    | Admin Routes
    |--------------------------------------------------------------------------
    */
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/dashboard', [AdminController::class, 'dashboard']);

        // User management
        Route::get('/users', [AdminController::class, 'users']);
        Route::get('/users/{id}', [AdminController::class, 'showUser']);
        Route::patch('/users/{id}/toggle-status', [AdminController::class, 'toggleUserStatus']);
        Route::patch('/users/{id}/role', [AdminController::class, 'updateUserRole']);

        // Scenario management
        Route::get('/scenarios', [AdminScenarioController::class, 'index']);
        Route::post('/scenarios', [AdminScenarioController::class, 'store']);
        Route::get('/scenarios/{id}', [AdminScenarioController::class, 'show']);
        Route::put('/scenarios/{id}', [AdminScenarioController::class, 'update']);
        Route::delete('/scenarios/{id}', [AdminScenarioController::class, 'destroy']);
    });

    Route::post('/llm/analyze', function (Request $request, OpenAIService $openAI) {
        $data = $request->validate([
            'text' => ['required', 'string', 'max:20000'],
        ]);

        return response()->json([
            'analysis' => $openAI->analyzeUserReport($data['text']),
        ]);
    });
});