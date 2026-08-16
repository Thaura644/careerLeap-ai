import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

/**
 * Global error boundary: an uncaught render error shows a friendly screen
 * with a reload button instead of a blank white page or a raw stack trace.
 */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message || "Something went wrong" };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    // Surface to the console now; error tracking (e.g. Sentry) plugs in here.
    console.error("Unhandled UI error:", error, info);
  }

  handleReload = (): void => {
    window.location.href = "/";
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6 dark:bg-background">
        <div className="w-full max-w-md rounded-lg border bg-white p-8 text-center shadow-sm dark:border-border dark:bg-card">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-2xl dark:bg-red-900/40">
            ⚠️
          </div>
          <h1 className="text-xl font-semibold">Something went wrong</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            An unexpected error occurred. Your data is safe — reload to continue.
          </p>
          <p className="mt-3 rounded bg-muted px-3 py-2 font-mono text-xs text-muted-foreground">
            {this.state.message}
          </p>
          <button
            onClick={this.handleReload}
            className="mt-6 w-full rounded-md bg-leap-purple px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-leap-purple/90"
          >
            Reload Leap.ai
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
