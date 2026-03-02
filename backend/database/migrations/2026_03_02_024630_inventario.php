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
        Schema::create('inventario', function (Blueprint $table) {
            $table->id();
            $table->foreignId('personagem_id')
                ->constrained('personagem')
                ->cascadeOnDelete();
            $table->foreignId('item_id')
                ->constrained('itens')
                ->cascadeOnDelete();
            $table->integer('quantidade')->default(1);
            $table->boolean('equipado')->default(false);
            $table->timestamps();
            $table->unique(['personagem_id', 'item_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
                 Schema::dropIfExists('inventario');
    }
};
