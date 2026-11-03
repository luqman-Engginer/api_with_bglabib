<?php

namespace App\Http\Controllers;
use App\Models\Book;

use Illuminate\Http\Request;

class BookController extends Controller
{
    public function index() {
        return response()->json(Book::all());
    }
    public function show($id) {
        $book = Book:: find($id);
            if (!$book) {
                return response()->json(
                ['message' => 'Buku tidak ditemukan'], 404);
    }
        return response()->json($book);
        }


    public function store (Request $request) {
        $book = Book::create(
        $request->only(['title', 'author', 'year'])
        );
            return response()->json($book, 201);
    }

    // BookController
public function update(Request $request, $id) {
  $book = Book::find($id);
  if (!$book) {
    return response()->json(['message' => 'Buku tidak ditemukan'], 404);
  }
  $book->update($request->only(['title', 'author', 'year']));
  return response()->json($book);
}

// BookController
public function destroy($id) {
$book = Book:: find($id);
if (!$book) {
return response()->json(['message' => 'Buku tidak
ditemukan'], 404);
}
$book->delete();
return response()->json(['message' => 'Buku dihapus']);
}


}
