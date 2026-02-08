import type { ScenarioAttempt } from '../../types';
import type { ScenarioType } from '../../lib/types';
import { ResultBadge, ScenarioTypeBadge } from '../ui/Badges';
import EmptyState from '../ui/EmptyState';
import SectionCard from '../ui/SectionCard';
import { History } from 'lucide-react';
import { Link } from 'react-router-dom';

type RecentAttemptsTableProps = {
  readonly attempts: readonly ScenarioAttempt[];
};

export default function RecentAttemptsTable({ attempts }: RecentAttemptsTableProps) {
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
    <SectionCard title="Recent Attempts" description="Your latest scenario outcomes.">
      <div className="overflow-x-auto">
        <table className="table table-zebra">
          <thead>
            <tr>
              <th>Scenario</th>
              <th>Type</th>
              <th>Result</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {attempts.map((attempt) => {
              const scenarioType = (attempt.scenario?.type ?? 'phishing_email') as ScenarioType;
              return (
                <tr key={attempt.id}>
                  <td>
                    <div className="font-medium">
                      {attempt.scenario?.title ?? 'Untitled scenario'}
                    </div>
                  </td>
                  <td>
                    <ScenarioTypeBadge type={scenarioType} />
                  </td>
                  <td>
                    <ResultBadge result={attempt.result} />
                  </td>
                  <td className="font-semibold">{attempt.score}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
