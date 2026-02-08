import type { Difficulty, ScenarioType, AttemptResult } from '../../lib/types';
import {
  DIFFICULTY_COLORS,
  DIFFICULTY_DISPLAY,
  SCENARIO_TYPE_COLORS,
  SCENARIO_TYPE_DISPLAY,
  ATTEMPT_RESULT_COLORS,
} from '../../lib/types';

type ResultBadgeProps = {
  readonly result: AttemptResult;
};

type DifficultyBadgeProps = {
  readonly difficulty: Difficulty;
};

type ScenarioTypeBadgeProps = {
  readonly type: ScenarioType;
};

type ActiveBadgeProps = {
  readonly isActive: boolean;
};

export function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  return (
    <span className={`badge badge-sm ${DIFFICULTY_COLORS[difficulty]}`}>
      {DIFFICULTY_DISPLAY[difficulty]}
    </span>
  );
}

export function ScenarioTypeBadge({ type }: ScenarioTypeBadgeProps) {
  return (
    <span className={`badge badge-sm ${SCENARIO_TYPE_COLORS[type]}`}>
      {SCENARIO_TYPE_DISPLAY[type]}
    </span>
  );
}

export function ResultBadge({ result }: ResultBadgeProps) {
  const config = ATTEMPT_RESULT_COLORS[result];
  return <span className={`badge badge-sm ${config.className}`}>{config.label}</span>;
}

export function ActiveBadge({ isActive }: ActiveBadgeProps) {
  return (
    <span className={`badge badge-sm ${isActive ? 'badge-success' : 'badge-ghost'}`}>
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
}
