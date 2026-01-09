import Link from 'next/link'

// TODO: Fetch dynamically from X API
const profiles = {
  onde: {
    name: 'Onde',
    handle: '@Onde_FRH',
    bio: 'Classici e storie originali. Illustrati ad acquerello.',
    url: 'https://x.com/Onde_FRH',
    followers: '—',
  },
  frh: {
    name: 'FreeRiverHouse',
    handle: '@FreeRiverHouse',
    bio: 'Building tools for creators. AI, publishing, apps.',
    url: 'https://x.com/FreeRiverHouse',
    followers: '—',
  },
}

function XProfileCard({ profile }: { profile: typeof profiles.onde }) {
  return (
    <a
      href={profile.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-2xl p-6 hover:border-[#2dd4bf]/30 hover:bg-white/5 transition-all group"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#2dd4bf]/20 to-onde-gold/20 flex items-center justify-center text-2xl flex-shrink-0">
          🌊
        </div>

        <div className="flex-1 min-w-0">
          {/* Name & Handle */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-white group-hover:text-[#2dd4bf] transition">
              {profile.name}
            </span>
            <svg className="w-4 h-4 text-[#1d9bf0]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z" />
            </svg>
          </div>

          <p className="text-white/40 text-sm mb-2">{profile.handle}</p>

          {/* Bio */}
          <p className="text-white/60 text-sm leading-relaxed">
            {profile.bio}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
        <span className="text-white/30 text-xs">Segui su X</span>
        <span className="text-[#2dd4bf] text-sm group-hover:translate-x-1 transition-transform">→</span>
      </div>
    </a>
  )
}

function CatalogCard() {
  return (
    <Link
      href="/catalogo"
      className="block bg-gradient-to-br from-[#2dd4bf]/10 to-onde-gold/5 border border-[#2dd4bf]/20 rounded-2xl p-6 hover:border-[#2dd4bf]/40 hover:bg-[#2dd4bf]/10 transition-all group"
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="w-14 h-14 rounded-full bg-[#2dd4bf]/20 flex items-center justify-center text-2xl flex-shrink-0">
          📚
        </div>

        <div className="flex-1">
          <h3 className="font-bold text-white group-hover:text-[#2dd4bf] transition mb-1">
            Catalogo
          </h3>
          <p className="text-white/40 text-sm mb-2">1000 titoli</p>
          <p className="text-white/60 text-sm leading-relaxed">
            Classici della letteratura mondiale. Gratuiti, per sempre.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#2dd4bf]/10">
        <span className="text-[#2dd4bf]/50 text-xs">Esplora</span>
        <span className="text-[#2dd4bf] text-sm group-hover:translate-x-1 transition-transform">→</span>
      </div>
    </Link>
  )
}

export default function About() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-light tracking-wide text-white mb-3">
            Onde
          </h1>
          <p className="text-white/40 text-sm tracking-widest uppercase">
            Casa Editrice
          </p>
        </div>

        {/* Cards */}
        <div className="space-y-4">
          <XProfileCard profile={profiles.onde} />
          <XProfileCard profile={profiles.frh} />
          <CatalogCard />
        </div>
      </div>
    </div>
  )
}
