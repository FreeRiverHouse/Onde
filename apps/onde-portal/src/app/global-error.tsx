'use client';

import { useEffect } from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Global error boundary for the entire app.
 * This catches errors in the root layout and provides a fallback UI.
 * It prevents the dreaded white screen of death.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log the critical error
    console.error('🚨 Critical app error:', {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  // Note: global-error must define its own <html> and <body> tags
  // because it replaces the root layout when an error occurs
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Something went wrong | Onde</title>
        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
          }
          .container {
            max-width: 32rem;
            text-align: center;
          }
          .icon {
            font-size: 6rem;
            margin-bottom: 1.5rem;
            animation: float 3s ease-in-out infinite;
          }
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          h1 {
            color: white;
            font-size: 2rem;
            font-weight: 800;
            margin-bottom: 0.75rem;
          }
          .subtitle {
            color: #94a3b8;
            font-size: 1.125rem;
            margin-bottom: 0.5rem;
          }
          .description {
            color: #64748b;
            margin-bottom: 2rem;
            line-height: 1.6;
          }
          .buttons {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
          }
          .btn {
            padding: 1rem 2rem;
            border-radius: 1rem;
            font-weight: 700;
            font-size: 1rem;
            border: none;
            cursor: pointer;
            transition: all 0.2s;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
          }
          .btn:hover {
            transform: scale(1.05);
          }
          .btn-primary {
            background: linear-gradient(135deg, #3b82f6, #6366f1);
            color: white;
            box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.4);
          }
          .btn-secondary {
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.4);
          }
          .btn-tertiary {
            background: rgba(255, 255, 255, 0.1);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          .error-id {
            margin-top: 2rem;
            font-size: 0.75rem;
            color: #475569;
            font-family: monospace;
          }
          .dev-details {
            margin-top: 2rem;
            text-align: left;
          }
          .dev-details summary {
            color: #64748b;
            font-size: 0.875rem;
            cursor: pointer;
            font-family: monospace;
          }
          .dev-details summary:hover {
            color: #94a3b8;
          }
          .error-box {
            margin-top: 0.75rem;
            padding: 1rem;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 0.75rem;
            border: 1px solid rgba(239, 68, 68, 0.3);
          }
          .error-message {
            color: #f87171;
            font-family: monospace;
            font-size: 0.875rem;
            margin-bottom: 0.5rem;
          }
          .error-stack {
            color: #64748b;
            font-family: monospace;
            font-size: 0.75rem;
            overflow: auto;
            max-height: 8rem;
            white-space: pre-wrap;
            word-break: break-all;
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          <div className="icon">🌊</div>
          
          <h1>Oops, something went wrong</h1>
          
          <p className="subtitle">
            We hit an unexpected wave
          </p>
          
          <p className="description">
            The application encountered a critical error. Don't worry — 
            just try refreshing the page or head back to the homepage.
          </p>
          
          <div className="buttons">
            <button onClick={reset} className="btn btn-primary">
              🔄 Try Again
            </button>
            
            <button onClick={handleReload} className="btn btn-secondary">
              ⟳ Reload
            </button>
            
            <button onClick={handleGoHome} className="btn btn-tertiary">
              🏠 Go Home
            </button>
          </div>
          
          {error.digest && (
            <p className="error-id">
              Error ID: {error.digest}
            </p>
          )}
          
          {process.env.NODE_ENV === 'development' && (
            <details className="dev-details">
              <summary>🐛 Developer Details</summary>
              <div className="error-box">
                <p className="error-message">{error.message}</p>
                <pre className="error-stack">{error.stack}</pre>
              </div>
            </details>
          )}
        </div>
      </body>
    </html>
  );
}
