'use client';

import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console
    console.error('🚨 ErrorBoundary caught an error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
    
    this.setState({ errorInfo });
    
    // Call optional error handler
    this.props.onError?.(error, errorInfo);
    
    // In production, you could send this to an error tracking service
    // e.g., Sentry, LogRocket, etc.
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = () => {
    window.location.reload();
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
              Oops, qualcosa è andato storto
            </h2>
            <p className="text-onde-ocean/60 mb-6">
              Abbiamo incontrato un'onda anomala. Prova a ricaricare la pagina.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <button
                onClick={this.handleReset}
                className="px-6 py-3 rounded-xl bg-onde-ocean/10 text-onde-ocean font-semibold
                         hover:bg-onde-ocean/20 transition-colors"
              >
                Riprova
              </button>
              <button
                onClick={this.handleReload}
                className="px-6 py-3 rounded-xl bg-onde-ocean text-white font-semibold
                         hover:bg-onde-ocean/90 transition-colors"
              >
                🔄 Ricarica Pagina
              </button>
              <a
                href="/"
                className="px-6 py-3 rounded-xl bg-onde-coral/10 text-onde-coral font-semibold
                         hover:bg-onde-coral/20 transition-colors"
              >
                🏠 Torna alla Home
              </a>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-8 text-left">
                <summary className="text-sm text-onde-ocean/40 cursor-pointer hover:text-onde-ocean/60">
                  Error Details (dev only)
                </summary>
                <pre className="mt-2 p-4 bg-red-50 rounded-lg text-xs text-red-800 overflow-auto max-h-64">
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                  {this.state.errorInfo?.componentStack && (
                    <>
                      {'\n\n--- Component Stack ---\n'}
                      {this.state.errorInfo.componentStack}
                    </>
                  )}
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

// Game-specific error boundary with playful UI
interface GameErrorBoundaryProps {
  children: ReactNode;
  gameName?: string;
}

interface GameErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class GameErrorBoundary extends Component<GameErrorBoundaryProps, GameErrorBoundaryState> {
  constructor(props: GameErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): Partial<GameErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🎮 Game Error:', {
      game: this.props.gameName || 'Unknown',
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-b from-gray-900 to-gray-800">
          <div className="max-w-lg text-center">
            {/* Glitchy game over effect */}
            <div className="relative mb-6">
              <div className="text-8xl animate-bounce">🎮</div>
              <div className="absolute inset-0 flex items-center justify-center opacity-50 text-8xl animate-pulse" style={{ animationDelay: '0.1s' }}>
                💥
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-2 font-mono tracking-wider">
              GAME CRASHED!
            </h2>
            <p className="text-gray-400 mb-2 font-mono">
              {this.props.gameName ? `${this.props.gameName} hit a bug` : 'The game hit an unexpected bug'}
            </p>
            <p className="text-gray-500 mb-8 text-sm">
              Don't worry, your progress might be saved. Try again!
            </p>
            
            <div className="flex gap-4 justify-center flex-wrap">
              <button
                onClick={this.handleRetry}
                className="px-8 py-4 rounded-xl bg-green-500 text-white font-bold text-lg
                         hover:bg-green-400 transition-all transform hover:scale-105
                         shadow-lg shadow-green-500/30"
              >
                🔄 Try Again
              </button>
              <button
                onClick={this.handleReload}
                className="px-8 py-4 rounded-xl bg-blue-500 text-white font-bold text-lg
                         hover:bg-blue-400 transition-all transform hover:scale-105
                         shadow-lg shadow-blue-500/30"
              >
                ⟳ Reload Page
              </button>
              <a
                href="/games"
                className="px-8 py-4 rounded-xl bg-purple-500 text-white font-bold text-lg
                         hover:bg-purple-400 transition-all transform hover:scale-105
                         shadow-lg shadow-purple-500/30"
              >
                🏠 Back to Games
              </a>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-8 text-left">
                <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-300 font-mono">
                  🐛 Debug Info (dev only)
                </summary>
                <pre className="mt-2 p-4 bg-gray-950 rounded-lg text-xs text-red-400 overflow-auto max-h-48 font-mono border border-gray-700">
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
