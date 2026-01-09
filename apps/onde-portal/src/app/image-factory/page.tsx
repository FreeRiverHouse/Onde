'use client'

import { useState } from 'react'
import Image from 'next/image'
import { bookProjects, generatePrompt, type BookProject, type Chapter } from '@/data/book-projects'

export default function ImageFactoryPage() {
  const [selectedBook, setSelectedBook] = useState<BookProject | null>(bookProjects[0] || null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copyPrompt = async (chapter: Chapter) => {
    const prompt = generatePrompt(chapter.scene)
    await navigator.clipboard.writeText(prompt)
    setCopiedId(`${chapter.num}`)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const copyAllPrompts = async () => {
    if (!selectedBook) return
    const allPrompts = selectedBook.chapters
      .map((ch) => `--- Capitolo ${ch.num}: ${ch.title} ---\n${generatePrompt(ch.scene)}`)
      .join('\n\n')
    await navigator.clipboard.writeText(allPrompts)
    setCopiedId('all')
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Image Factory</h1>
        <p className="opacity-70">Genera immagini coerenti per i libri usando la tecnica del reference</p>
      </div>

      {/* Step 1: Seleziona Libro */}
      <div className="bg-white/5 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-bold mb-4 text-onde-gold">1. Seleziona Libro</h2>
        <select
          className="w-full bg-onde-dark border border-onde-gold/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-onde-gold"
          value={selectedBook?.id || ''}
          onChange={(e) => {
            const book = bookProjects.find(b => b.id === e.target.value)
            setSelectedBook(book || null)
          }}
        >
          {bookProjects.map(book => (
            <option key={book.id} value={book.id}>
              {book.title} ({book.status === 'in-progress' ? 'In lavorazione' : book.status === 'images-done' ? 'Immagini complete' : 'Pubblicato'})
            </option>
          ))}
        </select>
      </div>

      {selectedBook && (
        <>
          {/* Step 2: Reference Image */}
          <div className="bg-white/5 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-bold mb-4 text-onde-gold">2. Immagine Reference</h2>
            <div className="flex items-start gap-6">
              <div className="w-48 h-48 bg-white/10 rounded-xl flex items-center justify-center overflow-hidden relative border-2 border-dashed border-onde-gold/30">
                {selectedBook.referenceImage ? (
                  <Image
                    src={selectedBook.referenceImage}
                    alt="Reference"
                    fill
                    className="object-cover"
                    onError={(e) => {
                      // Hide broken images
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                ) : null}
                <div className="absolute inset-0 flex items-center justify-center bg-onde-dark/80">
                  <span className="text-sm opacity-50 text-center px-4">
                    Carica su Grok prima di generare
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm opacity-70 mb-4">
                  <strong>Tecnica:</strong> Carica questa immagine su Grok, poi usa i prompt sotto.
                  Grok manterra lo stesso personaggio in tutte le scene.
                </p>
                <div className="bg-onde-gold/10 rounded-lg p-4 text-sm">
                  <p className="font-bold text-onde-gold mb-2">Come fare:</p>
                  <ol className="list-decimal list-inside space-y-1 opacity-80">
                    <li>Vai su <a href="https://x.com/i/grok" target="_blank" className="text-onde-gold underline">x.com/i/grok</a></li>
                    <li>Clicca "Create Images"</li>
                    <li>Carica l immagine reference (drag & drop)</li>
                    <li>Copia il prompt dal capitolo qui sotto</li>
                    <li>Genera e fai UPSCALE!</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Lista Capitoli */}
          <div className="bg-white/5 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-onde-gold">3. Capitoli & Prompt</h2>
              <button
                onClick={copyAllPrompts}
                className="btn-secondary text-sm py-2 px-4"
              >
                {copiedId === 'all' ? 'Copiati!' : 'Copia Tutti i Prompt'}
              </button>
            </div>

            <div className="space-y-3">
              {selectedBook.chapters.map((chapter) => (
                <div
                  key={chapter.num}
                  className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-onde-gold text-onde-dark text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center">
                          {chapter.num}
                        </span>
                        <h3 className="font-bold">{chapter.title}</h3>
                      </div>
                      <p className="text-sm opacity-70 ml-11">
                        <span className="text-onde-gold">Scena:</span> {chapter.scene}
                      </p>
                    </div>
                    <button
                      onClick={() => copyPrompt(chapter)}
                      className={`px-4 py-2 rounded-lg font-bold text-sm transition whitespace-nowrap ${
                        copiedId === `${chapter.num}`
                          ? 'bg-green-500 text-white'
                          : 'bg-onde-gold text-onde-dark hover:opacity-90'
                      }`}
                    >
                      {copiedId === `${chapter.num}` ? 'Copiato!' : 'Copia Prompt'}
                    </button>
                  </div>

                  {/* Preview del prompt */}
                  <details className="mt-3 ml-11">
                    <summary className="text-xs opacity-50 cursor-pointer hover:opacity-70">
                      Mostra prompt completo
                    </summary>
                    <pre className="mt-2 text-xs bg-black/30 rounded p-3 overflow-x-auto whitespace-pre-wrap">
                      {generatePrompt(chapter.scene)}
                    </pre>
                  </details>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-6 flex gap-4 text-sm opacity-70">
            <span>Capitoli: {selectedBook.chapters.length}</span>
            <span>|</span>
            <span>Immagini da generare: {selectedBook.chapters.length + 1} (+ copertina)</span>
          </div>
        </>
      )}
    </div>
  )
}
