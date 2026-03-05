<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('personagem', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete()->unique();
            $table->string('nome');
            $table->integer('nivel')->default(1);
            $table->integer('vidamax')->default(10);
            $table->integer('vidaatual')->default(10);
            $table->integer('manamax')->default(10);
            $table->integer('manaatual')->default(10);
            $table->integer('bonusacerto')->default(0);        
            $table->integer('ca')->default(10);
            $table->integer('dr')->default(0);
            $table->integer('danomin')->default(0);
            $table->integer('danomax')->default(0);
            $table->integer('moedas')->default(10);
            $table->integer('xp')->default(0);
            $table->timestamps();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('personagem');
    }
};
