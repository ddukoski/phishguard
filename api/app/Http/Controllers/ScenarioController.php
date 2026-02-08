<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Scenario;
use App\Models\ScenarioAttempt;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ScenarioController extends Controller
{
    /**
     * List all active scenarios (with optional filters).
     */
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

    /**
     * Get a single scenario by ID.
     */
    public function show(string $id): JsonResponse
    {
        $scenario = Scenario::active()->findOrFail($id);

        return response()->json([
            'scenario' => $scenario,
        ]);
    }

    /**
     * Start a scenario attempt.
     */
    public function start(Request $request, string $id): JsonResponse
    {
        $scenario = Scenario::active()->findOrFail($id);
        $user = $request->user();

        $attempt = ScenarioAttempt::create([
            'user_id' => (string) $user->_id,
            'scenario_id' => (string) $scenario->_id,
            'actions' => [],
            'result' => 'in_progress',
            'score' => 0,
            'is_correct' => false,
            'time_spent_seconds' => 0,
        ]);

        ActivityLog::create([
            'user_id' => (string) $user->_id,
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

    /**
     * Submit user action for a scenario attempt.
     */
    public function submitAction(Request $request, string $attemptId): JsonResponse
    {
        $validated = $request->validate([
            'action' => ['required', 'string'],
            'details' => ['sometimes', 'array'],
        ]);

        $user = $request->user();
        $attempt = ScenarioAttempt::where('_id', $attemptId)
            ->where('user_id', (string) $user->_id)
            ->where('result', 'in_progress')
            ->firstOrFail();

        $scenario = Scenario::findOrFail($attempt->scenario_id);

        // Append action to the attempt's actions array
        $actions = $attempt->actions ?? [];
        $actions[] = [
            'action' => $validated['action'],
            'details' => $validated['details'] ?? [],
            'timestamp' => now()->toISOString(),
        ];
        $attempt->update(['actions' => $actions]);

        // Log activity
        ActivityLog::create([
            'user_id' => (string) $user->_id,
            'attempt_id' => (string) $attempt->_id,
            'action' => 'scenario_action',
            'details' => [
                'action' => $validated['action'],
                'details' => $validated['details'] ?? [],
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Action recorded.',
            'attempt' => $attempt->fresh(),
        ]);
    }

    /**
     * Complete a scenario attempt and get feedback.
     */
    public function complete(Request $request, string $attemptId): JsonResponse
    {
        $validated = $request->validate([
            'user_identified_threat' => ['required', 'boolean'],
            'time_spent_seconds' => ['required', 'integer', 'min:0'],
        ]);

        $user = $request->user();
        $attempt = ScenarioAttempt::where('_id', $attemptId)
            ->where('user_id', (string) $user->_id)
            ->where('result', 'in_progress')
            ->firstOrFail();

        $scenario = Scenario::findOrFail($attempt->scenario_id);

        // Determine correctness based on scenario type and user response
        $isCorrect = $validated['user_identified_threat'];
        $score = $isCorrect ? $this->calculateScore($scenario, $validated['time_spent_seconds']) : 0;

        // Generate feedback
        $feedback = $this->generateFeedback($scenario, $isCorrect);

        $attempt->update([
            'result' => $isCorrect ? 'correct' : 'incorrect',
            'score' => $score,
            'is_correct' => $isCorrect,
            'time_spent_seconds' => $validated['time_spent_seconds'],
            'feedback' => $feedback,
            'completed_at' => now(),
        ]);

        ActivityLog::create([
            'user_id' => (string) $user->_id,
            'attempt_id' => (string) $attempt->_id,
            'action' => 'scenario_completed',
            'details' => [
                'is_correct' => $isCorrect,
                'score' => $score,
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => $isCorrect ? 'Correct! Well done.' : 'Incorrect. Review the feedback.',
            'attempt' => $attempt->fresh(),
            'feedback' => $feedback,
        ]);
    }

    /**
     * Calculate score based on difficulty and time.
     */
    private function calculateScore(Scenario $scenario, int $timeSpent): int
    {
        $baseScore = match ($scenario->difficulty) {
            'easy' => 50,
            'medium' => 100,
            'hard' => 200,
            default => 100,
        };

        // Bonus for fast completion (under 60 seconds)
        $timeBonus = $timeSpent < 60 ? 25 : ($timeSpent < 120 ? 10 : 0);

        return $baseScore + $timeBonus;
    }

    /**
     * Generate feedback for the attempt.
     */
    private function generateFeedback(Scenario $scenario, bool $isCorrect): array
    {
        return [
            'correct' => $isCorrect,
            'explanation' => $scenario->explanation ?? 'No explanation available.',
            'indicators' => $scenario->indicators ?? [],
            'tips' => $isCorrect
                ? ['Great job spotting the threat!', 'Keep practicing to stay sharp.']
                : [
                    'Always check the sender\'s email address carefully.',
                    'Look for spelling and grammar mistakes.',
                    'Never click suspicious links without verifying.',
                    'When in doubt, contact the supposed sender directly.',
                ],
        ];
    }
}
