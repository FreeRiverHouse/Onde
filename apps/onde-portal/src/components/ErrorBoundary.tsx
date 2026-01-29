'use client';

import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // In production, you could send this to an error tracking service
    // e.g., Sentry, LogRocket, etc.
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-[50vh] flex items-center justify-center p-8">
          <div className="max-w-md text-center">
            <div className="text-6xl mb-4">🌊</div>
            <h2 className="text-2xl font-display font-bold text-onde-ocean mb-4">
              Oops, something went wrong
            </h2>
            <p className="text-onde-ocean/60 mb-6">
              We hit an unexpected wave. Please try refreshing the page.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={this.handleReset}
                className="px-6 py-3 rounded-xl bg-onde-ocean text-white font-semibold
                         hover:bg-onde-ocean/90 transition-colors"
              >
                Try Again
              </button>
              <a
                href="/"
                className="px-6 py-3 rounded-xl bg-onde-ocean/10 text-onde-ocean font-semibold
                         hover:bg-onde-ocean/20 transition-colors"
              >
                Go Home
              </a>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-8 text-left">
                <summary className="text-sm text-onde-ocean/40 cursor-pointer hover:text-onde-ocean/60">
                  Error Details (dev only)
                </summary>
                <pre className="mt-2 p-4 bg-red-50 rounded-lg text-xs text-red-800 overflow-auto">
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
