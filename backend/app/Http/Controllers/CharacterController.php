<?php

namespace App\Http\Controllers;

use App\Models\inventario;
use App\Models\itens;
use App\Models\Atributo;
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

    private function getOrCreateAttributes(Personagem $personagem): Atributo
    {
        return Atributo::firstOrCreate(
            ['personagem_id' => $personagem->id],
            [
                'nivel' => (int) $personagem->nivel,
                'vidamax' => (int) $personagem->vidamax,
                'vidaatual' => (int) $personagem->vidaatual,
                'manamax' => (int) $personagem->manamax,
                'manaatual' => (int) $personagem->manaatual,
                'bonusacerto' => (int) $personagem->bonusacerto,
                'ca' => (int) $personagem->ca,
                'dr' => (int) $personagem->dr,
                'danomin' => (int) $personagem->danomin,
                'danomax' => (int) $personagem->danomax,
                'moedas' => (int) $personagem->moedas,
                'xp' => (int) $personagem->xp,
            ]
        );
    }

    private function applyItemBonuses(Atributo $atributos, object $item, int $direction = 1): void
    {
        $atributos->bonusacerto += $direction * (int) ($item->hit ?? 0);
        $atributos->vidamax += $direction * (int) ($item->vidabonus ?? 0);
        $atributos->manamax += $direction * (int) ($item->manabonus ?? 0);
        $atributos->danomin += $direction * (int) ($item->danomin ?? 0);
        $atributos->danomax += $direction * (int) ($item->danomax ?? 0);
        $atributos->dr += $direction * (int) ($item->drbonus ?? 0);
        $atributos->ca += $direction * (int) ($item->cabonus ?? 0);
    }

    private function clampCurrentResources(Atributo $atributos): void
    {
        if ($atributos->vidaatual > $atributos->vidamax) {
            $atributos->vidaatual = $atributos->vidamax;
        }

        if ($atributos->manaatual > $atributos->manamax) {
            $atributos->manaatual = $atributos->manamax;
        }
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

        $atributos = $this->getOrCreateAttributes($personagem);

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
                'nivel' => $atributos->nivel,
                'vidaatual' => $atributos->vidaatual,
                'vidamax' => $atributos->vidamax,
                'manaatual' => $atributos->manaatual,
                'manamax' => $atributos->manamax,
                'bonusacerto' => $atributos->bonusacerto,
                'ca' => $atributos->ca,
                'dr' => $atributos->dr,
                'danomin' => $atributos->danomin,
                'danomax' => $atributos->danomax,
                'moedas' => $atributos->moedas,
                'xp' => $atributos->xp,
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
            $atributos = $this->getOrCreateAttributes($personagem);

            if (in_array((int) $item->tipo, self::NON_EQUIPPABLE_TYPES, true)) {
                if ((int) $item->tipo === self::CONSUMABLE_TYPE) {
                    return response()->json(['error' => 'Consumiveis nao podem ser equipados'], 422);
                }

                return response()->json(['error' => 'Magias nao podem ser equipadas'], 422);
            }

            if ($entry->equipado) {
                $entry->equipado = false;
                $entry->save();
                $this->applyItemBonuses($atributos, $item, -1);
                $this->clampCurrentResources($atributos);
                $atributos->save();

                return response()->json([
                    'message' => 'Item desequipado',
                    'equipado' => false,
                ]);
            }

            $equippedSameType = inventario::query()
                ->join('itens', 'inventario.item_id', '=', 'itens.id')
                ->where('inventario.personagem_id', $personagem->id)
                ->where('itens.tipo', $item->tipo)
                ->where('inventario.equipado', true)
                ->select(
                    'inventario.id as inventario_id',
                    'itens.hit',
                    'itens.vidabonus',
                    'itens.manabonus',
                    'itens.danomin',
                    'itens.danomax',
                    'itens.drbonus',
                    'itens.cabonus'
                )
                ->get();

            if ($equippedSameType->isNotEmpty()) {
                foreach ($equippedSameType as $equippedItem) {
                    $this->applyItemBonuses($atributos, $equippedItem, -1);
                }

                inventario::whereIn('id', $equippedSameType->pluck('inventario_id'))
                    ->update(['equipado' => false]);
            }

            $entry->equipado = true;
            $entry->save();
            $this->applyItemBonuses($atributos, $item, 1);
            $this->clampCurrentResources($atributos);
            $atributos->save();

            return response()->json([
                'message' => 'Item equipado',
                'equipado' => true,
            ]);
        });

        return $result;
    }
}
