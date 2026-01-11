// Sistema di raccomandazioni "Se ti e\' piaciuto X, leggi Y"
// Basato su tag, categorie e associazioni manuali

export interface BookRecommendation {
  bookId: string
  relatedBooks: {
    bookId: string
    reason: string // "Stesso autore", "Tema simile", "I lettori hanno apprezzato anche..."
    strength: number // 1-5, quanto e\' forte la correlazione
  }[]
}

// Mappatura delle relazioni tra libri
export const bookRelations: BookRecommendation[] = [
  {
    bookId: 'alice',
    relatedBooks: [
      { bookId: 'wizard-oz', reason: 'Avventura fantastica classica', strength: 5 },
      { bookId: 'peter-rabbit', reason: 'Classico inglese per bambini', strength: 4 },
      { bookId: 'grimm-tales', reason: 'Storie fantastiche', strength: 3 },
    ],
  },
  {
    bookId: 'wizard-oz',
    relatedBooks: [
      { bookId: 'alice', reason: 'Avventura fantastica classica', strength: 5 },
      { bookId: 'jungle-book', reason: 'Viaggio epico con personaggi indimenticabili', strength: 4 },
      { bookId: 'andersen-tales', reason: 'Storie magiche', strength: 3 },
    ],
  },
  {
    bookId: 'meditations',
    relatedBooks: [
      { bookId: 'tao-te-ching', reason: 'Saggezza orientale', strength: 5 },
      { bookId: 'salmo-23', reason: 'Riflessione spirituale', strength: 4 },
    ],
  },
  {
    bookId: 'salmo-23',
    relatedBooks: [
      { bookId: 'meditations', reason: 'Pace interiore', strength: 4 },
      { bookId: 'tao-te-ching', reason: 'Spiritualita\' universale', strength: 4 },
    ],
  },
  {
    bookId: 'aiko',
    relatedBooks: [
      { bookId: 'piccole-rime', reason: 'Per bambini curiosi', strength: 3 },
    ],
  },
  {
    bookId: 'piccole-rime',
    relatedBooks: [
      { bookId: 'andersen-tales', reason: 'Poesia e fantasia', strength: 4 },
      { bookId: 'grimm-tales', reason: 'Tradizione narrativa', strength: 3 },
    ],
  },
  {
    bookId: 'jungle-book',
    relatedBooks: [
      { bookId: 'peter-rabbit', reason: 'Storie di animali', strength: 4 },
      { bookId: 'wizard-oz', reason: 'Avventura classica', strength: 4 },
      { bookId: 'alice', reason: 'Classico della letteratura', strength: 3 },
    ],
  },
  {
    bookId: 'peter-rabbit',
    relatedBooks: [
      { bookId: 'jungle-book', reason: 'Storie di animali', strength: 4 },
      { bookId: 'andersen-tales', reason: 'Racconti per bambini', strength: 4 },
      { bookId: 'alice', reason: 'Classico inglese', strength: 3 },
    ],
  },
  {
    bookId: 'grimm-tales',
    relatedBooks: [
      { bookId: 'andersen-tales', reason: 'Fiabe classiche europee', strength: 5 },
      { bookId: 'alice', reason: 'Storie fantastiche', strength: 3 },
    ],
  },
  {
    bookId: 'andersen-tales',
    relatedBooks: [
      { bookId: 'grimm-tales', reason: 'Fiabe classiche europee', strength: 5 },
      { bookId: 'piccole-rime', reason: 'Tradizione europea', strength: 3 },
    ],
  },
]

// Funzione per ottenere raccomandazioni per un libro
export function getRecommendationsForBook(bookId: string, limit: number = 3): BookRecommendation['relatedBooks'] {
  const relation = bookRelations.find(r => r.bookId === bookId)
  if (!relation) return []
  return relation.relatedBooks
    .sort((a, b) => b.strength - a.strength)
    .slice(0, limit)
}

// Funzione per generare raccomandazioni personalizzate basate sui libri letti
export function getPersonalizedRecommendations(
  readBookIds: string[],
  excludeBookIds: string[] = [],
  limit: number = 5
): { bookId: string; score: number; reasons: string[] }[] {
  const recommendationScores: Map<string, { score: number; reasons: string[] }> = new Map()

  for (const bookId of readBookIds) {
    const relations = getRecommendationsForBook(bookId)
    for (const rel of relations) {
      if (readBookIds.includes(rel.bookId) || excludeBookIds.includes(rel.bookId)) continue

      const existing = recommendationScores.get(rel.bookId) || { score: 0, reasons: [] }
      existing.score += rel.strength
      if (!existing.reasons.includes(rel.reason)) {
        existing.reasons.push(rel.reason)
      }
      recommendationScores.set(rel.bookId, existing)
    }
  }

  return Array.from(recommendationScores.entries())
    .map(([bookId, data]) => ({ bookId, ...data }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}
