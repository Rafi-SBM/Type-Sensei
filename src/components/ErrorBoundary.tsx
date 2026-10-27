import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Last line of defence. A crash in the typing view should not leave a blank
 * page, and clearing stored state is the usual fix if bad data got in.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Kept to the console on purpose: the app ships no analytics or reporting.
    console.error("Unhandled error in Type Sensei", error, info.componentStack);
  }

  private readonly reload = () => {
    window.location.reload();
  };

  private readonly resetStorage = () => {
    try {
      window.localStorage.clear();
    } catch {
      // Nothing more we can do; reload anyway.
    }
    window.location.reload();
  };

  render(): ReactNode {
    if (!this.state.error) return this.props.children;

    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-2xl font-semibold text-text">Something broke</h1>
        <p className="text-sm text-muted">
          The app hit an unexpected error. Reloading usually fixes it.
        </p>
        <pre className="max-w-full overflow-x-auto rounded-lg bg-surface px-4 py-3 text-left font-mono text-xs text-muted">
          {this.state.error.message}
        </pre>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={this.reload}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-contrast transition-[filter] hover:brightness-110"
          >
            Reload
          </button>
          <button
            type="button"
            onClick={this.resetStorage}
            className="rounded-md bg-surface px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-surface-strong"
          >
            Clear saved data and reload
          </button>
        </div>
      </main>
    );
  }
}
