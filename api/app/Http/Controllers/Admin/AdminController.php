<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Scenario;
use App\Models\ScenarioAttempt;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    /**
     * Admin dashboard stats.
     */
    public function dashboard(): JsonResponse
    {
        $totalUsers = User::count();
        $activeUsers = User::where('is_active', true)->count();
        $totalScenarios = Scenario::count();
        $activeScenarios = Scenario::where('is_active', true)->count();
        $totalAttempts = ScenarioAttempt::count();
        $completedAttempts = ScenarioAttempt::whereNotNull('completed_at')->count();
        $correctAttempts = ScenarioAttempt::where('is_correct', true)->count();

        $overallAccuracy = $completedAttempts > 0
            ? round(($correctAttempts / $completedAttempts) * 100, 1)
            : 0;

        return response()->json([
            'users' => [
                'total' => $totalUsers,
                'active' => $activeUsers,
            ],
            'scenarios' => [
                'total' => $totalScenarios,
                'active' => $activeScenarios,
            ],
            'attempts' => [
                'total' => $totalAttempts,
                'completed' => $completedAttempts,
                'correct' => $correctAttempts,
                'accuracy_rate' => $overallAccuracy,
            ],
        ]);
    }

    /**
     * List all users (paginated).
     */
    public function users(Request $request): JsonResponse
    {
        $users = User::orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 20));

        return response()->json($users);
    }

    /**
     * Get a specific user with their stats.
     */
    public function showUser(string $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $stats = [
            'total_attempts' => ScenarioAttempt::where('user_id', (string) $user->_id)->count(),
            'correct_attempts' => ScenarioAttempt::where('user_id', (string) $user->_id)->where('is_correct', true)->count(),
            'total_score' => ScenarioAttempt::where('user_id', (string) $user->_id)->sum('score'),
        ];

        $recentActivity = ActivityLog::where('user_id', (string) $user->_id)
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get();

        return response()->json([
            'user' => $user,
            'stats' => $stats,
            'recent_activity' => $recentActivity,
        ]);
    }

    /**
     * Toggle user active status.
     */
    public function toggleUserStatus(string $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $user->update(['is_active' => ! $user->is_active]);

        return response()->json([
            'message' => $user->is_active ? 'User activated.' : 'User deactivated.',
            'user' => $user->fresh(),
        ]);
    }

    /**
     * Update user role.
     */
    public function updateUserRole(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'role' => ['required', 'string', 'in:user,admin'],
        ]);

        $user = User::findOrFail($id);
        $user->update(['role' => $validated['role']]);

        return response()->json([
            'message' => 'User role updated.',
            'user' => $user->fresh(),
        ]);
    }
}
