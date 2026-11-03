<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index()
    {
        return response()->json(Category::all());
    }

    public function show($id)
    {
        $category = Category::find($id);

        if (!$category) {
            return response()->json([
                'message' => 'Kategori tidak ditemukan'
            ], 404);
        }

        return response()->json($category);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'genre' => 'required|string|max:255',
            'jenis' => 'required|string|max:255',
            'age' => 'nullable|integer',
        ]);

        $category = Category::create($validated);

        return response()->json($category, 201);
    }

    public function update(Request $request, $id)
    {
        $category = Category::find($id);

        if (!$category) {
            return response()->json([
                'message' => 'Kategori tidak ditemukan'
            ], 404);
        }

        $validated = $request->validate([
            'genre' => 'sometimes|required|string|max:255',
            'jenis' => 'sometimes|required|string|max:255',
            'age' => 'sometimes|nullable|integer',
        ]);

        $category->update($validated);

        return response()->json($category);
    }

    public function destroy($id)
    {
        $category = Category::find($id);

        if (!$category) {
            return response()->json([
                'message' => 'Kategori tidak ditemukan'
            ], 404);
        }

        $category->delete();

        return response()->json([
            'message' => 'Kategori berhasil dihapus'
        ]);
    }
}
