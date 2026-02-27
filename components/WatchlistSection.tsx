'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FilterCategory, FILTER_CATEGORIES, CATEGORY_LABELS, detectCategoryClient, SimpleWatchlistItem } from '@/lib/constants'
import { WatchlistCard } from '@/components/WatchlistCard'

interface WatchlistSectionProps {
  initialItems: SimpleWatchlistItem[]
  watchlistDate: string
}

// Category filter buttons component
function CategoryFilter({ activeCategory, onCategoryChange }: { 
  activeCategory: FilterCategory
  onCategoryChange: (category: FilterCategory) => void 
}) {
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

export function WatchlistSection({ initialItems, watchlistDate }: WatchlistSectionProps) {
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('all')

  // Filter items based on category
  const filteredItems = activeCategory === 'all' 
    ? initialItems 
    : initialItems.filter(item => detectCategoryClient(item) === activeCategory)

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between gap-4 mb-4">
        <h2 className="text-lg font-semibold text-zinc-300">今日 Watchlist</h2>
        <div className="flex gap-3">
          <Link
            href={`/watchlist/${watchlistDate}`}
            className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            {watchlistDate} →
          </Link>
          <Link
            href="/watchlist/latest"
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            查看全部 →
          </Link>
        </div>
      </div>
      
      {/* Category filter */}
      <CategoryFilter 
        activeCategory={activeCategory} 
        onCategoryChange={setActiveCategory} 
      />

      {/* Watchlist items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredItems.slice(0, 12).map((item, idx) => (
          <WatchlistCard key={idx} item={item as any} />
        ))}
      </div>
      
      {filteredItems.length === 0 && (
        <p className="text-zinc-500 text-sm">暂无符合条件的项目</p>
      )}
    </section>
  )
}
