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
        Schema::create('itens', function (Blueprint $table) {
            $table->id();
            $table->string('nome');
            $table->string('descricao');
            $table->integer('compravel'); // 0 = não vai estar na loja
            $table->integer('tipo'); // 1 - arma, 2 - escudo, 3 - armadura, 4 - acessorio, 5 - magia, 6 - consumivel
            $table->integer('valor')->default(0);
            $table->integer('hit')->default(0);
            $table->integer('hitmag')->default(0);
            $table->integer('danomin')->default(0);
            $table->integer('danomax')->default(0);
            $table->integer('drbonus')->default(0);
            $table->integer('cabonus')->default(0);
            $table->integer('customana')->default(0);
            $table->integer('alvos')->default(0);
            $table->integer('curamin')->default(0);
            $table->integer('curamax')->default(0);
            $table->integer('vidabonus')->default(0);
            $table->integer('manabonus')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
            Schema::dropIfExists('itens');
    }
};
