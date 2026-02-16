<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;
use MongoDB\Laravel\Relations\BelongsTo;
use MongoDB\Laravel\Relations\HasMany;

class ScenarioAttempt extends Model
{
    protected $connection = 'mongodb';

    protected $collection = 'scenario_attempts';

    protected $fillable = [
        'user_id',
        'scenario_id',
        'actions',
        'result',
        'score',
        'is_correct',
        'time_spent_seconds',
        'feedback',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'actions' => 'array',
            'feedback' => 'array',
            'is_correct' => 'boolean',
            'score' => 'integer',
            'time_spent_seconds' => 'integer',
            'completed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scenario(): BelongsTo
    {
        return $this->belongsTo(Scenario::class);
    }

    public function actionLogs(): HasMany
    {
        return $this->hasMany(ActivityLog::class, 'attempt_id');
    }
}
