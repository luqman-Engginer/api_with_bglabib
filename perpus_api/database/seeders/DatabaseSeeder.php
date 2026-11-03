<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Book;
use App\Models\Categories;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]
        );

        Book::factory()->count(10)->create();
        Categories::factory()->count(10)->create();
    }


}

