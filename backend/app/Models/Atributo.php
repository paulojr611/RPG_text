<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Atributo extends Model
{
    use HasFactory;

    protected $table = 'atributos';

    protected $fillable = [
        'personagem_id',
        'nivel',
        'vidamax',
        'vidaatual',
        'manamax',
        'manaatual',
        'bonusacerto',
        'bonusacertomag',
        'ca',
        'dr',
        'danomin',
        'danomax',
        'moedas',
        'xp',
    ];

    public function personagem()
    {
        return $this->belongsTo(Personagem::class);
    }
}
