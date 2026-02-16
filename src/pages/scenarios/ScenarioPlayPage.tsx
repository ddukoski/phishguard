import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  Lightbulb,
  ShieldAlert,
  ShieldCheck,
  Mail,
  UserRound,
  CircleAlert,
  MessageSquare,
} from 'lucide-react';
import { useApi } from '../../contexts/AxiosContext';
import type { Scenario, ScenarioAttempt, Feedback, ScenarioType } from '../../types';
import PageHeader from '../../components/ui/PageHeader';
import LoadingState from '../../components/ui/LoadingState';
import EmptyState from '../../components/ui/EmptyState';
import SectionCard from '../../components/ui/SectionCard';
import ScenarioContent from '../../components/scenarios/ScenarioContent';
import { DifficultyBadge, ScenarioTypeBadge } from '../../components/ui/Badges';

const typeIconMap: Record<ScenarioType, typeof Mail> = {
  phishing_email: Mail,
  fake_profile: UserRound,
  malicious_link: MessageSquare,
  messaging: MessageSquare,
};

export default function ScenarioPlayPage() {
  const api = useApi();
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
    if (!attempt || !scenario) return;
    setSubmitting(true);

    const timeSpent = Math.round((Date.now() - startTime.current) / 1000);
    const isCorrect = identifiedAsThreat === scenario.is_threat;
    const score = isCorrect
      ? scenario.difficulty === 'hard'
        ? 30
        : scenario.difficulty === 'medium'
          ? 20
          : 10
      : 0;

    try {
      await api.post(`/attempts/${attempt.id}/action`, {
        action: identifiedAsThreat ? 'flagged_as_threat' : 'marked_as_safe',
        details: { time_spent: timeSpent },
      });

      const res = await api.post(`/attempts/${attempt.id}/complete`, {
        user_identified_threat: identifiedAsThreat,
        time_spent_seconds: timeSpent,
      });

      setFeedback(
        res.data.feedback ?? {
          correct: isCorrect,
          explanation:
            scenario.explanation ??
            (isCorrect
              ? 'Great job! You correctly identified this scenario.'
              : `This was ${scenario.is_threat ? 'a threat' : 'safe content'}. Review the indicators below.`),
          indicators: scenario.indicators ?? [],
          tips: isCorrect
            ? ['Keep practicing to maintain your skills!']
            : [
                'Take your time to analyze suspicious elements.',
                'Check sender addresses and URLs carefully.',
              ],
        }
      );
      setAttempt({ ...res.data.attempt, score });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingState label="Loading scenario" />;
  }

  if (!scenario || !attempt) {
    return (
      <EmptyState
        title="Scenario not found"
        description="The simulation may have been removed or is unavailable."
        action={
          <button onClick={() => navigate('/scenarios')} className="btn btn-primary">
            Browse Scenarios
          </button>
        }
      />
    );
  }

  const TypeIcon = typeIconMap[scenario.type];

  if (feedback) {
    return (
      <div className="space-y-6">
        <SectionCard>
          <div className={`alert ${feedback.correct ? 'alert-success' : 'alert-error'}`}>
            <div className="flex items-center gap-3">
              {feedback.correct ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <XCircle className="h-5 w-5" />
              )}
              <div>
                <h3 className="font-semibold dark:text-black">
                  {feedback.correct ? 'Correct identification' : 'Needs a second look'}
                </h3>
                <p className="text-sm opacity-80 dark:text-black">{feedback.explanation}</p>
              </div>
            </div>
          </div>
          {attempt.score > 0 && (
            <p className="text-sm font-semibold text-base-content">
              Score earned: {attempt.score} points
            </p>
          )}
        </SectionCard>

        {feedback.indicators.length > 0 && (
          <SectionCard title="Threat Indicators" description="Signals that influenced the outcome.">
            <ul className="space-y-2 text-sm text-base-content/70">
              {feedback.indicators.map((indicator, index) => (
                <li key={index} className="flex gap-3">
                  <CircleAlert className="mt-0.5 h-4 w-4 text-secondary" />
                  <span>{indicator}</span>
                </li>
              ))}
            </ul>
          </SectionCard>
        )}

        <SectionCard title="Tips" description="Use these cues on similar messages.">
          <ul className="space-y-2 text-sm text-base-content/70">
            {feedback.tips.map((tip, index) => (
              <li key={index} className="flex gap-3">
                <Lightbulb className="mt-0.5 h-4 w-4 text-accent" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </SectionCard>

        <div className="grid gap-3 sm:grid-cols-2">
          <button onClick={() => navigate('/scenarios')} className="btn btn-primary">
            Try Another Scenario
          </button>
          <button onClick={() => navigate('/dashboard')} className="btn btn-ghost">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={scenario.title}
        description={scenario.description}
        icon={TypeIcon}
        actions={<ScenarioTypeBadge type={scenario.type} />}
      />

      <SectionCard>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-base-content/60">Difficulty</span>
          <DifficultyBadge difficulty={scenario.difficulty} />
        </div>
        <ScenarioContent
          type={scenario.type}
          content={scenario.content}
          htmlContent={scenario.html_content}
          interactiveElements={scenario.interactive_elements}
        />
      </SectionCard>

      <SectionCard title="Make the call" description="Decide whether the content is a threat.">
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            onClick={() => handleDecision(true)}
            disabled={submitting}
            className="btn btn-error"
          >
            <ShieldAlert className="h-4 w-4" />
            Flag as Threat
          </button>
          <button
            onClick={() => handleDecision(false)}
            disabled={submitting}
            className="btn btn-success"
          >
            <ShieldCheck className="h-4 w-4" />
            Mark as Safe
          </button>
        </div>
      </SectionCard>
    </div>
  );
}
