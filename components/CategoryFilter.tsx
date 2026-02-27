'use client'

import { FilterCategory, FILTER_CATEGORIES, CATEGORY_LABELS } from '@/lib/watchlist'

interface CategoryFilterProps {
  activeCategory: FilterCategory
  onCategoryChange: (category: FilterCategory) => void
}

export function CategoryFilter({ activeCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {FILTER_CATEGORIES.map((category) => (
        <button
          key={category}
          onClick={() => onCategoryChange(category)}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
            activeCategory === category
              ? 'bg-blue-600 text-white'
              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
          }`}
        >
          {CATEGORY_LABELS[category]}
        </button>
      ))}
    </div>
  )
}
