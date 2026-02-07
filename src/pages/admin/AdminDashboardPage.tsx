import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';

interface AdminStats {
  users: { total: number; active: number };
  scenarios: { total: number; active: number };
  attempts: { total: number; completed: number; correct: number; accuracy_rate: number };
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then((res) => setStats(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">⚙️ Admin Dashboard</h1>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Total Users" value={stats.users.total} sub={`${stats.users.active} active`} color="blue" />
          <StatCard label="Scenarios" value={stats.scenarios.total} sub={`${stats.scenarios.active} active`} color="green" />
          <StatCard label="Total Attempts" value={stats.attempts.total} sub={`${stats.attempts.completed} completed`} color="purple" />
          <StatCard label="Overall Accuracy" value={`${stats.attempts.accuracy_rate}%`} sub={`${stats.attempts.correct} correct`} color="yellow" />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/admin/users" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold text-gray-900">👥 Manage Users</h3>
          <p className="text-sm text-gray-600 mt-1">View, activate/deactivate, and manage user roles.</p>
        </Link>
        <Link to="/admin/scenarios" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold text-gray-900">📝 Manage Scenarios</h3>
          <p className="text-sm text-gray-600 mt-1">Create, edit, and manage phishing scenarios.</p>
        </Link>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub: string; color: string }) {
  const colors: Record<string, string> = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    yellow: 'text-yellow-600',
  };
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${colors[color]}`}>{value}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  );
}
