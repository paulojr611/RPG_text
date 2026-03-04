<?php

namespace App\Http\Controllers;

use App\Models\inventario;
use App\Models\itens;
use App\Models\Personagem;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CharacterController extends Controller
{
    private const EQUIPPABLE_TYPES = [1, 2, 3, 4];
    private const NON_EQUIPPABLE_TYPES = [5, 6];
    private const CONSUMABLE_TYPE = 6;

    private function getUserFromRequest(Request $request): ?User
    {
        $token = str_replace('Bearer ', '', (string) $request->header('Authorization'));

        if ($token === '') {
            return null;
        }

        return User::where('api_token', $token)->first();
    }

    private function getCharacterForUser(User $user): ?Personagem
    {
        return Personagem::where('user_id', $user->id)->first();
    }

    public function attributes(Request $request)
    {
        $user = $this->getUserFromRequest($request);

        if (! $user) {
            return response()->json(['error' => 'Nao autenticado'], 401);
        }

        $personagem = $this->getCharacterForUser($user);

        if (! $personagem) {
            return response()->json(['error' => 'Personagem nao encontrado'], 404);
        }

        $equipped = inventario::query()
            ->join('itens', 'inventario.item_id', '=', 'itens.id')
            ->where('inventario.personagem_id', $personagem->id)
            ->where('inventario.equipado', true)
            ->whereIn('itens.tipo', self::EQUIPPABLE_TYPES)
            ->select('itens.nome', 'itens.tipo')
            ->orderBy('itens.tipo')
            ->get();

        return response()->json([
            'personagem' => [
                'id' => $personagem->id,
                'nome' => $personagem->nome,
                'nivel' => $personagem->nivel,
                'vidaatual' => $personagem->vidaatual,
                'vidamax' => $personagem->vidamax,
                'manaatual' => $personagem->manaatual,
                'manamax' => $personagem->manamax,
                'ca' => $personagem->ca,
                'dr' => $personagem->dr,
                'moedas' => $personagem->moedas,
                'xp' => $personagem->xp,
            ],
            'equipados' => $equipped,
        ]);
    }

    public function inventory(Request $request)
    {
        $user = $this->getUserFromRequest($request);

        if (! $user) {
            return response()->json(['error' => 'Nao autenticado'], 401);
        }

        $personagem = $this->getCharacterForUser($user);

        if (! $personagem) {
            return response()->json(['error' => 'Personagem nao encontrado'], 404);
        }

        $items = inventario::query()
            ->join('itens', 'inventario.item_id', '=', 'itens.id')
            ->where('inventario.personagem_id', $personagem->id)
            ->select(
                'inventario.id as inventario_id',
                'inventario.item_id',
                'inventario.quantidade',
                'inventario.equipado',
                'itens.nome',
                'itens.descricao',
                'itens.tipo',
                'itens.valor'
            )
            ->orderBy('itens.tipo')
            ->orderBy('itens.nome')
            ->get();

        return response()->json([
            'items' => $items,
        ]);
    }

    public function toggleEquip(Request $request)
    {
        $user = $this->getUserFromRequest($request);

        if (! $user) {
            return response()->json(['error' => 'Nao autenticado'], 401);
        }

        $personagem = $this->getCharacterForUser($user);

        if (! $personagem) {
            return response()->json(['error' => 'Personagem nao encontrado'], 404);
        }

        $validated = $request->validate([
            'item_id' => 'required|integer|exists:itens,id',
        ]);

        $result = DB::transaction(function () use ($personagem, $validated) {
            $entry = inventario::where('personagem_id', $personagem->id)
                ->where('item_id', $validated['item_id'])
                ->lockForUpdate()
                ->first();

            if (! $entry) {
                return response()->json(['error' => 'Item nao encontrado no inventario'], 404);
            }

            $item = itens::findOrFail($validated['item_id']);

            if (in_array((int) $item->tipo, self::NON_EQUIPPABLE_TYPES, true)) {
                if ((int) $item->tipo === self::CONSUMABLE_TYPE) {
                    return response()->json(['error' => 'Consumiveis nao podem ser equipados'], 422);
                }

                return response()->json(['error' => 'Magias nao podem ser equipadas'], 422);
            }

            if ($entry->equipado) {
                $entry->equipado = false;
                $entry->save();

                return response()->json([
                    'message' => 'Item desequipado',
                    'equipado' => false,
                ]);
            }

            $idsSameType = inventario::query()
                ->join('itens', 'inventario.item_id', '=', 'itens.id')
                ->where('inventario.personagem_id', $personagem->id)
                ->where('itens.tipo', $item->tipo)
                ->pluck('inventario.id');

            if ($idsSameType->isNotEmpty()) {
                inventario::whereIn('id', $idsSameType)->update(['equipado' => false]);
            }

            $entry->equipado = true;
            $entry->save();

            return response()->json([
                'message' => 'Item equipado',
                'equipado' => true,
            ]);
        });

        return $result;
    }
}
