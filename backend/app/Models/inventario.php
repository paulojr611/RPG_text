<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class inventario extends Model
{
    use HasFactory;

    protected $table = 'inventario';

    protected $fillable = [
        'personagem_id',
        'item_id',
        'quantidade',
        'equipado',
    ];
}
