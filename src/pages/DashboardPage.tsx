import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Fish } from 'lucide-react';
import { useApi } from '../contexts/AxiosContext';
import type { DashboardStats, ScenarioAttempt } from '../types';
import PageHeader from '../components/ui/PageHeader';
import LoadingState from '../components/ui/LoadingState';
import EmptyState from '../components/ui/EmptyState';
import DashboardStatsGrid from '../components/dashboard/DashboardStats';
import RecentAttemptsTable from '../components/dashboard/RecentAttemptsTable';
import DashboardEmpty from '../components/dashboard/DashboardEmpty';

export default function DashboardPage() {
  const api = useApi();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentAttempts, setRecentAttempts] = useState<ScenarioAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/progress/dashboard')
      .then((res) => {
        setStats(res.data.stats);
        setRecentAttempts(res.data.recent_attempts);
      })
      .catch(() => setError('Dashboard data is unavailable right now.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingState label="Loading dashboard data" />;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Track progress, keep your streak, and launch new simulations."
        icon={Fish}
        actions={
          <Link to="/scenarios" className="btn btn-primary">
            Start New Scenario
          </Link>
        }
      />

      {error ? (
        <EmptyState title="Unable to load dashboard" description={error} />
      ) : stats ? (
        <DashboardStatsGrid stats={stats} />
      ) : (
        <DashboardEmpty />
      )}

      <RecentAttemptsTable attempts={recentAttempts} />
    </div>
  );
}
