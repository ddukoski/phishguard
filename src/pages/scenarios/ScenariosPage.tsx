import { useEffect, useState } from 'react';
import { ListFilter, Target } from 'lucide-react';
import api from '../../lib/api';
import type { Scenario } from '../../types';
import PageHeader from '../../components/ui/PageHeader';
import LoadingState from '../../components/ui/LoadingState';
import EmptyState from '../../components/ui/EmptyState';
import ScenarioCard from '../../components/scenarios/ScenarioCard';
import SectionCard from '../../components/ui/SectionCard';

export default function ScenariosPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ type: '', difficulty: '' });

  useEffect(() => {
    const params = new URLSearchParams();
    if (filter.type) params.set('type', filter.type);
    if (filter.difficulty) params.set('difficulty', filter.difficulty);

    api
      .get(`/scenarios?${params.toString()}`)
      .then((res) => setScenarios(res.data.data))
      .finally(() => setLoading(false));
  }, [filter]);

  if (loading) {
    return <LoadingState label="Loading scenarios" />;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Scenarios"
        description="Choose a simulation and sharpen your phishing radar."
        icon={Target}
      />

      <SectionCard title="Filters" description="Tune scenarios by type or difficulty." actions={<ListFilter className="h-4 w-4 text-base-content/60" />}>
        <div className="grid gap-4 md:grid-cols-2">
          <select
            value={filter.type}
            onChange={(e) => setFilter({ ...filter, type: e.target.value })}
            className="select select-bordered w-full"
          >
            <option value="">All Types</option>
            <option value="phishing_email">Phishing Email</option>
            <option value="fake_profile">Fake Profile</option>
            <option value="malicious_link">Malicious Link</option>
          </select>
          <select
            value={filter.difficulty}
            onChange={(e) => setFilter({ ...filter, difficulty: e.target.value })}
            className="select select-bordered w-full"
          >
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </SectionCard>

      {scenarios.length === 0 ? (
        <EmptyState
          title="No scenarios found"
          description="Try adjusting the filters or check back later."
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {scenarios.map((scenario) => (
            <ScenarioCard key={scenario.id} scenario={scenario} />
          ))}
        </div>
      )}
    </div>
  );
}
