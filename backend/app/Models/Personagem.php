<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Personagem extends Model
{
    use HasFactory;

    protected $table = 'personagem';

    protected $fillable = [
        'user_id',
        'nome',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function atributos()
    {
        return $this->hasOne(Atributo::class);
    }
}
