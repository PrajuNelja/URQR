import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "../Buttons/Button";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can log the error to an external service here
    console.error("Uncaught error caught by boundary:", error, errorInfo);
  }

  private handleReset = () => {
    // Reset the error state to try rendering again (Task 5)
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default UI fallback
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-bg p-6 text-center font-sans">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 shadow-lg">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-error-bg text-error">
              <AlertTriangle size={32} />
            </div>
            
            <h2 className="mb-2 text-xl font-bold text-text">
              Something went wrong
            </h2>
            
            <p className="mb-6 text-sm text-text-secondary">
              An unexpected error occurred in the application. Your data should be safe, but the interface needs to reload.
            </p>

            {/* Show error message in dev mode only */}
            {import.meta.env.DEV && this.state.error && (
              <div className="mb-6 overflow-x-auto rounded bg-error-bg/50 p-3 text-left text-xs text-error-text">
                <code>{this.state.error.message}</code>
              </div>
            )}

            <Button 
              variant="primary" 
              size="lg" 
              fullWidth
              onClick={this.handleReset}
              leftIcon={<RotateCcw size={18} />}
            >
              Try Again
            </Button>
            
            <button 
              onClick={() => window.location.href = "/"}
              className="mt-4 text-xs font-semibold text-text-secondary hover:text-primary"
            >
              Return to Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}