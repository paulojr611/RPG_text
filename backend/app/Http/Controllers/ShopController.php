<?php

namespace App\Http\Controllers;

use App\Models\inventario;
use App\Models\itens;
use App\Models\Personagem;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ShopController extends Controller
{
    private function getUserFromRequest(Request $request): ?User
    {
        $token = str_replace('Bearer ', '', (string) $request->header('Authorization'));

        if ($token === '') {
            return null;
        }

        return User::where('api_token', $token)->first();
    }

    public function items(Request $request)
    {
        $user = $this->getUserFromRequest($request);

        if (! $user) {
            return response()->json(['error' => 'Nao autenticado'], 401);
        }

        $personagem = Personagem::where('user_id', $user->id)->first();

        if (! $personagem) {
            return response()->json(['error' => 'Personagem nao encontrado'], 404);
        }

        return response()->json([
            'moedas' => $personagem->moedas,
            'items' => itens::query()
                ->select('id', 'nome', 'descricao', 'valor', 'tipo')
                ->orderBy('id')
                ->get(),
        ]);
    }

    public function buy(Request $request)
    {
        $user = $this->getUserFromRequest($request);

        if (! $user) {
            return response()->json(['error' => 'Nao autenticado'], 401);
        }

        $validated = $request->validate([
            'item_id' => 'required|integer|exists:itens,id',
            'quantidade' => 'nullable|integer|min:1|max:99',
        ]);

        $quantity = (int) ($validated['quantidade'] ?? 1);
        $item = itens::findOrFail($validated['item_id']);

        $result = DB::transaction(function () use ($user, $item, $quantity) {
            $personagem = Personagem::where('user_id', $user->id)->lockForUpdate()->first();

            if (! $personagem) {
                return response()->json(['error' => 'Personagem nao encontrado'], 404);
            }

            $total = $item->valor * $quantity;

            if ($personagem->moedas < $total) {
                return response()->json(['error' => 'Moedas insuficientes'], 422);
            }

            $personagem->decrement('moedas', $total);

            $entry = inventario::where('personagem_id', $personagem->id)
                ->where('item_id', $item->id)
                ->lockForUpdate()
                ->first();

            if ($entry) {
                $entry->increment('quantidade', $quantity);
            } else {
                inventario::create([
                    'personagem_id' => $personagem->id,
                    'item_id' => $item->id,
                    'quantidade' => $quantity,
                    'equipado' => false,
                ]);
            }

            $personagem->refresh();

            return response()->json([
                'message' => 'Compra realizada',
                'item' => $item->nome,
                'quantidade' => $quantity,
                'custo_total' => $total,
                'moedas_restantes' => $personagem->moedas,
            ]);
        });

        return $result;
    }
}

