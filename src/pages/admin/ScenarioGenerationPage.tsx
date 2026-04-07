import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import SectionCard from '../../components/ui/SectionCard';
import ScenarioContent from '../../components/scenarios/ScenarioContent';
import { useApi } from '../../contexts/AxiosContext';
import toast from 'react-hot-toast';

export default function ScenarioGenerationPage() {
  const api = useApi();
  const navigate = useNavigate();

  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [type, setType] = useState<'phishing_email' | 'fake_profile' | 'messaging'>('phishing_email');
  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generated, setGenerated] = useState<any | null>(null);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await api.post('/admin/scenarios/generate', { difficulty, type, description });
      setGenerated(res.data.scenario);
      toast.success('Generated preview ready');
    } catch (err: any) {
      console.error(err);
      const msg = err?.response?.data?.message ?? 'Failed to generate scenario';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const accept = async () => {
    if (!generated) return;
    setSaving(true);
    try {
      // backend admin create endpoint expects scenario payload
      await api.post('/admin/scenarios', generated);
      toast.success('Scenario saved');
      setGenerated(null);
      setDescription('');
      setDifficulty('easy');
      setType('phishing_email');
      navigate('/admin/scenarios');
    } catch (err: any) {
      console.error(err);
      const msg = err?.response?.data?.message ?? 'Failed to save scenario';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setGenerated(null);
    setDescription('');
    setDifficulty('easy');
    setType('phishing_email');
  };

  return (
    <div>
      <PageHeader title="AI Scenario Generator" description="Generate phishing scenarios with AI" />

      <SectionCard>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="label"><span className="label-text">Difficulty</span></label>
            <select className="select w-full" value={difficulty} onChange={(e) => setDifficulty(e.target.value as any)}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div>
            <label className="label"><span className="label-text">Type</span></label>
            <select className="select w-full" value={type} onChange={(e) => setType(e.target.value as any)}>
              <option value="phishing_email">Phishing Email</option>
              <option value="fake_profile">Fake Profile</option>
              <option value="messaging">Messaging</option>
            </select>
          </div>

          <div>
            <label className="label"><span className="label-text">Description (optional)</span></label>
            <textarea
              className="textarea textarea-bordered w-full"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Optional: give the model guidance, e.g. target audience or special cues"
            />
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <button className="btn btn-primary" onClick={generate} disabled={loading}>
            {loading ? 'Generating...' : 'Generate Scenario'}
          </button>
          <button className="btn btn-ghost" onClick={reset}>
            Reset
          </button>
        </div>
      </SectionCard>

      {generated && (
        <div className="space-y-4 mt-4">
          <SectionCard title="Preview">
            <h3 className="font-semibold">{generated.title}</h3>
            <p className="text-sm text-base-content/70">{generated.description}</p>

            <div className="mt-4">
              <ScenarioContent
                type={generated.type}
                content={generated.content}
                htmlContent={generated.html_content}
                interactiveElements={generated.interactive_elements}
              />
            </div>

            <div className="mt-4 flex gap-3">
              <button className="btn btn-primary" onClick={accept} disabled={saving}>
                {saving ? 'Saving...' : 'Accept Scenario'}
              </button>
              <button className="btn btn-ghost" onClick={reset}>Reset</button>
            </div>
          </SectionCard>
        </div>
      )}
    </div>
  );
}

