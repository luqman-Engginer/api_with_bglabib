<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Category>
 */
class CategoryFactory extends Factory
{
    public function definition(): array
    {
        return [
            'genre' => fake()->sentence(3),
            'age' => fake()->numberBetween(1, 100),
            'jenis' => fake()->word(),
        ];
    }
}
