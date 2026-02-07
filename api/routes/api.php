<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Services\OpenAIService;

Route::post('/llm/analyze', function (Request $request, OpenAIService $openAI) {
    throw new \BadMethodCallException('Route /llm/analyze is not yet implemented');
});
