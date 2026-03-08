<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use MongoDB\Laravel\Eloquent\Model;
use MongoDB\Laravel\Relations\HasMany;

class Scenario extends Model
{
    use HasFactory;

    protected $connection = 'mongodb';

    protected $collection = 'scenarios';

    protected $fillable = [
        'title',
        'description',
        'type',
        'difficulty',
        'content',
        'indicators',
        'explanation',
        'is_active',
        'created_by',
        'media',
    ];

    protected function casts(): array
    {
        return [
            'content' => 'array',
            'indicators' => 'array',
            'media' => 'array',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the attempts for this scenario.
     */
    public function attempts(): HasMany
    {
        return $this->hasMany(ScenarioAttempt::class);
    }

    /**
     * Scope: only active scenarios.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope: filter by type.
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }
}
