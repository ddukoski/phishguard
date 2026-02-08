import { LoaderCircle } from 'lucide-react';

type LoadingStateProps = {
  label?: string;
};

export default function LoadingState({ label = 'Loading' }: LoadingStateProps) {
  return (
    <div className="flex min-h-screen items-center justify-center gap-3 py-16 text-base-content/70">
      <LoaderCircle className="h-5 w-5 animate-spin" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}
