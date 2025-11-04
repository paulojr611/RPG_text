<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CounterController;


Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/counter', [CounterController::class, 'index']);
Route::post('/counter/increment', [CounterController::class, 'increment']);
Route::post('/counter/decrement', [CounterController::class, 'decrement']);
Route::post('/counter/decrementbig', [CounterController::class, 'decrementBig']);
