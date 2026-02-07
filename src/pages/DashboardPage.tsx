import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import type { DashboardStats, ScenarioAttempt } from '../types';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentAttempts, setRecentAttempts] = useState<ScenarioAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/progress/dashboard')
      .then((res) => {
        setStats(res.data.stats);
        setRecentAttempts(res.data.recent_attempts);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link
          to="/scenarios"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
        >
          Start New Scenario
        </Link>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard label="Total Attempts" value={stats.total_attempts} icon="🎯" />
          <StatCard label="Completed" value={stats.completed} icon="✅" />
          <StatCard label="Correct" value={stats.correct} icon="🎉" />
          <StatCard label="Accuracy Rate" value={`${stats.accuracy_rate}%`} icon="📈" />
          <StatCard label="Total Score" value={stats.total_score} icon="⭐" />
          <StatCard label="Avg Time" value={`${stats.average_time_seconds}s`} icon="⏱️" />
        </div>
      )}

      {/* Recent Attempts */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Attempts</h2>
        {recentAttempts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            <p>No attempts yet. Start your first scenario!</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scenario</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Result</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentAttempts.map((attempt) => (
                  <tr key={attempt.id}>
                    <td className="px-6 py-4 text-sm text-gray-900">{attempt.scenario?.title ?? '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <TypeBadge type={attempt.scenario?.type ?? ''} />
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <ResultBadge result={attempt.result} />
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{attempt.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}

function TypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    phishing_email: 'bg-red-100 text-red-700',
    fake_profile: 'bg-purple-100 text-purple-700',
    malicious_link: 'bg-yellow-100 text-yellow-700',
  };
  const labels: Record<string, string> = {
    phishing_email: 'Email',
    fake_profile: 'Fake Profile',
    malicious_link: 'Malicious Link',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[type] || 'bg-gray-100 text-gray-700'}`}>
      {labels[type] || type}
    </span>
  );
}

function ResultBadge({ result }: { result: string }) {
  const config: Record<string, { color: string; label: string }> = {
    correct: { color: 'bg-green-100 text-green-700', label: 'Correct' },
    incorrect: { color: 'bg-red-100 text-red-700', label: 'Incorrect' },
    in_progress: { color: 'bg-blue-100 text-blue-700', label: 'In Progress' },
    pending: { color: 'bg-gray-100 text-gray-700', label: 'Pending' },
  };
  const c = config[result] || config.pending;
  return <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.color}`}>{c.label}</span>;
}
