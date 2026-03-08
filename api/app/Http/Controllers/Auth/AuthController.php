<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    private function createTokenCookie(string $token): \Symfony\Component\HttpFoundation\Cookie
    {
        return Cookie::make(
            'token',
            $token,
            60 * 24 * 7,
            '/',
            null,
            app()->environment('production'),
            true,
            false,
            'Lax'
        );
    }

    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'username' => ['required', 'string', 'min:3', 'max:50', 'unique:users,username'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'confirmed', Password::min(8)],
        ]);

        $user = User::create([
            'username' => $validated['username'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'role' => 'user',
            'is_active' => true,
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        ActivityLog::create([
            'user_id' => (string) $user->_id,
            'action' => 'register',
            'details' => ['method' => 'email'],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Registration successful.',
            'user' => $user->only('id', 'username', 'email', 'role'),
        ], 201)->withCookie($this->createTokenCookie($token));
    }

    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'login' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $validated['login'])
            ->orWhere('username', $validated['login'])
            ->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials.',
            ], 401);
        }

        if (! $user->is_active) {
            return response()->json([
                'message' => 'Account is deactivated. Please contact an admin.',
            ], 403);
        }

        $user->update(['last_login_at' => now()]);

        $token = $user->createToken('auth-token')->plainTextToken;

        ActivityLog::create([
            'user_id' => (string) $user->_id,
            'action' => 'login',
            'details' => ['method' => 'credentials'],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Login successful.',
            'user' => $user->only('id', 'username', 'email', 'role'),
        ])->withCookie($this->createTokenCookie($token));
    }

    public function logout(Request $request): JsonResponse
    {
        ActivityLog::create([
            'user_id' => (string) $request->user()->_id,
            'action' => 'logout',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully.',
        ])->withCookie(Cookie::forget('token'));
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'user' => $user->only('id', 'username', 'email', 'role', 'avatar', 'is_active', 'created_at', 'last_login_at'),
        ]);
    }
}
