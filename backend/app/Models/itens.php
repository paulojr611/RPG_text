<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class itens extends Model
{
    use HasFactory;

    protected $table = 'itens';

    protected $fillable = [
        'nome',
        'descricao',
        'tipo',
        'valor',
        'hit',
        'danomin',
        'danomax',
        'drbonus',
        'cabonus',
        'customana',
        'alvos',
        'curamin',
        'curamax',
    ];
}
