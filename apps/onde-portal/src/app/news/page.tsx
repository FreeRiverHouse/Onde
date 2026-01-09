export default function News() {
  const articles = [
    { title: "Latest AI Developments", source: "TechCrunch", date: "2026-01-08" },
    { title: "OpenAI Announces New Model", source: "Verge", date: "2026-01-07" },
    { title: "Claude Code Gets New Features", source: "Anthropic Blog", date: "2026-01-06" },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">News</h1>
      <div className="space-y-6">
        {articles.map((a, i) => (
          <div key={i} className="book-card">
            <span className="text-sm opacity-50">{a.date} • {a.source}</span>
            <h2 className="text-xl font-bold mt-2">{a.title}</h2>
          </div>
        ))}
      </div>
    </div>
  )
}
