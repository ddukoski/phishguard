export const USER_ROLES = ['user', 'admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const SCENARIO_TYPES = [
  'phishing_email',
  'fake_profile',
  'malicious_link',
  'messaging',
] as const;
export type ScenarioType = (typeof SCENARIO_TYPES)[number];

export const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const ATTEMPT_RESULTS = ['pending', 'in_progress', 'correct', 'incorrect'] as const;
export type AttemptResult = (typeof ATTEMPT_RESULTS)[number];

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === 'string' && USER_ROLES.includes(value as UserRole);
}

export function isScenarioType(value: unknown): value is ScenarioType {
  return typeof value === 'string' && SCENARIO_TYPES.includes(value as ScenarioType);
}

export function isDifficulty(value: unknown): value is Difficulty {
  return typeof value === 'string' && DIFFICULTIES.includes(value as Difficulty);
}

export function isAttemptResult(value: unknown): value is AttemptResult {
  return typeof value === 'string' && ATTEMPT_RESULTS.includes(value as AttemptResult);
}

export const DIFFICULTY_DISPLAY: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

export const SCENARIO_TYPE_DISPLAY: Record<ScenarioType, string> = {
  phishing_email: 'Phishing Email',
  fake_profile: 'Fake Profile',
  malicious_link: 'Malicious Link',
  messaging: 'Messaging',
};

export const ATTEMPT_RESULT_DISPLAY: Record<AttemptResult, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  correct: 'Correct',
  incorrect: 'Incorrect',
};

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy: 'badge-success',
  medium: 'badge-warning',
  hard: 'badge-error',
};

export const SCENARIO_TYPE_COLORS: Record<ScenarioType, string> = {
  phishing_email: 'badge-info',
  fake_profile: 'badge-secondary',
  malicious_link: 'badge-accent',
  messaging: 'badge-primary',
};

export const ATTEMPT_RESULT_COLORS: Record<AttemptResult, { label: string; className: string }> = {
  correct: { label: 'Correct', className: 'badge-success' },
  incorrect: { label: 'Incorrect', className: 'badge-error' },
  pending: { label: 'Pending', className: 'badge-ghost' },
  in_progress: { label: 'In Progress', className: 'badge-warning' },
};
