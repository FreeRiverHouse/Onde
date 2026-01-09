export default function Health() {
  const articles = [
    { title: "Benefits of Carnivore Diet", category: "Nutrition" },
    { title: "Protein and Muscle Growth", category: "Fitness" },
    { title: "Sleep Optimization Tips", category: "Wellness" },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-4">Health</h1>
      <p className="opacity-70 mb-8">Curated health, nutrition, and wellness content</p>
      <div className="grid md:grid-cols-2 gap-6">
        {articles.map((a, i) => (
          <div key={i} className="book-card">
            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">{a.category}</span>
            <h2 className="text-lg font-bold mt-3">{a.title}</h2>
          </div>
        ))}
      </div>
    </div>
  )
}
