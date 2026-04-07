<?php

return [
    'api_key' => env('OPENAI_API_KEY'),
    'organization' => env('OPENAI_ORGANIZATION'),
    'project' => env('OPENAI_PROJECT'),
    'scenario_generation_model' => env('OPENAI_SCENARIO_GENERATION_MODEL', 'gpt-5'),
    'classification_review_model' => env('OPENAI_CLASSIFICATION_REVIEW_MODEL', 'gpt-5'),
    'base_uri' => env('OPENAI_BASE_URL'),
    'request_timeout' => env('OPENAI_REQUEST_TIMEOUT', 90),
];
