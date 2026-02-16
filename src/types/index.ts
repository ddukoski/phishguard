export type User = {
  readonly id: string;
  readonly username: string;
  readonly email: string;
  readonly role: 'user' | 'admin';
  readonly avatar?: string;
  readonly is_active: boolean;
  readonly created_at: string;
  readonly last_login_at?: string;
};

export type InteractiveElement = {
  readonly id: string;
  readonly type:
    | 'suspicious'
    | 'malicious_link'
    | 'social_engineering'
    | 'red_flag'
    | 'legitimate'
    | 'informational'
    | 'verification'
    | 'safe_link'
    | 'safe_action'
    | 'brand_impersonation';
  readonly description: string;
};

export type Scenario = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly type: 'phishing_email' | 'fake_profile' | 'malicious_link' | 'messaging';
  readonly difficulty: 'easy' | 'medium' | 'hard';
  readonly is_threat: boolean;
  readonly content: Record<string, unknown>;
  readonly html_content?: string;
  readonly interactive_elements?: readonly InteractiveElement[];
  readonly indicators: readonly string[];
  readonly explanation: string;
  readonly is_active: boolean;
  readonly created_at: string;
};

export type AttemptAction = {
  readonly action: string;
  readonly element_id?: string | null;
  readonly element_type?: string | null;
  readonly details: Record<string, unknown>;
  readonly timestamp: string;
};

export type KeyInteraction = {
  readonly element: string;
  readonly action: string | null;
  readonly element_type: string;
  readonly element_description?: string | null;
  readonly user_noticed: boolean;
};

export type AIAnalysis = {
  readonly summary: string;
  readonly actions_analyzed: number;
  readonly key_interactions: readonly KeyInteraction[];
};

export type Feedback = {
  readonly correct: boolean;
  readonly explanation: string;
  readonly indicators: readonly string[];
  readonly tips: readonly string[];
  readonly ai_analysis?: AIAnalysis;
};

export type ScenarioAttempt = {
  readonly id: string;
  readonly user_id: string;
  readonly scenario_id: string;
  readonly actions: readonly AttemptAction[];
  readonly result: 'pending' | 'in_progress' | 'correct' | 'incorrect';
  readonly score: number;
  readonly is_correct: boolean;
  readonly time_spent_seconds: number;
  readonly feedback?: Feedback;
  readonly completed_at?: string;
  readonly created_at: string;
  readonly scenario?: Scenario;
};

export type DashboardStats = {
  readonly total_attempts: number;
  readonly completed: number;
  readonly correct: number;
  readonly accuracy_rate: number;
  readonly total_score: number;
  readonly average_time_seconds: number;
};

export type PaginatedResponse<T> = {
  readonly data: readonly T[];
  readonly current_page: number;
  readonly last_page: number;
  readonly per_page: number;
  readonly total: number;
};
