<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;
use MongoDB\Laravel\Schema\Blueprint;

return new class () extends Migration {
    protected $connection = 'mongodb';

    public function up(): void
    {
        Schema::connection('mongodb')->create('scenarios', function (Blueprint $collection) {
            $collection->string('title');
            $collection->text('description');
            $collection->string('type');
            $collection->string('difficulty')->default('medium');
            $collection->boolean('is_active')->default(true);
            $collection->string('created_by')->nullable();
            $collection->timestamps();

            $collection->index('type');
            $collection->index('difficulty');
            $collection->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::connection('mongodb')->dropIfExists('scenarios');
    }
};
