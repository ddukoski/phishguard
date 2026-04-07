<?php

namespace App\Http\Controllers;

use App\Models\ScenarioAttempt;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProgressController extends Controller
{
    public function dashboard(Request $request): JsonResponse
    {
        $user = $request->user();
        $userId = (string) $user->_id;

        $totalAttempts = ScenarioAttempt::where('user_id', $userId)->count();
        $completedAttempts = ScenarioAttempt::where('user_id', $userId)
            ->whereNotNull('completed_at')
            ->count();
        $correctAttempts = ScenarioAttempt::where('user_id', $userId)
            ->where('is_correct', true)
            ->count();
        $totalScore = ScenarioAttempt::where('user_id', $userId)->sum('score');
        $averageTime = ScenarioAttempt::where('user_id', $userId)
            ->whereNotNull('completed_at')
            ->avg('time_spent_seconds');

        $accuracyRate = $completedAttempts > 0
            ? round(($correctAttempts / $completedAttempts) * 100, 1)
            : 0;

        $recentAttempts = ScenarioAttempt::where('user_id', $userId)
            ->with('scenario:title,type,difficulty')
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();

        $seen = [];
        $uniqueAttempts = collect();
        foreach ($recentAttempts as $attempt) {
            $sid = (string) ($attempt->scenario_id ?? $attempt->scenario?->_id ?? null);
            if (!$sid) continue;
            if (in_array($sid, $seen, true)) continue;
            $seen[] = $sid;
            $uniqueAttempts->push($attempt);
            if ($uniqueAttempts->count() >= 10) break;
        }

        $statsByType = ScenarioAttempt::raw(function ($collection) use ($userId) {
            return $collection->aggregate([
                ['$match' => ['user_id' => $userId, 'completed_at' => ['$ne' => null]]],
                ['$lookup' => [
                    'from' => 'scenarios',
                    'localField' => 'scenario_id',
                    'foreignField' => '_id',
                    'as' => 'scenario',
                ]],
                ['$unwind' => '$scenario'],
                ['$group' => [
                    '_id' => '$scenario.type',
                    'total' => ['$sum' => 1],
                    'correct' => ['$sum' => ['$cond' => ['$is_correct', 1, 0]]],
                    'avg_score' => ['$avg' => '$score'],
                ]],
            ]);
        });

        return response()->json([
            'stats' => [
                'total_attempts' => $totalAttempts,
                'completed' => $completedAttempts,
                'correct' => $correctAttempts,
                'accuracy_rate' => $accuracyRate,
                'total_score' => $totalScore,
                'average_time_seconds' => round($averageTime ?? 0),
            ],
            'recent_attempts' => $uniqueAttempts,
            'stats_by_type' => $statsByType,
        ]);
    }

    public function history(Request $request): JsonResponse
    {
        $user = $request->user();

        $attempts = ScenarioAttempt::where('user_id', (string) $user->_id)
            ->with('scenario:title,type,difficulty')
            ->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 20));

        return response()->json($attempts);
    }

    public function leaderboard(Request $request): JsonResponse
    {
        $leaderboard = ScenarioAttempt::raw(function ($collection) {
            return $collection->aggregate([
                ['$match' => ['completed_at' => ['$ne' => null]]],

                ['$group' => [
                    '_id' => '$user_id',
                    'total_score' => ['$sum' => ['$ifNull' => ['$score', 0]]],
                    'total_correct' => ['$sum' => ['$cond' => ['$is_correct', 1, 0]]],
                    'total_attempts' => ['$sum' => 1],
                ]],
                ['$match' => ['total_score' => ['$gt' => 0]]],

                ['$sort' => ['total_score' => -1]],

                ['$limit' => 50],

                ['$lookup' => [
                    'from' => 'users',
                    'let' => ['uid' => '$_id'],
                    'pipeline' => [
                        ['$addFields' => ['_id_str' => ['$toString' => '$_id']]],
                        ['$match' => ['$expr' => ['$eq' => ['$_id_str', '$$uid']]]],
                    ],
                    'as' => 'user',
                ]],

                ['$unwind' => ['path' => '$user', 'preserveNullAndEmptyArrays' => true]],

                ['$project' => [
                    '_id' => 0,
                    'username' => '$user.username',
                    'total_score' => 1,
                    'total_correct' => 1,
                    'total_attempts' => 1,
                ]],
            ]);
        });

        return response()->json([
            'leaderboard' => $leaderboard,
        ]);
    }
}
