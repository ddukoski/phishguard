<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Scenario;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Services\OpenAIService;
use Illuminate\Support\Facades\Log;

class AdminScenarioController extends Controller
{

    public function index(Request $request): JsonResponse
    {
        $query = Scenario::query();

        if ($request->has('type')) {
            $query->where('type', $request->input('type'));
        }

        if ($request->has('is_active')) {
            $query->where('is_active', filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN));
        }

        $scenarios = $query->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 20));

        return response()->json($scenarios);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'type' => ['required', 'string', 'in:phishing_email,fake_profile,malicious_link'],
            'difficulty' => ['required', 'string', 'in:easy,medium,hard'],
            'is_threat' => ['required', 'boolean'],
            'content' => ['required', 'array'],
            'html_content' => ['sometimes', 'nullable', 'string'],
            'interactive_elements' => ['sometimes', 'array'],
            'indicators' => ['sometimes', 'array'],
            'explanation' => ['required', 'string'],
            'media' => ['sometimes', 'array'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $validated['created_by'] = (string) $request->user()->_id;

        $scenario = Scenario::create($validated);

        return response()->json([
            'message' => 'Scenario created successfully.',
            'scenario' => $scenario,
        ], 201);
    }

    public function show(string $id): JsonResponse
    {
        $scenario = Scenario::findOrFail($id);

        $stats = [
            'total_attempts' => $scenario->attempts()->count(),
            'completed' => $scenario->attempts()->whereNotNull('completed_at')->count(),
            'correct' => $scenario->attempts()->where('is_correct', true)->count(),
        ];

        return response()->json([
            'scenario' => $scenario,
            'stats' => $stats,
        ]);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $scenario = Scenario::findOrFail($id);

        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'string'],
            'type' => ['sometimes', 'string', 'in:phishing_email,fake_profile,malicious_link'],
            'difficulty' => ['sometimes', 'string', 'in:easy,medium,hard'],
            'is_threat' => ['sometimes', 'boolean'],
            'content' => ['sometimes', 'array'],
            'html_content' => ['sometimes', 'nullable', 'string'],
            'interactive_elements' => ['sometimes', 'array'],
            'indicators' => ['sometimes', 'array'],
            'explanation' => ['sometimes', 'string'],
            'media' => ['sometimes', 'array'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $scenario->update($validated);

        return response()->json([
            'message' => 'Scenario updated successfully.',
            'scenario' => $scenario->fresh(),
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $scenario = Scenario::findOrFail($id);
        $scenario->delete();

        return response()->json([
            'message' => 'Scenario deleted successfully.',
        ]);
    }

    public function toggleActive(string $id): JsonResponse
    {
        $scenario = Scenario::findOrFail($id);
        $scenario->is_active = !$scenario->is_active;
        $scenario->save();

        return response()->json([
            'message' => 'Scenario ' . ($scenario->is_active ? 'activated' : 'deactivated') . ' successfully.',
            'scenario' => $scenario,
        ]);
    }

    public function generateScenario(Request $request, OpenAIService $openAI): JsonResponse {
        $validated = $request->validate([
            'difficulty' => ['required', 'string', 'in:easy,medium,hard'],
            'description' => ['sometimes', 'nullable', 'string'],
            'type' => ['required', 'string', 'in:phishing_email,fake_profile,malicious_link'],
        ]);

        try {
            $generated = $openAI->generateScenarioFromExample(
                $validated['difficulty'],
                $validated['type'],
                $validated['description'] ?? ''
            );

            return response()->json(['scenario' => $generated]);
        } catch (\Throwable $e) {
            $msg = $e->getMessage();
            Log::error('OpenAI generation failed: ' . $msg);

            if (stripos($msg, 'No example scenario found') !== false) {
                return response()->json(['message' => $msg], 404);
            }

            $isTimeout = stripos($msg, 'cURL error 28') !== false
                || stripos($msg, 'Operation timed out') !== false
                || stripos($msg, 'timed out') !== false;

            if ($isTimeout) {
                return response()->json(['message' => 'OpenAI request timed out. Please try again.'], 504);
            }

            return response()->json(['message' => 'Failed to generate scenario.'], 502);
        }
    }
}
