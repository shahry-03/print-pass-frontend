import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

/** Global error boundary component */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
          <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-lg shadow-lg max-w-md">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Something went wrong
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={this.resetError}
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
