<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\controllers\BookController;
use App\Http\controllers\CategoryController;

Route::get('/halo', fn() => response()->json(['message' => 'Haloo kawann']));


Route::get('/hello/{name}', fn($name) => response()->json(['message' => "Haloo , $name!"]));

Route::get('/baik' , function(){
    return response()->json(['message' => 'Baik!']);
    }); //ini adalah versi panjang dari route diatas

Route::get('/books',
    [BookController::class, 'index']);
Route::get('/books/{id}',
    [BookController::class, 'show']);
Route::post('/books',
    [BookController::class, 'store']);

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{id}', [CategoryController::class, 'show']);
Route::post('/categories', [CategoryController::class, 'store']);
Route::put('/categories/{id}', [CategoryController::class, 'update']);
Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);




