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

export type Scenario = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly type: 'phishing_email' | 'fake_profile' | 'malicious_link';
  readonly difficulty: 'easy' | 'medium' | 'hard';
  readonly content: Record<string, unknown>;
  readonly indicators: readonly string[];
  readonly explanation: string;
  readonly is_active: boolean;
  readonly created_at: string;
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

export type AttemptAction = {
  readonly action: string;
  readonly details: Record<string, unknown>;
  readonly timestamp: string;
};

export type Feedback = {
  readonly correct: boolean;
  readonly explanation: string;
  readonly indicators: readonly string[];
  readonly tips: readonly string[];
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
