import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import type { Scenario, ScenarioAttempt, Feedback } from '../../types';

export default function ScenarioPlayPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [attempt, setAttempt] = useState<ScenarioAttempt | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const startTime = useRef(Date.now());

  useEffect(() => {
    const startScenario = async () => {
      try {
        const res = await api.post(`/scenarios/${id}/start`);
        setScenario(res.data.scenario);
        setAttempt(res.data.attempt);
        startTime.current = Date.now();
      } catch {
        navigate('/scenarios');
      } finally {
        setLoading(false);
      }
    };
    startScenario();
  }, [id, navigate]);

  const handleDecision = async (identifiedAsThreat: boolean) => {
    if (!attempt) return;
    setSubmitting(true);

    const timeSpent = Math.round((Date.now() - startTime.current) / 1000);

    try {
      // Record the action
      await api.post(`/attempts/${attempt.id}/action`, {
        action: identifiedAsThreat ? 'flagged_as_threat' : 'marked_as_safe',
        details: { time_spent: timeSpent },
      });

      // Complete the attempt
      const res = await api.post(`/attempts/${attempt.id}/complete`, {
        user_identified_threat: identifiedAsThreat,
        time_spent_seconds: timeSpent,
      });

      setFeedback(res.data.feedback);
      setAttempt(res.data.attempt);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;
  }

  if (!scenario || !attempt) {
    return <div className="text-center py-12 text-gray-500">Scenario not found.</div>;
  }

  // Show feedback if completed
  if (feedback) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className={`rounded-lg p-6 ${feedback.correct ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <h2 className={`text-2xl font-bold ${feedback.correct ? 'text-green-700' : 'text-red-700'}`}>
            {feedback.correct ? '🎉 Correct!' : '❌ Incorrect'}
          </h2>
          <p className="mt-2 text-gray-700">{feedback.explanation}</p>
          {attempt.score > 0 && (
            <p className="mt-2 font-semibold text-gray-800">Score: +{attempt.score} points</p>
          )}
        </div>

        {feedback.indicators.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-3">🔍 Threat Indicators</h3>
            <ul className="space-y-2">
              {feedback.indicators.map((indicator, i) => (
                <li key={i} className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span className="text-sm text-gray-700">{indicator}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-gray-900 mb-3">💡 Tips</h3>
          <ul className="space-y-2">
            {feedback.tips.map((tip, i) => (
              <li key={i} className="flex items-start">
                <span className="text-yellow-500 mr-2">→</span>
                <span className="text-sm text-gray-700">{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => navigate('/scenarios')}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            Try Another Scenario
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-medium"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Show scenario content
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">{scenario.title}</h1>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            { easy: 'bg-green-100 text-green-700', medium: 'bg-yellow-100 text-yellow-700', hard: 'bg-red-100 text-red-700' }[scenario.difficulty]
          }`}>
            {scenario.difficulty}
          </span>
        </div>
        <p className="text-gray-600 mb-6">{scenario.description}</p>

        {/* Render scenario content based on type */}
        <ScenarioContent type={scenario.type} content={scenario.content} />
      </div>

      {/* Decision Buttons */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold text-gray-900 mb-4 text-center">
          Is this a phishing threat?
        </h3>
        <div className="flex gap-4">
          <button
            onClick={() => handleDecision(true)}
            disabled={submitting}
            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium disabled:opacity-50"
          >
            🚨 This is a Threat
          </button>
          <button
            onClick={() => handleDecision(false)}
            disabled={submitting}
            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium disabled:opacity-50"
          >
            ✅ This is Safe
          </button>
        </div>
      </div>
    </div>
  );
}

function ScenarioContent({ type, content }: { type: string; content: Record<string, unknown> }) {
  if (type === 'phishing_email') {
    return (
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <div className="border-b border-gray-200 pb-3 mb-3 space-y-1">
          <p className="text-sm"><span className="font-medium text-gray-500">From:</span> {content.from as string}</p>
          <p className="text-sm"><span className="font-medium text-gray-500">Subject:</span> {content.subject as string}</p>
        </div>
        <div className="text-sm text-gray-700 whitespace-pre-wrap">{content.body as string}</div>
        {content.has_link && (
          <div className="mt-4 p-2 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-700 underline cursor-pointer">{content.link_url as string}</p>
          </div>
        )}
        {content.has_attachment && (
          <div className="mt-2 flex items-center text-sm text-gray-500">
            📎 <span className="ml-1">attachment.pdf</span>
          </div>
        )}
      </div>
    );
  }

  if (type === 'fake_profile') {
    return (
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-xl">
            👤
          </div>
          <div>
            <p className="font-medium text-gray-900">{content.display_name as string}</p>
            <p className="text-sm text-gray-500">@{content.username as string} · {content.platform as string}</p>
          </div>
        </div>
        <p className="text-sm text-gray-700 mb-3">{content.bio as string}</p>
        <div className="flex space-x-6 text-sm text-gray-500 mb-4">
          <span><strong>{content.followers as number}</strong> followers</span>
          <span><strong>{content.following as number}</strong> following</span>
          <span><strong>{content.posts_count as number}</strong> posts</span>
        </div>
        <p className="text-xs text-gray-400 mb-3">Account age: {content.account_age_days as number} days</p>
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <p className="text-sm text-gray-700 italic">"{content.message as string}"</p>
        </div>
      </div>
    );
  }

  if (type === 'malicious_link') {
    return (
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <p className="text-sm text-gray-600 mb-3">{content.context as string}</p>
        <div className="bg-white border border-gray-200 rounded p-3">
          <p className="text-sm font-medium text-gray-500 mb-1">Displayed link:</p>
          <p className="text-blue-600 underline">{content.displayed_url as string}</p>
        </div>
        <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
          <span>HTTPS: {content.uses_https ? '✅ Yes' : '❌ No'}</span>
          <span>Shortened: {content.is_shortened ? '⚠️ Yes' : 'No'}</span>
        </div>
      </div>
    );
  }

  return <pre className="text-xs bg-gray-50 p-4 rounded overflow-auto">{JSON.stringify(content, null, 2)}</pre>;
}
