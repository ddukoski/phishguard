<?php

namespace App\Services;

use OpenAI\Laravel\Facades\OpenAI;
use App\Models\Scenario;
use \RuntimeException;
use Illuminate\Support\Facades\Log;

class OpenAIService
{
    public function analyzeUserReport(string $text): string
    {
        try {
            $response = OpenAI::chat()->create([
                'model' => 'gpt-4-turbo',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are a precise cyber-security analyst. Return bullet points and a short summary. Keep it concise.',
                    ],
                    [
                        'role' => 'user',
                        'content' => $text,
                    ],
                ],
                'max_tokens' => 500,
            ]);

            return $response->choices[0]->message->content ?? '';
        } catch (\Throwable $e) {
            error_log('OpenAI Error in analyzeUserReport: ' . $e->getMessage());
            return '';
        }
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

    public function generateClassificationAnalysis(array $scenarioData, string $userDescription, bool $wasCorrect): string
    {
        $reviewModel = (string) config('openai.classification_review_model', 'gpt-5');
        $contextScenario = $scenarioData;
        if (isset($contextScenario['content']) && is_array($contextScenario['content'])) {
            unset($contextScenario['content']['html_content'], $contextScenario['content']['interactive_elements']);
        }

        $scenarioJson = json_encode($contextScenario, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) ?: '{}';
        if (strlen($scenarioJson) > 12000) {
            $scenarioJson = substr($scenarioJson, 0, 12000) . "\n... [truncated for model context]";
        }

        $userDescription = trim($userDescription);
        if (strlen($userDescription) > 3000) {
            $userDescription = substr($userDescription, 0, 3000) . "\n... [truncated]";
        }

        $performanceContext = $wasCorrect
            ? 'The learner made the correct final classification.'
            : 'The learner made an incorrect final classification.';

        $prompt = "Create a training-simulation debrief for a cybersecurity learner.\n".
            "Use the scenario JSON and the learner explanation to deeply analyze how they reasoned.\n".
            "\n".
            "Debrief goals:\n".
            "1) Assess how accurate the learner's reasoning is against observable evidence.\n".
            "2) Explain where their mental model is strong vs weak.\n".
            "3) Teach decision-making patterns they can reuse in future phishing simulations.\n".
            "4) Provide specific drills they can practice next time.\n".
            "\n".
            "Output format (markdown):\n".
            "## Debrief Verdict\n".
            "- 2-3 sentences on overall judgement and risk awareness maturity.\n".
            "\n".
            "## What You Did Well\n".
            "- 3-5 bullets tied to concrete evidence from scenario data or user explanation.\n".
            "\n".
            "## Reasoning Gaps and Missed Signals\n".
            "- 3-6 bullets, each with: missed cue -> why it matters -> likely consequence.\n".
            "\n".
            "## Thought Process Coaching\n".
            "- Analyze cognitive pitfalls (for example: rushing, over-trusting brands, anchor bias).\n".
            "- Suggest better verification sequence the learner should follow next time.\n".
            "\n".
            "## Next Simulation Playbook\n".
            "- Give a short step-by-step checklist the learner can apply in the next scenario.\n".
            "- Include 2 focused practice drills and what success looks like.\n".
            "\n".
            "Constraints:\n".
            "- Be direct, supportive, and instructional.\n".
            "- Ground every claim in observable evidence; avoid speculation.\n".
            "- Do not mention internal model limitations.\n".
            "\n".
            "Performance context: " . $performanceContext . "\n\n".
            "Scenario data (JSON):\n" . $scenarioJson . "\n\n".
            "Learner explanation:\n" . $userDescription;

        try {
            $response = OpenAI::responses()->create([
                'model' => $reviewModel,
                'input' => [
                    [
                        'role' => 'system',
                        'content' => 'You are a cybersecurity training coach. Produce rich, practical, simulation-style feedback that improves learner judgement.',
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt,
                    ],
                ],
                'max_output_tokens' => 1400,
                'text' => [
                    'verbosity' => 'medium',
                ],
            ]);

            $text = trim((string) ($response->outputText ?? ''));
            if ($text === '') {
                // Fallback: some responses complete without populated outputText in this SDK path.
                $chatResponse = OpenAI::chat()->create([
                    'model' => $reviewModel,
                    'messages' => [
                        [
                            'role' => 'system',
                            'content' => 'You are a cybersecurity training coach. Produce rich, practical, simulation-style feedback that improves learner judgement.',
                        ],
                        [
                            'role' => 'user',
                            'content' => $prompt,
                        ],
                    ],
                    'max_completion_tokens' => 1400,
                ]);

                $text = trim((string) ($chatResponse->choices[0]->message->content ?? ''));
            }

            if ($text === '') {
                $compactPrompt = "Provide a practical phishing-training debrief in markdown with sections: Verdict, What You Did Well, Missed Signals, Next Steps.\n" .
                    "Performance context: " . $performanceContext . "\n" .
                    "Scenario:\n" . $scenarioJson . "\n" .
                    "Learner explanation:\n" . $userDescription;

                $retryResponse = OpenAI::chat()->create([
                    'model' => $reviewModel,
                    'messages' => [
                        [
                            'role' => 'system',
                            'content' => 'You are a cybersecurity training coach. Be concrete and instructional.',
                        ],
                        [
                            'role' => 'user',
                            'content' => $compactPrompt,
                        ],
                    ],
                    'max_completion_tokens' => 800,
                ]);

                $text = trim((string) ($retryResponse->choices[0]->message->content ?? ''));
            }

            if ($text === '') {
                throw new RuntimeException('Empty AI review output.');
            }

            return $text;
        } catch (\Throwable $e) {
            Log::error('OpenAI classification review failed: ' . $e->getMessage());
            throw new RuntimeException('AI review generation failed. Please try again.');
        }
    }

    public function generateScenarioFromExample(string $difficulty, string $type, string $userPrompt): Scenario
    {
        $scenarioGenerationModel = (string) config('openai.scenario_generation_model', 'gpt-5');

        $exampleScenario = Scenario::where('difficulty', $difficulty)
            ->where('type', $type)
            ->where('is_active', true)
            ->first();

        if (! $exampleScenario) {
            throw new RuntimeException('No example scenario found for the selected difficulty and type.');
        }

        $exampleJson = json_encode($exampleScenario->toArray(), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

        $prompt = "Generate one new phishing training scenario based on the example scenario JSON and optional admin instruction.\n" .
            "Output must be valid JSON only (no markdown, no prose, no code fences).\n" .
            "Return exactly these fields: title, description, type, difficulty, is_threat, content, html_content, interactive_elements, indicators, explanation.\n" .
            "Do not include _id or any extra fields. Keep correct data types.\n\n" .
            "Example scenario JSON:\n" . $exampleJson . "\n\n" .
            "Admin instruction:\n" . ($userPrompt ?: 'Generate a fresh variant based on the example.') . "\n";

        try {
            $response = OpenAI::responses()->create([
                'model' => $scenarioGenerationModel,
                'input' => [
                    [
                        'role' => 'system',
                        'content' => 'You are a JSON generator. Return only valid JSON objects.',
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt,
                    ],
                ],
                'max_output_tokens' => 4000,
                'text' => [
                    'verbosity' => 'low',
                ],
            ]);

            $text = trim((string) ($response->outputText ?? ''));
            error_log('AI generated scenario raw: ' . $text);

            if ($text === '') {
                throw new RuntimeException('Failed to parse JSON from model output: empty response from model');
            }

            $cleanText = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $text) ?? $text;

            $decoded = json_decode($cleanText, true);
            if (json_last_error() !== JSON_ERROR_NONE || ! is_array($decoded)) {
                throw new RuntimeException('Failed to parse JSON from model output: ' . json_last_error_msg());
            }

            $required = ['title', 'description', 'type', 'difficulty', 'is_threat', 'content', 'html_content', 'interactive_elements', 'indicators', 'explanation'];
            foreach ($required as $field) {
                if (! array_key_exists($field, $decoded)) {
                    throw new RuntimeException('AI returned an invalid scenario structure; missing ' . $field);
                }
            }

            return new Scenario($decoded);
        } catch (\Throwable $e) {
            error_log('OpenAI generateScenarioFromExample error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Extracts a JSON object or array from an arbitrary piece of text.
     * Handles code fences and returns the first balanced JSON object/array found, or null.
     */
    private function extractJsonFromText(string $text): ?string
    {
        $text = trim($text);

        if (preg_match('/```(?:json)?\s*(.*?)\s*```/si', $text, $m)) {
            $text = $m[1];
        }

        $startPos = null;
        $len = strlen($text);
        for ($i = 0; $i < $len; $i++) {
            if ($text[$i] === '{' || $text[$i] === '[') {
                $startPos = $i;
                break;
            }
        }

        if ($startPos === null) {
            return null;
        }

        $openChar = $text[$startPos];
        $closeChar = $openChar === '{' ? '}' : ']';

        $depth = 0;
        $inString = false;
        $escape = false;

        for ($i = $startPos; $i < $len; $i++) {
            $ch = $text[$i];

            if ($escape) {
                $escape = false;
                continue;
            }

            if ($ch === '\\') {
                $escape = true;
                continue;
            }

            if ($ch === '"') {
                $inString = !$inString;
                continue;
            }

            if ($inString) {
                continue;
            }

            if ($ch === $openChar) {
                $depth++;
            } elseif ($ch === $closeChar) {
                $depth--;
                if ($depth === 0) {
                    return substr($text, $startPos, $i - $startPos + 1);
                }
            }
        }

        return null;
    }
}

