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
import ReactMarkdown from 'react-markdown';
import { useApi } from '../../contexts/AxiosContext';
import type { Scenario, ScenarioAttempt, Feedback, ScenarioType, KeyInteraction } from '../../types';
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
  const [aiReview, setAiReview] = useState<string | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [actualThreat, setActualThreat] = useState<boolean | null>(null);
  const [keyInteractions, setKeyInteractions] = useState<KeyInteraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [description, setDescription] = useState('');
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
        description: description.trim(),
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
      setAiReview(res.data.attempt?.ai_review ?? null);
      setReviewError(null);
      setActualThreat(typeof res.data.actual_threat === 'boolean' ? res.data.actual_threat : null);
      setKeyInteractions(Array.isArray(res.data.key_interactions) ? res.data.key_interactions : []);
      setAttempt({ ...res.data.attempt, score });
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateAiReview = async () => {
    if (!attempt || reviewLoading || aiReview) return;

    setReviewLoading(true);
    setReviewError(null);
    try {
      const res = await api.post(`/attempts/${attempt.id}/ai-review`);
      setAiReview(res.data.ai_review ?? null);
      if (res.data.attempt) {
        setAttempt((prev) => (prev ? { ...prev, ...res.data.attempt } : prev));
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? 'Unable to generate AI review right now. Please try again.';
      setReviewError(message);
    } finally {
      setReviewLoading(false);
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

  const contentMap = scenario.content as Record<string, unknown>;
  const resolvedHtmlContent =
    scenario.html_content ??
    (typeof contentMap.html_content === 'string' ? (contentMap.html_content as string) : undefined);
  const resolvedInteractiveElements =
    scenario.interactive_elements ??
    (Array.isArray(contentMap.interactive_elements)
      ? (contentMap.interactive_elements as Scenario['interactive_elements'])
      : undefined);

  const TypeIcon = typeIconMap[scenario.type];

  const interactionTypeLabels: Record<string, string> = {
    suspicious: 'Suspicious signal',
    malicious_link: 'Malicious link',
    social_engineering: 'Social engineering',
    red_flag: 'Red flag',
    legitimate: 'Legitimate signal',
  };

  const getInteractionLabel = (interaction: KeyInteraction) => {
    if (interaction.element_type && interactionTypeLabels[interaction.element_type]) {
      return interactionTypeLabels[interaction.element_type];
    }
    return interaction.element_type || interaction.element || 'Indicator';
  };

  const spottedInteractions = keyInteractions.filter((interaction) => interaction.user_noticed);
  const missedInteractions = keyInteractions.filter((interaction) => !interaction.user_noticed);

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

        {!feedback.correct && actualThreat !== null && (
          <SectionCard title="Correct answer" description="What the correct classification was for this scenario.">
            <div className={`badge ${actualThreat ? 'badge-error' : 'badge-success'} text-lg`}>{actualThreat ? 'Threat' : 'Safe'}</div>
          </SectionCard>
        )}

        {keyInteractions.length > 0 && (
          <SectionCard title="Spotted & Missed Indicators" description="What you noticed during the scenario and what you missed.">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h4 className="font-semibold">Spotted ({spottedInteractions.length})</h4>
                {spottedInteractions.length === 0 ? (
                  <p className="mt-2 text-sm text-base-content/60">No key threat indicators were actively spotted in this attempt.</p>
                ) : (
                  <ul className="mt-2 space-y-2">
                    {spottedInteractions.map((interaction, idx) => (
                      <li key={`${interaction.element}-${idx}`} className="rounded-lg border border-success/30 bg-success/10 p-3">
                        <p className="text-sm font-semibold text-success-content/90">{getInteractionLabel(interaction)}</p>
                        {interaction.element_description && (
                          <p className="mt-1 text-xs text-base-content/70">{interaction.element_description}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <h4 className="font-semibold">Missed ({missedInteractions.length})</h4>
                {missedInteractions.length === 0 ? (
                  <p className="mt-2 text-sm text-base-content/60">Great work - you did not miss the key flagged indicators.</p>
                ) : (
                  <ul className="mt-2 space-y-2">
                    {missedInteractions.map((interaction, idx) => (
                      <li key={`${interaction.element}-${idx}`} className="rounded-lg border border-error/30 bg-error/10 p-3">
                        <p className="text-sm font-semibold text-error-content/90">{getInteractionLabel(interaction)}</p>
                        {interaction.element_description && (
                          <p className="mt-1 text-xs text-base-content/70">{interaction.element_description}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </SectionCard>
        )}

        {!aiReview && (
          <SectionCard title="AI review" description="Generate an automated analysis of your reasoning.">
            <div className="space-y-3">
              <button
                onClick={handleGenerateAiReview}
                className="btn btn-outline btn-primary"
                disabled={reviewLoading}
              >
                {reviewLoading ? 'Generating AI review...' : 'Generate AI review'}
              </button>
              {reviewError && <p className="text-sm text-error">{reviewError}</p>}
            </div>
          </SectionCard>
        )}

        {aiReview && (
          <SectionCard title="AI review" description="Automated analysis of your reasoning.">
            <div className="prose prose-sm max-w-none text-base-content/80">
              <ReactMarkdown
                components={{
                  p: (props) => <p className="mb-2 text-sm" {...props} />,
                  ul: (props) => <ul className="list-disc list-inside mb-2" {...props} />,
                  ol: (props) => <ol className="list-decimal list-inside mb-2" {...props} />,
                  li: (props) => <li className="text-sm mb-1" {...props} />,
                  h1: (props) => <h1 className="text-lg font-bold mb-2" {...props} />,
                  h2: (props) => <h2 className="text-base font-semibold mb-2" {...props} />,
                  h3: (props) => <h3 className="text-sm font-semibold mb-1" {...props} />,
                  strong: (props) => <strong className="font-semibold" {...props} />,
                  em: (props) => <em className="italic" {...props} />,
                  code: (props) => <code className="bg-base-200 px-1.5 py-0.5 rounded text-xs font-mono" {...props} />,
                  pre: (props) => <pre className="bg-base-200 p-2 rounded mb-2 overflow-x-auto text-xs" {...props} />,
                  blockquote: (props) => <blockquote className="border-l-4 border-base-300 pl-3 italic text-base-content/70 mb-2" {...props} />,
                  a: (props) => <a className="link link-primary" target="_blank" rel="noopener noreferrer" {...props} />,
                  hr: () => <hr className="my-2 border-base-300" />,
                  table: (props) => <table className="table table-sm mb-2" {...props} />,
                  thead: (props) => <thead className="bg-base-200" {...props} />,
                  tbody: (props) => <tbody {...props} />,
                  tr: (props) => <tr {...props} />,
                  td: (props) => <td className="px-2 py-1 text-sm" {...props} />,
                  th: (props) => <th className="px-2 py-1 text-sm font-semibold" {...props} />,
                }}
              >
                {aiReview}
              </ReactMarkdown>
            </div>
          </SectionCard>
        )}

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
          htmlContent={resolvedHtmlContent}
          interactiveElements={resolvedInteractiveElements}
        />
      </SectionCard>

      <SectionCard title="Make the call" description="Decide whether the content is a threat.">
        <div className="mb-4">
          <label className="label">
            <span className="label-text">Explain your decision</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Briefly explain why you think this is safe or a threat..."
            className="textarea textarea-bordered w-full"
            rows={4}
            maxLength={10000}
          />
          {description.trim().length === 0 && (
            <p className="text-xs opacity-70 mt-1">Please provide a short explanation before classifying.</p>
          )}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            onClick={() => handleDecision(true)}
            disabled={submitting || description.trim().length === 0}
            className="btn btn-error"
          >
            <ShieldAlert className="h-4 w-4" />
            Flag as Threat
          </button>
          <button
            onClick={() => handleDecision(false)}
            disabled={submitting || description.trim().length === 0}
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
