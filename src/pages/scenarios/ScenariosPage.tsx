import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import type { Scenario } from '../../types';

export default function ScenariosPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ type: '', difficulty: '' });

  useEffect(() => {
    const params = new URLSearchParams();
    if (filter.type) params.set('type', filter.type);
    if (filter.difficulty) params.set('difficulty', filter.difficulty);

    api.get(`/scenarios?${params.toString()}`)
      .then((res) => setScenarios(res.data.data))
      .finally(() => setLoading(false));
  }, [filter]);

  const difficultyColor: Record<string, string> = {
    easy: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    hard: 'bg-red-100 text-red-700',
  };

  const typeIcon: Record<string, string> = {
    phishing_email: '📧',
    fake_profile: '👤',
    malicious_link: '🔗',
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Phishing Scenarios</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={filter.type}
          onChange={(e) => setFilter({ ...filter, type: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Types</option>
          <option value="phishing_email">Phishing Email</option>
          <option value="fake_profile">Fake Profile</option>
          <option value="malicious_link">Malicious Link</option>
        </select>
        <select
          value={filter.difficulty}
          onChange={(e) => setFilter({ ...filter, difficulty: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
      ) : scenarios.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          No scenarios found matching your filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scenarios.map((scenario) => (
            <div key={scenario.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{typeIcon[scenario.type] || '❓'}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColor[scenario.difficulty]}`}>
                    {scenario.difficulty}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{scenario.title}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{scenario.description}</p>
                <Link
                  to={`/scenarios/${scenario.id}`}
                  className="inline-block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                >
                  Start Scenario
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
