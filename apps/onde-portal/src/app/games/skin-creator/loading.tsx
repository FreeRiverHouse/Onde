export default function SkinCreatorLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-indigo-900">
      {/* Header skeleton */}
      <div className="p-4 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="h-8 w-48 bg-white/10 rounded-lg animate-pulse" />
          <div className="flex gap-2">
            <div className="h-10 w-24 bg-white/10 rounded-lg animate-pulse" />
            <div className="h-10 w-24 bg-white/10 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Canvas area */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              {/* Toolbar skeleton */}
              <div className="flex gap-2 mb-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-10 w-10 bg-white/10 rounded-lg animate-pulse" />
                ))}
              </div>
              
              {/* Canvas skeleton */}
              <div className="aspect-square max-w-md mx-auto bg-white/5 rounded-xl animate-pulse flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">🎨</div>
                  <div className="text-white/40 text-sm">Loading editor...</div>
                </div>
              </div>

              {/* Body parts selector skeleton */}
              <div className="flex justify-center gap-2 mt-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-12 w-16 bg-white/10 rounded-lg animate-pulse" />
                ))}
              </div>
            </div>
          </div>

          {/* 3D Preview skeleton */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <div className="h-6 w-32 bg-white/10 rounded mb-4 animate-pulse" />
              <div className="aspect-square bg-white/5 rounded-xl animate-pulse flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">🧊</div>
                  <div className="text-white/40 text-sm">Loading 3D preview...</div>
                </div>
              </div>
              
              {/* Action buttons skeleton */}
              <div className="mt-4 space-y-2">
                <div className="h-12 w-full bg-purple-500/20 rounded-xl animate-pulse" />
                <div className="h-10 w-full bg-white/10 rounded-xl animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading indicator */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
        <div className="flex items-center gap-2 text-white/70 text-sm">
          <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
          Loading Skin Creator...
        </div>
      </div>
    </div>
  )
}
