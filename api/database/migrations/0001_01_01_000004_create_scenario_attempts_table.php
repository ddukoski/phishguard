<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;
use MongoDB\Laravel\Schema\Blueprint;

return new class () extends Migration {
    protected $connection = 'mongodb';

    public function up(): void
    {
        Schema::connection('mongodb')->create('scenario_attempts', function (Blueprint $collection) {
            $collection->string('user_id');
            $collection->string('scenario_id');
            $collection->string('result')->default('pending');
            $collection->integer('score')->default(0);
            $collection->boolean('is_correct')->default(false);
            $collection->integer('time_spent_seconds')->default(0);
            $collection->timestamp('completed_at')->nullable();
            $collection->timestamps();

            $collection->index('user_id');
            $collection->index('scenario_id');
            $collection->index(['user_id', 'scenario_id']);
        });
    }

    public function down(): void
    {
        Schema::connection('mongodb')->dropIfExists('scenario_attempts');
    }
};
