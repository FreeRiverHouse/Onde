import { categories } from '../data/books';

interface CategoryFilterProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  bookCounts: Record<string, number>;
}

export default function CategoryFilter({
  selectedCategory,
  onSelectCategory,
  bookCounts,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <button
        onClick={() => onSelectCategory(null)}
        className={`category-pill px-4 py-2 rounded-full text-sm font-medium transition-all ${
          selectedCategory === null
            ? 'bg-gradient-to-r from-onde-terracotta to-onde-rust text-white shadow-lg'
            : 'bg-white text-onde-deep hover:bg-onde-sand/50 border border-onde-sand'
        }`}
      >
        Tutti
        <span className="ml-1 opacity-70">
          ({Object.values(bookCounts).reduce((a, b) => a + b, 0)})
        </span>
      </button>

      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelectCategory(cat.id)}
          className={`category-pill px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
            selectedCategory === cat.id
              ? 'bg-gradient-to-r from-onde-terracotta to-onde-rust text-white shadow-lg'
              : 'bg-white text-onde-deep hover:bg-onde-sand/50 border border-onde-sand'
          }`}
        >
          <span>{cat.icon}</span>
          <span>{cat.name}</span>
          <span className="opacity-70">({bookCounts[cat.id] || 0})</span>
        </button>
      ))}
    </div>
  );
}
