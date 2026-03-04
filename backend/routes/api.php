<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ShopController;
use App\Http\Controllers\CharacterController;


Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});


Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

Route::get('/me',        [AuthController::class, 'me']);
Route::post('/logout',   [AuthController::class, 'logout']);

Route::get('/shop/items', [ShopController::class, 'items']);
Route::post('/shop/buy',  [ShopController::class, 'buy']);

Route::get('/character/attributes', [CharacterController::class, 'attributes']);
Route::get('/character/inventory', [CharacterController::class, 'inventory']);
Route::post('/character/toggle-equip', [CharacterController::class, 'toggleEquip']);
