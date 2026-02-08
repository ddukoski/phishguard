import type { ReactNode } from 'react';
import { ShieldCheck, Sparkles } from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';

type AuthShellProps = {
  children: ReactNode;
};

export default function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="relative min-h-screen bg-base-100">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center gap-10 px-6 py-12 lg:flex-row">
        <div className="flex w-full items-center justify-end lg:hidden">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-base-content/50">
              Security training
            </p>
            <h1 className="text-3xl font-semibold text-base-content">
              Build better threat instincts.
            </h1>
          </div>
          <p className="text-lg text-base-content/70">
            Build instincts that spot scams in seconds. Train on realistic scenarios and track your
            improvement.
          </p>
          <div className="grid gap-3 text-sm text-base-content/70">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <span>Interactive phishing simulations tailored to your role.</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Sparkles className="h-4 w-4" />
              </span>
              <span>Actionable feedback to close knowledge gaps fast.</span>
            </div>
          </div>
        </div>
        <div className="w-full max-w-md">
          <div className="card border border-base-300 bg-base-200/30 dark:bg-base-300 shadow-xl">
            <div className="card-body p-8 gap-8">{children}</div>
          </div>
        </div>
      </div>
      <div className="absolute right-6 top-6 hidden lg:block">
        <ThemeToggle />
      </div>
    </div>
  );
}
