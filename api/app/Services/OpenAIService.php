<?php

namespace App\Services;

use OpenAI\Laravel\Facades\OpenAI;

class OpenAIService
{
    public function analyzeUserReport(string $text): string
    {
        $response = OpenAI::responses()->create([
            'model' => 'gpt-5',
            'input' => [
                [
                    'role' => 'developer',
                    'content' => 'You are a precise cyber-security analyst. Return bullet points and a short summary. Keep it concise.',
                ],
                [
                    'role' => 'user',
                    'content' => $text,
                ],
            ],
            'max_output_tokens' => 500,
            'text' => [
                'verbosity' => 'low',
            ],
        ]);

        return $response->outputText ?? '';
    }

    // TODO: Make this function validate the report made make initally by analyzeUserReport().
    private function validateAIReport(string $analysis): string
    {
        $response = OpenAI::responses()->create([
            'model' => 'gpt-5',
            'input' => [
                [
                    'role' => 'developer',
                    'content' => 'You are a validator. Remove speculation, fix inconsistencies, and keep output with a maximum of three paragraphs and a minimum of 1 sentence.',
                ],
                [
                    'role' => 'user',
                    'content' => $analysis,
                ],
            ],
            'max_output_tokens' => 500,
            'text' => [
                'verbosity' => 'low',
            ],
        ]);

        return $response->outputText ?? '';
    }
}
