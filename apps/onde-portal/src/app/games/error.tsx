'use client';

import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GamesError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to console
    console.error('🎮 Games section error:', {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-900">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      
      <div className="relative max-w-lg text-center z-10">
        {/* Animated game controller */}
        <div className="relative mb-8">
          <div className="text-9xl animate-bounce">🎮</div>
          <div className="absolute -top-4 -right-4 text-4xl animate-spin" style={{ animationDuration: '3s' }}>⚙️</div>
          <div className="absolute -bottom-2 -left-4 text-3xl animate-pulse">💫</div>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
          Oops! Game Glitch
        </h1>
        
        <p className="text-xl text-purple-200 mb-2">
          Something went wrong in the games area
        </p>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          Don't worry! This happens sometimes. Click below to try again or head back to the games hub.
        </p>
        
        <div className="flex gap-4 justify-center flex-wrap">
          <button
            onClick={reset}
            className="group px-8 py-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 
                     text-white font-bold text-lg transition-all transform hover:scale-105
                     shadow-lg shadow-green-500/30 hover:shadow-green-500/50"
          >
            <span className="flex items-center gap-2">
              <span className="group-hover:rotate-180 transition-transform duration-500">🔄</span>
              Try Again
            </span>
          </button>
          
          <button
            onClick={handleReload}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 
                     text-white font-bold text-lg transition-all transform hover:scale-105
                     shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50"
          >
            ⟳ Reload Page
          </button>
          
          <a
            href="/games"
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 
                     text-white font-bold text-lg transition-all transform hover:scale-105
                     shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50"
          >
            🏠 Games Hub
          </a>
        </div>
        
        {/* Error digest for support */}
        {error.digest && (
          <p className="mt-8 text-xs text-gray-500 font-mono">
            Error ID: {error.digest}
          </p>
        )}
        
        {/* Dev mode details */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-8 text-left max-w-md mx-auto">
            <summary className="text-sm text-gray-400 cursor-pointer hover:text-gray-300 font-mono text-center">
              🐛 Developer Details
            </summary>
            <div className="mt-3 p-4 bg-black/50 rounded-xl border border-gray-700">
              <p className="text-red-400 font-mono text-sm mb-2">{error.message}</p>
              <pre className="text-xs text-gray-500 overflow-auto max-h-32 font-mono">
                {error.stack}
              </pre>
            </div>
          </details>
        )}
        
        {/* Fun tip */}
        <p className="mt-8 text-sm text-gray-500 italic">
          💡 Pro tip: If this keeps happening, try clearing your browser cache!
        </p>
      </div>
    </div>
  );
}
