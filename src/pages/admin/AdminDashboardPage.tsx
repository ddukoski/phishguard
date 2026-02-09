import { useEffect, useState } from 'react';
import { BarChart3, Users, Gauge, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApi } from '../../contexts/AxiosContext';
import LoadingState from '../../components/ui/LoadingState';
import PageHeader from '../../components/ui/PageHeader';
import StatTile from '../../components/ui/StatTile';
import SectionCard from '../../components/ui/SectionCard';

type AdminStats = {
  readonly users: { readonly total: number; readonly active: number };
  readonly scenarios: { readonly total: number; readonly active: number };
  readonly attempts: {
    readonly total: number;
    readonly completed: number;
    readonly correct: number;
    readonly accuracy_rate: number;
  };
};

export default function AdminDashboardPage() {
  const api = useApi();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/admin/dashboard')
      .then((res) => setStats(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingState label="Loading admin analytics" />;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Admin Analytics"
        description="Track platform health, engagement, and scenario outcomes."
        icon={BarChart3}
      />

      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile
            label="Total Users"
            value={stats.users.total}
            helper={`${stats.users.active} active`}
            icon={Users}
          />
          <StatTile
            label="Scenarios"
            value={stats.scenarios.total}
            helper={`${stats.scenarios.active} active`}
            icon={Target}
          />
          <StatTile
            label="Attempts"
            value={stats.attempts.total}
            helper={`${stats.attempts.completed} completed`}
            icon={Gauge}
          />
          <StatTile
            label="Accuracy"
            value={`${stats.attempts.accuracy_rate}%`}
            helper={`${stats.attempts.correct} correct`}
            icon={Gauge}
          />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <SectionCard
          title="Manage users"
          description="Audit roles, deactivate access, and keep your org safe."
        >
          <Link to="/admin/users" className="btn btn-primary btn-sm w-fit">
            Go to users
          </Link>
        </SectionCard>
        <SectionCard
          title="Manage scenarios"
          description="Create new simulations and refine existing content."
        >
          <Link to="/admin/scenarios" className="btn btn-primary btn-sm w-fit">
            Go to scenarios
          </Link>
        </SectionCard>
      </div>
    </div>
  );
}
