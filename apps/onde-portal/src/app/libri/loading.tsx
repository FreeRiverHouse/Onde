export default function LibriLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-onde-cream to-white">
      {/* Header skeleton */}
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="h-12 w-64 bg-onde-ocean/10 rounded-xl mx-auto mb-4 animate-pulse" />
          <div className="h-6 w-96 max-w-full bg-onde-ocean/5 rounded-lg mx-auto animate-pulse" />
        </div>
      </div>

      {/* Filters skeleton */}
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <div className="flex flex-wrap gap-2 justify-center">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 w-24 bg-onde-ocean/10 rounded-full animate-pulse" />
          ))}
        </div>
      </div>

      {/* Books grid skeleton */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-onde-ocean/10">
              {/* Cover skeleton */}
              <div className="aspect-[3/4] bg-gradient-to-br from-onde-ocean/10 to-onde-coral/10 animate-pulse flex items-center justify-center">
                <div className="text-4xl opacity-30">📚</div>
              </div>
              
              {/* Info skeleton */}
              <div className="p-4 space-y-3">
                <div className="h-5 w-3/4 bg-onde-ocean/10 rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-onde-ocean/5 rounded animate-pulse" />
                <div className="flex gap-2">
                  <div className="h-6 w-16 bg-onde-coral/20 rounded-full animate-pulse" />
                  <div className="h-6 w-12 bg-green-500/20 rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Loading indicator */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-onde-ocean/10">
        <div className="flex items-center gap-2 text-onde-ocean/70 text-sm">
          <div className="w-4 h-4 border-2 border-onde-coral border-t-transparent rounded-full animate-spin" />
          Loading books...
        </div>
      </div>
    </div>
  )
}
