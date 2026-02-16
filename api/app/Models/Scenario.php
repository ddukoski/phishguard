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
        'is_threat',
        'content',
        'html_content',
        'indicators',
        'explanation',
        'interactive_elements',
        'is_active',
        'created_by',
        'media',
    ];

    protected function casts(): array
    {
        return [
            'content' => 'array',
            'indicators' => 'array',
            'interactive_elements' => 'array',
            'media' => 'array',
            'is_threat' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(ScenarioAttempt::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }
}
