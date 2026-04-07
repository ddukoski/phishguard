<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Scenario;
use App\Models\ScenarioAttempt;
use App\Services\OpenAIService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ScenarioController extends Controller
{

    protected array $validActionTypes = [
        'scenario_viewed',
        'element_clicked',
        'element_hovered',
        'link_inspected',
        'email_header_expanded',
        'sender_checked',
        'url_analyzed',
        'profile_investigated',
        'flagged_as_threat',
        'marked_as_safe',
        'time_spent_on_element',
    ];

    public function index(Request $request): JsonResponse
    {
        $query = Scenario::active();

        if ($request->has('type')) {
            $query->ofType($request->input('type'));
        }

        if ($request->has('difficulty')) {
            $query->where('difficulty', $request->input('difficulty'));
        }

        $scenarios = $query->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 15));

        return response()->json($scenarios);
    }

    public function show(string $id): JsonResponse
    {
        $scenario = Scenario::active()->findOrFail($id);

        return response()->json(['scenario' => $scenario]);
    }

    public function start(Request $request, string $id): JsonResponse
    {
        $scenario = Scenario::active()->findOrFail($id);
        $user = $request->user();
        $userId = (string) $user->_id;

        $existingAttempt = ScenarioAttempt::where('user_id', $userId)
            ->where('scenario_id', (string) $scenario->_id)
            ->where('result', 'in_progress')
            ->first();

        if ($existingAttempt) {
            return response()->json([
                'message' => 'Scenario resumed.',
                'attempt' => $existingAttempt,
                'scenario' => $scenario,
            ], 200);
        }

        $attempt = ScenarioAttempt::create([
            'user_id' => $userId,
            'scenario_id' => (string) $scenario->_id,
            'actions' => [],
            'result' => 'in_progress',
            'score' => 0,
            'is_correct' => false,
            'time_spent_seconds' => 0,
        ]);

        ActivityLog::create([
            'user_id' => $userId,
            'attempt_id' => (string) $attempt->_id,
            'action' => 'scenario_started',
            'details' => [
                'scenario_id' => (string) $scenario->_id,
                'scenario_type' => $scenario->type,
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Scenario started.',
            'attempt' => $attempt,
            'scenario' => $scenario,
        ], 201);
    }

    public function submitAction(Request $request, string $attemptId): JsonResponse
    {
        $validated = $request->validate([
            'action' => ['required', 'string', 'in:' . implode(',', $this->validActionTypes)],
            'element_id' => ['sometimes', 'nullable', 'string'],
            'element_type' => ['sometimes', 'nullable', 'string'],
            'details' => ['sometimes', 'array'],
            'details.time_spent' => ['sometimes', 'integer', 'min:0'],
            'details.coordinates' => ['sometimes', 'array'],
            'details.viewport_visible' => ['sometimes', 'boolean'],
        ]);

        $user = $request->user();
        $attempt = ScenarioAttempt::where('_id', $attemptId)
            ->where('user_id', (string) $user->_id)
            ->where('result', 'in_progress')
            ->firstOrFail();

        $actionRecord = [
            'action' => $validated['action'],
            'element_id' => $validated['element_id'] ?? null,
            'element_type' => $validated['element_type'] ?? null,
            'details' => $validated['details'] ?? [],
            'timestamp' => now()->toISOString(),
        ];

        $actions = $attempt->actions ?? [];
        $actions[] = $actionRecord;
        $attempt->update(['actions' => $actions]);

        ActivityLog::create([
            'user_id' => (string) $user->_id,
            'attempt_id' => (string) $attempt->_id,
            'action' => 'scenario_action',
            'details' => $actionRecord,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Action recorded.',
            'attempt' => $attempt->fresh(),
        ]);
    }

    public function complete(Request $request, string $attemptId): JsonResponse
    {
        $validated = $request->validate([
            'user_identified_threat' => ['required', 'boolean'],
            'time_spent_seconds' => ['required', 'integer', 'min:0'],
            'description' => ['required', 'string', 'max:10000'],
        ]);

        $user = $request->user();
        $attempt = ScenarioAttempt::where('_id', $attemptId)
            ->where('user_id', (string) $user->_id)
            ->where('result', 'in_progress')
            ->firstOrFail();

        error_log($attempt->scenario_id);
        $scenario = Scenario::findOrFail($attempt->scenario_id);
        /** @var Scenario $scenario */
        $receivedDescription = $validated['description'] ?? null;
        $isCorrect = ($validated['user_identified_threat'] ?? false) === ($scenario->is_threat ?? false);
        $score = $isCorrect ? $this->calculateScore($scenario, $validated['time_spent_seconds']) : 0;
        $feedback = $this->generateFeedback($scenario, $isCorrect);

        $keyInteractions = $this->extractKeyInteractions($attempt->actions ?? [], $scenario);

        $scenarioData = [
            'id' => (string) $scenario->_id,
            'title' => $scenario->title ?? null,
            'description' => $scenario->description ?? null,
            'type' => $scenario->type ?? null,
            'difficulty' => $scenario->difficulty ?? null,
            'indicators' => $scenario->indicators ?? [],
            'explanation' => $scenario->explanation ?? null,
            'content' => $scenario->content ?? null,
        ];

        $attempt->update([
            'result' => $isCorrect ? 'correct' : 'incorrect',
            'score' => $score,
            'is_correct' => $isCorrect,
            'time_spent_seconds' => $validated['time_spent_seconds'],
            'feedback' => $feedback,
            'description' => $receivedDescription ?? null,
            // AI review is generated explicitly from the results screen.
            'ai_review' => null,
            'completed_at' => now(),
        ]);

        ActivityLog::create([
            'user_id' => (string) $user->_id,
            'attempt_id' => (string) $attempt->_id,
            'action' => 'scenario_completed',
            'details' => [
                'is_correct' => $isCorrect,
                'score' => $score,
                'user_identified_threat' => $validated['user_identified_threat'],
                'actual_threat' => $scenario->is_threat,
                'description' => $receivedDescription ?? null,
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => $isCorrect ? 'Correct! Well done.' : 'Incorrect. Review the feedback.',
            'attempt' => $attempt->fresh(),
            'feedback' => $feedback,
            'actual_threat' => $scenario->is_threat ?? false,
            'key_interactions' => $keyInteractions,
        ]);
    }

    public function generateAiReview(Request $request, string $attemptId, OpenAIService $openAI): JsonResponse
    {
        $user = $request->user();
        $attempt = ScenarioAttempt::where('_id', $attemptId)
            ->where('user_id', (string) $user->_id)
            ->firstOrFail();

        if (! $attempt->completed_at) {
            return response()->json([
                'message' => 'Complete the scenario before generating an AI review.',
            ], 422);
        }

        if (! empty($attempt->ai_review) && $attempt->ai_review !== 'AI review unavailable.') {
            return response()->json([
                'message' => 'AI review already generated.',
                'ai_review' => $attempt->ai_review,
                'attempt' => $attempt,
            ]);
        }

        $scenario = Scenario::findOrFail($attempt->scenario_id);
        /** @var Scenario $scenario */
        $description = trim((string) ($attempt->description ?? ''));

        if ($description === '') {
            return response()->json([
                'message' => 'A user explanation is required to generate AI review.',
            ], 422);
        }

        $scenarioData = [
            'id' => (string) $scenario->_id,
            'title' => $scenario->title ?? null,
            'description' => $scenario->description ?? null,
            'type' => $scenario->type ?? null,
            'difficulty' => $scenario->difficulty ?? null,
            'indicators' => $scenario->indicators ?? [],
            'explanation' => $scenario->explanation ?? null,
            'content' => $scenario->content ?? null,
        ];

        try {
            $analysis = $openAI->generateClassificationAnalysis($scenarioData, $description, (bool) $attempt->is_correct);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 502);
        }

        $attempt->update([
            'ai_review' => $analysis,
        ]);

        ActivityLog::create([
            'user_id' => (string) $user->_id,
            'attempt_id' => (string) $attempt->_id,
            'action' => 'scenario_ai_review_generated',
            'details' => [
                'scenario_id' => (string) $scenario->_id,
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'AI review generated.',
            'ai_review' => $analysis,
            'attempt' => $attempt->fresh(),
        ]);
    }

    private function calculateScore(Scenario $scenario, int $timeSpent): int
    {
        $baseScore = match ($scenario->difficulty) {
            'easy' => 50,
            'medium' => 100,
            'hard' => 200,
            default => 100,
        };

        $timeBonus = $timeSpent < 60 ? 25 : ($timeSpent < 120 ? 10 : 0);

        return $baseScore + $timeBonus;
    }

    private function toggleScenarioState(string $scenarioId): JsonResponse {
        $scenario = Scenario::findOrFail($scenarioId);
        $scenario->is_active = ! $scenario->is_active;
        $scenario->save();

        return response()->json([
            'message' => 'Scenario state toggled successfully.',
            'scenario' => $scenario,
        ]);
    }

    private function generateFeedback(Scenario $scenario, bool $isCorrect): array
    {
        return [
            'correct' => $isCorrect,
            'explanation' => $scenario->explanation ?? 'No explanation available.',
            'indicators' => $scenario->indicators ?? [],
            'tips' => $isCorrect
                ? ['Great job spotting the signs!', 'Keep practicing to stay sharp.']
                : [
                    'Always check the sender\'s email address carefully.',
                    'Look for spelling and grammar mistakes.',
                    'Never click suspicious links without verifying.',
                    'When in doubt, contact the supposed sender directly.',
                ],
        ];
    }

    private function extractKeyInteractions(array $actions, Scenario $scenario): array
    {
        $interactiveElements = $scenario->interactive_elements ?? [];
        $elementMap = collect($interactiveElements)->keyBy('id')->toArray();
        $keyInteractions = [];

        foreach ($actions as $action) {
            if (empty($action['element_id'])) {
                continue;
            }

            $elementInfo = $elementMap[$action['element_id']] ?? null;
            if ($elementInfo && in_array($elementInfo['type'], ['suspicious', 'malicious_link', 'social_engineering', 'red_flag'])) {
                $keyInteractions[] = [
                    'element' => $action['element_id'],
                    'action' => $action['action'],
                    'element_type' => $elementInfo['type'],
                    'element_description' => $elementInfo['description'] ?? null,
                    'user_noticed' => true,
                ];
            }
        }

        $noticedElements = collect($keyInteractions)->pluck('element')->toArray();
        foreach ($interactiveElements as $element) {
            if (! in_array($element['id'], $noticedElements) &&
                in_array($element['type'], ['suspicious', 'malicious_link', 'social_engineering', 'red_flag'])) {
                $keyInteractions[] = [
                    'element' => $element['id'],
                    'action' => null,
                    'element_type' => $element['type'],
                    'element_description' => $element['description'] ?? null,
                    'user_noticed' => false,
                ];
            }
        }

        return $keyInteractions;
    }
}
