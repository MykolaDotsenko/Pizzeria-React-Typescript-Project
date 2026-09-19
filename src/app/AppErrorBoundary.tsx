import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<Props, State> {
  override state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    void error;
    void info;
    // Production apps would report this boundary to an observability service.
  }

  override render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <main className="fatal-error">
        <div className="fatal-error__card">
          <span className="eyebrow">Unexpected error</span>
          <h1>Something went wrong.</h1>
          <p>
            Your saved menu remains in this browser. Reload the application to try
            again.
          </p>
          <button
            className="button button--primary"
            type="button"
            onClick={() => window.location.reload()}
          >
            Reload application
          </button>
        </div>
      </main>
    );
  }
}
