<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Services\OpenAIService;

Route::post('/llm/analyze', function (Request $request, OpenAIService $openAI) {
    $data = $request->validate([
        'text' => ['required', 'string', 'max:20000'],
    ]);

    return response()->json([
        'analysis' => $openAI->analyzeUserReport($data['text']),
    ]);
});
