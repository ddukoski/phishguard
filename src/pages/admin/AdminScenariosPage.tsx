import { useEffect, useState } from 'react';
import { ListChecks, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApi } from '../../contexts/AxiosContext';
import type { Scenario } from '../../types';
import type { ScenarioType, Difficulty } from '../../lib/types';
import { getErrorMessage } from '../../lib/api-types';
import LoadingState from '../../components/ui/LoadingState';
import PageHeader from '../../components/ui/PageHeader';
import SectionCard from '../../components/ui/SectionCard';
import { ActiveBadge, DifficultyBadge } from '../../components/ui/Badges';
import ScenarioTypeIcon from '../../components/ui/ScenarioTypeIcon';

type ScenarioForm = {
  readonly title: string;
  readonly description: string;
  readonly type: ScenarioType;
  readonly difficulty: Difficulty;
  readonly content: string;
  readonly indicators: string;
  readonly explanation: string;
  readonly is_active: boolean;
};

const emptyForm: ScenarioForm = {
  title: '',
  description: '',
  type: 'phishing_email',
  difficulty: 'medium',
  content: '{}',
  indicators: '',
  explanation: '',
  is_active: true,
};

export default function AdminScenariosPage() {
  const api = useApi();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ScenarioForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [statusUpdating, setStatusUpdating] = useState<Set<string>>(new Set());

  const fetchScenarios = () => {
    api
      .get('/admin/scenarios')
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
      setError(getErrorMessage(err));
    }
  };

  const handleActivate = async (scenarioId: string) => {
    setStatusUpdating((prev) => new Set(prev).add(scenarioId));

    try {
      const response = await api.patch(`/admin/scenarios/${scenarioId}/toggle-status`);
      const updatedScenario = response.data?.scenario as Scenario | undefined;

      if (updatedScenario?.id) {
        setScenarios((prev) =>
          prev.map((scenario) => (scenario.id === scenarioId ? updatedScenario : scenario)),
        );
        toast.success(`Scenario ${updatedScenario.is_active ? 'activated' : 'deactivated'}.`);
      } else {
        fetchScenarios();
        toast.success('Scenario status updated.');
      }
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    } finally {
      setStatusUpdating((prev) => {
        const next = new Set(prev);
        next.delete(scenarioId);
        return next;
      });
    }
  };

  const handleEdit = (scenario: Scenario) => {
    setForm({
      title: scenario.title,
      description: scenario.description,
      type: scenario.type as ScenarioType,
      difficulty: scenario.difficulty as Difficulty,
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
    return <LoadingState label="Loading scenarios" />;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Manage Scenarios"
        description="Create, refine, and activate simulations."
        icon={ListChecks}
        actions={
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setForm(emptyForm);
            }}
            className={`btn ${showForm ? 'btn-ghost' : 'btn-primary'}`}
          >
            <Plus className="h-4 w-4" />
            {showForm ? 'Close form' : 'New scenario'}
          </button>
        }
      />

      {showForm && (
        <SectionCard title={editingId ? 'Edit scenario' : 'Create a new scenario'}>
          {error && (
            <div className="alert alert-error">
              <span className="text-sm">{error}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="form-control">
                <div className="label">
                  <span className="label-text">Title</span>
                </div>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="input input-bordered w-full"
                />
              </label>
              <label className="form-control">
                <div className="label">
                  <span className="label-text">Type</span>
                </div>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as typeof form.type })}
                  className="select select-bordered w-full"
                >
                  <option value="phishing_email">Phishing Email</option>
                  <option value="fake_profile">Fake Profile</option>
                  <option value="malicious_link">Messaging</option>
                </select>
              </label>
              <label className="form-control">
                <div className="label">
                  <span className="label-text">Difficulty</span>
                </div>
                <select
                  value={form.difficulty}
                  onChange={(e) =>
                    setForm({ ...form, difficulty: e.target.value as typeof form.difficulty })
                  }
                  className="select select-bordered w-full"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </label>
              <label className="form-control">
                <div className="label">
                  <span className="label-text">Status</span>
                </div>
                <label className="label cursor-pointer justify-start gap-3">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="toggle toggle-primary"
                  />
                  <span className="label-text">Active</span>
                </label>
              </label>
            </div>
            <label className="form-control">
              <div className="label">
                <span className="label-text">Description</span>
              </div>
              <textarea
                rows={2}
                required
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="textarea textarea-bordered w-full"
              />
            </label>
            <label className="form-control">
              <div className="label">
                <span className="label-text">Content (JSON)</span>
              </div>
              <textarea
                rows={6}
                required
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="textarea textarea-bordered w-full font-mono text-sm"
              />
            </label>
            <label className="form-control">
              <div className="label">
                <span className="label-text">Explanation</span>
              </div>
              <textarea
                rows={2}
                required
                value={form.explanation}
                onChange={(e) => setForm({ ...form, explanation: e.target.value })}
                className="textarea textarea-bordered w-full"
              />
            </label>
            <label className="form-control">
              <div className="label">
                <span className="label-text">Indicators (one per line)</span>
              </div>
              <textarea
                rows={3}
                value={form.indicators}
                onChange={(e) => setForm({ ...form, indicators: e.target.value })}
                className="textarea textarea-bordered w-full"
              />
            </label>
            <button type="submit" className="btn btn-primary w-fit">
              {editingId ? 'Update scenario' : 'Create scenario'}
            </button>
          </form>
        </SectionCard>
      )}

      <SectionCard title="All scenarios" description="Review availability and edit content.">
        <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead>
              <tr className="text-center">
                <th>Title</th>
                <th>Type</th>
                <th>Difficulty</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((scenario) => (
                <tr className="text-center" key={scenario.id}>
                  <td className="font-medium text-base-content">{scenario.title}</td>
                  <td>
                    <ScenarioTypeIcon type={scenario.type} />
                  </td>
                  <td>
                    <DifficultyBadge difficulty={scenario.difficulty} />
                  </td>
                  <td>
                    <ActiveBadge isActive={scenario.is_active} />
                  </td>
                  <td className="flex gap-2">
                    <button onClick={() => handleEdit(scenario)} className="btn btn-ghost btn-xs">
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(scenario.id)}
                      className="btn btn-ghost btn-xs text-error"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => handleActivate(scenario.id)}
                      className="btn btn-ghost btn-xs"
                      disabled={statusUpdating.has(scenario.id)}
                    >
                      {statusUpdating.has(scenario.id)
                        ? 'Updating...'
                        : scenario.is_active
                          ? 'Deactivate'
                          : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
