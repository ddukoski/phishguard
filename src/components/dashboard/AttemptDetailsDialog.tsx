import { useEffect } from 'react';
import type { ScenarioAttempt } from '../../types';
import { X, Clock, CheckCircle, XCircle } from 'lucide-react';
import SectionCard from '../ui/SectionCard';
import ScenarioTypeIcon from '../ui/ScenarioTypeIcon';

type Props = {
  attempt: ScenarioAttempt | null;
  open: boolean;
  onClose: () => void;
};

export default function AttemptDetailsDialog({ attempt, open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const scrollY = window.scrollY || window.pageYOffset;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  if (!open || !attempt) return null;

  const resultLabel = attempt.result;
  const userDescription = (attempt as any).description ?? 'No description provided.';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
      <div className="max-w-3xl w-full">
        <SectionCard>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-base-200 p-2">
                <ScenarioTypeIcon type={(attempt.scenario?.type ?? 'phishing_email') as any} />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{attempt.scenario?.title ?? 'Untitled scenario'}</h3>
                <p className="text-sm text-base-content/60">{attempt.scenario?.description}</p>
              </div>
            </div>

            <button className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <div className="text-sm text-base-content/60">Result</div>
              <div className="flex items-center gap-2">
                {attempt.result === 'correct' ? (
                  <CheckCircle className="text-success h-5 w-5" />
                ) : attempt.result === 'incorrect' ? (
                  <XCircle className="text-error h-5 w-5" />
                ) : (
                  <Clock className="text-base-content/60 h-5 w-5" />
                )}
                <div className="font-semibold capitalize">{resultLabel}</div>
              </div>

              <div className="text-sm text-base-content/60">Score</div>
              <div className="font-semibold">{attempt.score}</div>

              <div className="text-sm text-base-content/60">Time spent</div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-base-content/60" />
                <span>{attempt.time_spent_seconds} seconds</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-base-content/60">Started</div>
              <div className="font-semibold">{new Date(attempt.created_at).toLocaleString()}</div>

              <div className="text-sm text-base-content/60">Completed</div>
              <div className="font-semibold">{attempt.completed_at ? new Date(attempt.completed_at).toLocaleString() : '—'}</div>

              <div className="text-sm text-base-content/60">User description</div>
              <div className="whitespace-pre-wrap bg-base-100 rounded p-2 text-sm">{userDescription}</div>
            </div>
          </div>

          {attempt.feedback && (
            <div className="mt-4">
              <h4 className="font-semibold">Feedback</h4>
              <p className="text-sm text-base-content/70">{attempt.feedback.explanation}</p>
              {attempt.feedback.indicators.length > 0 && (
                <ul className="mt-2 space-y-1 text-sm text-base-content/70">
                  {attempt.feedback.indicators.map((i, idx) => (
                    <li key={idx}>• {i}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {attempt.actions && attempt.actions.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold">Actions</h4>
              <ul className="mt-2 text-sm text-base-content/70">
                {attempt.actions.map((a, idx) => (
                  <li key={idx} className="py-1">
                    <div className="font-medium">{a.action}</div>
                    <div className="text-xs text-base-content/60">{JSON.stringify(a.details)}</div>
                    <div className="text-xs text-base-content/50">{new Date(a.timestamp).toLocaleString()}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
