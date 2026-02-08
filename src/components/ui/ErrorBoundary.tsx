import { Component, type ReactNode } from 'react';
import { TriangleAlert } from 'lucide-react';

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  message: string;
};

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-base-100 text-base-content">
          <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-6 px-6 text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-error/10 text-error">
              <TriangleAlert className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold">Something went wrong</h1>
              <p className="text-sm text-base-content/70">
                The interface crashed while rendering. Reload the page, and if it keeps happening, check the console.
              </p>
            </div>
            {this.state.message && (
              <pre className="w-full rounded-2xl bg-base-200 p-4 text-left text-xs text-base-content/70">
                {this.state.message}
              </pre>
            )}
            <button onClick={() => window.location.reload()} className="btn btn-primary">
              Reload app
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
