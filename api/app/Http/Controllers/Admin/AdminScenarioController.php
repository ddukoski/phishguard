<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Scenario;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminScenarioController extends Controller
{
    /**
     * List all scenarios (including inactive).
     */
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

    /**
     * Create a new scenario.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'type' => ['required', 'string', 'in:phishing_email,fake_profile,malicious_link'],
            'difficulty' => ['required', 'string', 'in:easy,medium,hard'],
            'is_threat' => ['required', 'boolean'],
            'content' => ['required', 'array'],
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

    /**
     * Show a single scenario.
     */
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

    /**
     * Update a scenario.
     */
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

    /**
     * Delete a scenario.
     */
    public function destroy(string $id): JsonResponse
    {
        $scenario = Scenario::findOrFail($id);
        $scenario->delete();

        return response()->json([
            'message' => 'Scenario deleted successfully.',
        ]);
    }
}
