import type { ScenarioAttempt } from '../../types';
import type { ScenarioType, AttemptResult } from '../../lib/types';
import { ATTEMPT_RESULT_DISPLAY } from '../../lib/types';
import EmptyState from '../ui/EmptyState';
import SectionCard from '../ui/SectionCard';
import ScenarioTypeIcon from '../ui/ScenarioTypeIcon';
import {
  History,
  CheckCircle,
  XCircle,
  Clock,
  PlayCircle,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import AttemptDetailsDialog from './AttemptDetailsDialog';

import type { LucideIcon } from 'lucide-react';

type IconRecordValue = { icon: LucideIcon; className: string };

type RecentAttemptsTableProps = {
  readonly attempts: readonly ScenarioAttempt[];
};

const ATTEMPT_RESULT_ICONS: Record<AttemptResult, IconRecordValue> = {
  correct: { icon: CheckCircle, className: 'text-success' },
  incorrect: { icon: XCircle, className: 'text-error' },
  pending: { icon: Clock, className: 'text-base-content/50' },
  in_progress: { icon: PlayCircle, className: 'text-warning' },
};

function ResultIcon({ result }: { readonly result: AttemptResult }) {
  const { icon: Icon, className } = ATTEMPT_RESULT_ICONS[result];
  const label = ATTEMPT_RESULT_DISPLAY[result];
  return (
    <div className="tooltip" data-tip={label}>
      <Icon className={`h-5 w-5 ${className}`} />
    </div>
  );
}

export default function RecentAttemptsTable({ attempts }: RecentAttemptsTableProps) {
  const [selected, setSelected] = useState<ScenarioAttempt | null>(null);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const openAttempt = (attempt: ScenarioAttempt) => {
    setSelected(attempt);
    setOpen(true);
  };

  const closeAttempt = () => {
    setOpen(false);
    setSelected(null);
  };

  if (attempts.length === 0) {
    return (
      <EmptyState
        title="No attempts yet"
        description="Launch your first scenario to see performance insights."
        icon={History}
        action={
          <Link to="/scenarios" className="btn btn-primary btn-sm">
            Start a scenario
          </Link>
        }
      />
    );
  }

  return (
    <>
      <SectionCard title="Recent Attempts" description="Your latest scenario outcomes.">
        <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>Scenario</th>
                <th>Type</th>
                <th>Result</th>
                <th>Score</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {attempts.map((attempt) => {
                const scenarioType = (attempt.scenario?.type ?? 'phishing_email') as ScenarioType;
                const scenarioId = attempt.scenario?.id ?? attempt.scenario_id;
                return (
                  <tr key={attempt.id}>
                    <td>
                      <div className="font-medium">
                        {attempt.scenario?.title ?? 'Untitled scenario'}
                      </div>
                    </td>
                    <td>
                      <ScenarioTypeIcon type={scenarioType} />
                    </td>
                    <td>
                      <ResultIcon result={attempt.result} />
                    </td>
                    <td className="font-semibold">{attempt.score}</td>
                    <td>
                      {attempt.result === 'in_progress' ? (
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => {
                            if (!scenarioId) return;
                            navigate(`/scenarios/${scenarioId}`);
                          }}
                        >
                          Continue
                        </button>
                      ) : (
                        <button className="btn btn-sm" onClick={() => openAttempt(attempt)}>
                          Details
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <AttemptDetailsDialog attempt={selected} open={open} onClose={closeAttempt} />
    </>
  );
}
