import { Link } from 'react-router-dom';
import SectionCard from '../ui/SectionCard';

export default function DashboardEmpty() {
  return (
    <SectionCard title="Your workspace is ready" description="Start a scenario to unlock progress insights.">
      <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-3 text-sm text-base-content/70">
          <div className="rounded-2xl border border-base-200 bg-base-200/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-base-content/50">Step 1</p>
            <p className="mt-2 text-base font-semibold text-base-content">Choose a scenario</p>
            <p>Pick a phishing type and difficulty level to simulate.</p>
          </div>
          <div className="rounded-2xl border border-base-200 bg-base-200/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-base-content/50">Step 2</p>
            <p className="mt-2 text-base font-semibold text-base-content">Make the call</p>
            <p>Flag as threat or safe to build stronger detection instincts.</p>
          </div>
          <div className="rounded-2xl border border-base-200 bg-base-200/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-base-content/50">Step 3</p>
            <p className="mt-2 text-base font-semibold text-base-content">Review feedback</p>
            <p>See indicators and tips that sharpen your awareness.</p>
          </div>
        </div>
        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-base-200 bg-base-100 p-5">
          <div className="space-y-2">
            <p className="text-sm text-base-content/60">Ready to begin?</p>
            <p className="text-lg font-semibold text-base-content">Launch your first scenario now.</p>
          </div>
          <Link to="/scenarios" className="btn btn-primary w-full">
            Start a scenario
          </Link>
        </div>
      </div>
    </SectionCard>
  );
}
