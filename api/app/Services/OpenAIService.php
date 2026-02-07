<?php

namespace App\Services;

class OpenAIService
{
    public function analyzeUserActions(string $text): string
    {
        throw new \BadMethodCallException('OpenAIService::analyzeUserActions is not implemented.');
    }

    private function validateAIReport(string $analysis): string
    {
        throw new \BadMethodCallException('OpenAIService::validateAIReport is not implemented.');
    }
}
