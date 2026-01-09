export default function Tech() {
  const articles = [
    { title: "Vibe Coding: The Future of Development", category: "AI" },
    { title: "Best Claude Code Workflows", category: "Tools" },
    { title: "Building Apps in One Day", category: "Tutorial" },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-4">Tech</h1>
      <p className="opacity-70 mb-8">Coding, AI, and vibe development</p>
      <div className="grid md:grid-cols-2 gap-6">
        {articles.map((a, i) => (
          <div key={i} className="book-card">
            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">{a.category}</span>
            <h2 className="text-lg font-bold mt-3">{a.title}</h2>
          </div>
        ))}
      </div>
    </div>
  )
}
