import { useEffect, useState } from 'react';
import api from '../../lib/api';
import type { Scenario } from '../../types';

const emptyForm = {
  title: '',
  description: '',
  type: 'phishing_email' as const,
  difficulty: 'medium' as const,
  content: '{}',
  indicators: '',
  explanation: '',
  is_active: true,
};

export default function AdminScenariosPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const fetchScenarios = () => {
    api.get('/admin/scenarios')
      .then((res) => setScenarios(res.data.data))
      .finally(() => setLoading(false));
  };

  useEffect(fetchScenarios, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    let content: Record<string, unknown>;
    try {
      content = JSON.parse(form.content);
    } catch {
      setError('Content must be valid JSON.');
      return;
    }

    const payload = {
      ...form,
      content,
      indicators: form.indicators.split('\n').filter(Boolean),
    };

    try {
      if (editingId) {
        await api.put(`/admin/scenarios/${editingId}`, payload);
      } else {
        await api.post('/admin/scenarios', payload);
      }
      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);
      fetchScenarios();
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Save failed.');
    }
  };

  const handleEdit = (scenario: Scenario) => {
    setForm({
      title: scenario.title,
      description: scenario.description,
      type: scenario.type,
      difficulty: scenario.difficulty,
      content: JSON.stringify(scenario.content, null, 2),
      indicators: scenario.indicators.join('\n'),
      explanation: scenario.explanation,
      is_active: scenario.is_active,
    });
    setEditingId(scenario.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this scenario?')) return;
    await api.delete(`/admin/scenarios/${id}`);
    fetchScenarios();
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">📝 Manage Scenarios</h1>
        <button
          onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(emptyForm); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
        >
          {showForm ? 'Cancel' : '+ New Scenario'}
        </button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">{editingId ? 'Edit Scenario' : 'Create New Scenario'}</h2>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as typeof form.type })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                  <option value="phishing_email">Phishing Email</option>
                  <option value="fake_profile">Fake Profile</option>
                  <option value="malicious_link">Malicious Link</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Difficulty</label>
                <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value as typeof form.difficulty })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div className="flex items-center pt-6">
                <label className="flex items-center">
                  <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="ml-2 text-sm text-gray-700">Active</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea rows={2} required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Content (JSON)</label>
              <textarea rows={6} required value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Explanation</label>
              <textarea rows={2} required value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Indicators (one per line)</label>
              <textarea rows={3} value={form.indicators} onChange={(e) => setForm({ ...form, indicators: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium">
              {editingId ? 'Update Scenario' : 'Create Scenario'}
            </button>
          </form>
        </div>
      )}

      {/* Scenarios Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Difficulty</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {scenarios.map((s) => (
              <tr key={s.id}>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{s.title}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{s.type.replace('_', ' ')}</td>
                <td className="px-6 py-4 text-sm capitalize text-gray-500">{s.difficulty}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    s.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {s.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm space-x-3">
                  <button onClick={() => handleEdit(s)} className="text-blue-600 hover:text-blue-800 font-medium">Edit</button>
                  <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:text-red-800 font-medium">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
