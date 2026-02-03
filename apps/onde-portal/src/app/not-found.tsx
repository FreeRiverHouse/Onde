'use client'

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-100 via-blue-50 to-green-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 text-6xl animate-bounce" style={{ animationDelay: '0s' }}>🌊</div>
        <div className="absolute top-20 right-20 text-5xl animate-bounce" style={{ animationDelay: '0.5s' }}>☁️</div>
        <div className="absolute bottom-20 left-20 text-4xl animate-bounce" style={{ animationDelay: '1s' }}>🐚</div>
        <div className="absolute bottom-10 right-10 text-6xl animate-bounce" style={{ animationDelay: '0.3s' }}>🏝️</div>
        <div className="absolute top-1/3 left-5 text-3xl animate-pulse">✨</div>
        <div className="absolute top-1/2 right-10 text-3xl animate-pulse" style={{ animationDelay: '0.7s' }}>✨</div>
      </div>
      
      <div className="text-center px-4 relative z-10">
        {/* Fun 404 with emoji */}
        <div className="mb-6">
          <span className="text-8xl md:text-9xl font-black bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 bg-clip-text text-transparent drop-shadow-lg">
            4🌀4
          </span>
        </div>
        
        {/* Lost at sea message */}
        <div className="text-6xl mb-4 animate-float">🚣</div>
        
        <h2 className="text-2xl md:text-3xl font-bold text-gray-700 mb-4">
          Oops! Ti sei perso nell&apos;oceano! 🌊
        </h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto text-lg">
          La pagina che cerchi non esiste o è stata portata via dalle onde...
        </p>
        
        {/* Navigation options */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl
                       bg-gradient-to-r from-cyan-500 to-blue-600
                       text-white font-bold text-lg shadow-xl hover:scale-105 
                       hover:shadow-2xl transition-all duration-300"
          >
            🏠 Torna alla Home
          </Link>
          <Link
            href="/games"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl
                       bg-gradient-to-r from-purple-500 to-pink-500
                       text-white font-bold text-lg shadow-xl hover:scale-105 
                       hover:shadow-2xl transition-all duration-300"
          >
            🎮 Gioca un po&apos;!
          </Link>
        </div>
        
        {/* Fun fact */}
        <p className="mt-12 text-sm text-gray-400">
          💡 Sapevi che i pesci non si perdono mai? Seguono le correnti! 🐠
        </p>
      </div>
      
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(-5deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
