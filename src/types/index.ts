export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
  is_active: boolean;
  created_at: string;
  last_login_at?: string;
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  type: 'phishing_email' | 'fake_profile' | 'malicious_link';
  difficulty: 'easy' | 'medium' | 'hard';
  content: Record<string, unknown>;
  indicators: string[];
  explanation: string;
  is_active: boolean;
  created_at: string;
}

export interface ScenarioAttempt {
  id: string;
  user_id: string;
  scenario_id: string;
  actions: AttemptAction[];
  result: 'pending' | 'in_progress' | 'correct' | 'incorrect';
  score: number;
  is_correct: boolean;
  time_spent_seconds: number;
  feedback?: Feedback;
  completed_at?: string;
  created_at: string;
  scenario?: Scenario;
}

export interface AttemptAction {
  action: string;
  details: Record<string, unknown>;
  timestamp: string;
}

export interface Feedback {
  correct: boolean;
  explanation: string;
  indicators: string[];
  tips: string[];
}

export interface DashboardStats {
  total_attempts: number;
  completed: number;
  correct: number;
  accuracy_rate: number;
  total_score: number;
  average_time_seconds: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
