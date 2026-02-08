<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;
use MongoDB\Laravel\Schema\Blueprint;

return new class () extends Migration {
    protected $connection = 'mongodb';

    public function up(): void
    {
        Schema::connection('mongodb')->create('activity_logs', function (Blueprint $collection) {
            $collection->string('user_id');
            $collection->string('attempt_id')->nullable();
            $collection->string('action');
            $collection->string('ip_address')->nullable();
            $collection->string('user_agent')->nullable();
            $collection->timestamps();

            $collection->index('user_id');
            $collection->index('action');
            $collection->index('attempt_id');
        });
    }

    public function down(): void
    {
        Schema::connection('mongodb')->dropIfExists('activity_logs');
    }
};
