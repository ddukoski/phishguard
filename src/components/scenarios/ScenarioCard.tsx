import { Link } from 'react-router-dom';
import { Link2, Mail, UserRound } from 'lucide-react';
import type { Scenario } from '../../types';
import { DifficultyBadge } from '../ui/Badges';

const typeIconMap = {
  phishing_email: Mail,
  fake_profile: UserRound,
  malicious_link: Link2,
};

type ScenarioCardProps = {
  scenario: Scenario;
};

export default function ScenarioCard({ scenario }: ScenarioCardProps) {
  const Icon = typeIconMap[scenario.type] ?? Mail;

  return (
    <div className="card rounded-2xl border border-base-200 bg-base-100 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="card-body gap-4">
        <div className="flex items-center justify-between">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-base-200 text-primary">
            <Icon className="h-5 w-5" />
          </span>
          <DifficultyBadge difficulty={scenario.difficulty} />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-base-content">{scenario.title}</h3>
          <p className="text-sm text-base-content/70 line-clamp-3">{scenario.description}</p>
        </div>
        <Link to={`/scenarios/${scenario.id}`} className="btn btn-primary btn-sm w-full">
          Start Scenario
        </Link>
      </div>
    </div>
  );
}
