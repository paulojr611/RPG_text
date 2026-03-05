<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Personagem;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'email'          => 'required|email|unique:users',
            'name'           => 'required|string|max:255',
            'password'       => 'required|min:6',
            'character_name' => 'required|string|max:255',
        ]);

        DB::transaction(function () use ($request) {
            $user = User::create([
                'name'     => $request->name,
                'email'    => $request->email,
                'password' => Hash::make($request->password),
            ]);

            Personagem::create([
                'user_id' => $user->id,
                'nome'    => $request->character_name,
            ]);
        });

        return response()->json(['message' => 'Conta e personagem criados com sucesso!']);
    }

    public function login(Request $request)
    {
        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json(['error' => 'Credenciais inválidas'], 401);
        }

        $token = Str::random(60);
        $user->api_token = $token;
        $user->save();

        return [
            'token' => $token,
            'user'  => $user
        ];
    }

    public function me(Request $request)
    {
        $token = $request->header('Authorization');
        $token = str_replace('Bearer ', '', $token);

        $user = User::where('api_token', $token)->first();

        if (! $user) {
            return response()->json(['error' => 'Não autenticado'], 401);
        }

        return $user;
    }

    public function logout(Request $request)
    {
        $token = str_replace('Bearer ', '', $request->header('Authorization'));

        User::where('api_token', $token)->update(['api_token' => null]);

        return response()->json(['message' => 'Logout feito']);
    }
}
