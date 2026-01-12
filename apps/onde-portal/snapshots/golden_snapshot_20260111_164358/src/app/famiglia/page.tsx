'use client'

import { useState, useEffect } from 'react'

interface Profile {
  id: string
  name: string
  avatarEmoji: string
  age?: number
  isChild: boolean
  createdAt: string
}

interface ReadingStats {
  booksStarted: number
  booksCompleted: number
  chaptersRead: number
  lastReadAt: string | null
}

export default function Famiglia() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [avatarOptions, setAvatarOptions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newProfile, setNewProfile] = useState({ name: '', avatarEmoji: '', age: '' })
  const [error, setError] = useState('')
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)
  const [profileStats, setProfileStats] = useState<ReadingStats | null>(null)

  useEffect(() => {
    fetchProfiles()
  }, [])

  async function fetchProfiles() {
    try {
      const res = await fetch('/api/family/profiles')
      const data = await res.json()

      if (res.ok) {
        setProfiles(data.profiles)
        setAvatarOptions(data.avatarOptions || [])
      } else if (res.status === 401) {
        window.location.href = '/account'
      }
    } catch (e) {
      console.error('Error fetching profiles:', e)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddProfile(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    try {
      const res = await fetch('/api/family/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProfile.name,
          avatarEmoji: newProfile.avatarEmoji || avatarOptions[0],
          age: newProfile.age ? parseInt(newProfile.age) : undefined
        })
      })

      const data = await res.json()

      if (res.ok) {
        setProfiles([...profiles, data.profile])
        setNewProfile({ name: '', avatarEmoji: '', age: '' })
        setShowAddForm(false)
      } else {
        setError(data.error)
      }
    } catch (e) {
      setError('Errore di connessione')
      console.error(e)
    }
  }

  async function handleSelectProfile(profile: Profile) {
    setSelectedProfile(profile)

    // Fetch stats for this profile
    try {
      const res = await fetch(`/api/family/profiles/${profile.id}`)
      const data = await res.json()
      if (res.ok) {
        setProfileStats(data.stats)
      }
    } catch (e) {
      console.error('Error fetching profile stats:', e)
    }
  }

  async function handleDeleteProfile(profileId: string) {
    if (!confirm('Sei sicuro di voler eliminare questo profilo?')) {
      return
    }

    try {
      const res = await fetch(`/api/family/profiles/${profileId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        setProfiles(profiles.filter(p => p.id !== profileId))
        setSelectedProfile(null)
      }
    } catch (e) {
      console.error('Error deleting profile:', e)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse">
          <div className="h-10 bg-white/10 rounded mb-8 w-1/3"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square bg-white/10 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Profili Famiglia</h1>

      {/* Profile grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {profiles.map((profile) => (
          <button
            key={profile.id}
            onClick={() => handleSelectProfile(profile)}
            className={`aspect-square bg-white/5 rounded-2xl p-4 flex flex-col items-center justify-center hover:bg-white/10 transition-colors border-2 ${
              selectedProfile?.id === profile.id
                ? 'border-onde-gold'
                : 'border-transparent'
            }`}
          >
            <div className="text-5xl mb-3">{profile.avatarEmoji}</div>
            <div className="font-bold text-center">{profile.name}</div>
            {profile.age && (
              <div className="text-sm opacity-60">{profile.age} anni</div>
            )}
            {!profile.isChild && (
              <div className="text-xs text-onde-gold mt-1">Genitore</div>
            )}
          </button>
        ))}

        {/* Add profile button */}
        {profiles.length < 5 && (
          <button
            onClick={() => setShowAddForm(true)}
            className="aspect-square bg-white/5 rounded-2xl p-4 flex flex-col items-center justify-center hover:bg-white/10 transition-colors border-2 border-dashed border-white/20"
          >
            <div className="text-4xl mb-2 opacity-60">+</div>
            <div className="text-sm opacity-60">Aggiungi profilo</div>
          </button>
        )}
      </div>

      {/* Selected profile details */}
      {selectedProfile && (
        <div className="bg-white/5 rounded-2xl p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="text-6xl">{selectedProfile.avatarEmoji}</div>
              <div>
                <h2 className="text-2xl font-bold">{selectedProfile.name}</h2>
                {selectedProfile.age && (
                  <p className="opacity-60">{selectedProfile.age} anni</p>
                )}
                <p className="text-sm opacity-40">
                  {selectedProfile.isChild ? 'Profilo bambino' : 'Profilo genitore'}
                </p>
              </div>
            </div>

            {selectedProfile.isChild && (
              <button
                onClick={() => handleDeleteProfile(selectedProfile.id)}
                className="text-red-400 hover:text-red-300 text-sm"
              >
                Elimina profilo
              </button>
            )}
          </div>

          {/* Reading stats */}
          {profileStats && (
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-onde-gold">
                  {profileStats.booksStarted}
                </div>
                <div className="text-sm opacity-60">Libri iniziati</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-onde-gold">
                  {profileStats.booksCompleted}
                </div>
                <div className="text-sm opacity-60">Libri completati</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-onde-gold">
                  {profileStats.chaptersRead}
                </div>
                <div className="text-sm opacity-60">Capitoli letti</div>
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <a
              href="/libreria"
              className="inline-block bg-onde-gold text-black font-bold px-6 py-3 rounded-lg hover:bg-onde-gold/80"
            >
              Vai alla Libreria
            </a>
          </div>
        </div>
      )}

      {/* Add profile form modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-onde-dark rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">Nuovo Profilo Bambino</h2>

            {error && (
              <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleAddProfile}>
              <div className="mb-4">
                <label className="block text-sm mb-2 opacity-60">Nome</label>
                <input
                  type="text"
                  value={newProfile.name}
                  onChange={(e) => setNewProfile({ ...newProfile, name: e.target.value })}
                  className="w-full bg-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-onde-gold"
                  placeholder="Nome del bambino"
                  required
                  maxLength={50}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm mb-2 opacity-60">Eta (opzionale)</label>
                <input
                  type="number"
                  value={newProfile.age}
                  onChange={(e) => setNewProfile({ ...newProfile, age: e.target.value })}
                  className="w-full bg-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-onde-gold"
                  placeholder="Anni"
                  min={1}
                  max={18}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm mb-2 opacity-60">Avatar</label>
                <div className="grid grid-cols-5 gap-2">
                  {avatarOptions.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewProfile({ ...newProfile, avatarEmoji: emoji })}
                      className={`text-3xl p-2 rounded-lg ${
                        newProfile.avatarEmoji === emoji
                          ? 'bg-onde-gold/30 ring-2 ring-onde-gold'
                          : 'bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false)
                    setNewProfile({ name: '', avatarEmoji: '', age: '' })
                    setError('')
                  }}
                  className="flex-1 bg-white/10 font-bold py-3 rounded-lg hover:bg-white/20"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-onde-gold text-black font-bold py-3 rounded-lg hover:bg-onde-gold/80"
                >
                  Crea Profilo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Info box */}
      <div className="bg-white/5 rounded-xl p-6 text-center opacity-60">
        <p className="mb-2">Ogni famiglia puo avere fino a 5 profili.</p>
        <p className="text-sm">
          I libri acquistati sono condivisi tra tutti i profili della famiglia.
          <br />
          Il progresso di lettura e salvato separatamente per ogni profilo.
        </p>
      </div>
    </div>
  )
}
