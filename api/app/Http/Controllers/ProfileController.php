<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class ProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();

        $stats = [
            'total_attempts' => $user->scenarioAttempts()->count(),
            'correct_attempts' => $user->scenarioAttempts()->where('is_correct', true)->count(),
            'total_score' => $user->scenarioAttempts()->sum('score'),
        ];

        return response()->json([
            'user' => $user->only('id', 'username', 'email', 'role', 'avatar', 'created_at', 'last_login_at'),
            'stats' => $stats,
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'username' => ['sometimes', 'string', 'min:3', 'max:50', 'unique:users,username,' . $user->_id . ',_id'],
            'email' => ['sometimes', 'string', 'email', 'max:255', 'unique:users,email,' . $user->_id . ',_id'],
            'avatar' => ['sometimes', 'nullable', 'string', 'url'],
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Profile updated successfully.',
            'user' => $user->fresh()->only('id', 'username', 'email', 'role', 'avatar'),
        ]);
    }

    public function updatePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'confirmed', Password::min(8)],
        ]);

        $user = $request->user();

        if (! Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'message' => 'Current password is incorrect.',
            ], 422);
        }

        $user->update([
            'password' => $validated['password'],
        ]);

        return response()->json([
            'message' => 'Password updated successfully.',
        ]);
    }
}
