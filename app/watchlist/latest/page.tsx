import Link from 'next/link'
import { getLatestWatchlist, getLatestWatchlistDate, getLatestWatchlistItems } from '@/lib/watchlist'
import { WatchlistCard } from '@/components/WatchlistCard'

export const dynamic = 'force-static'

export default function LatestWatchlistPage() {
  const latestDate = getLatestWatchlistDate()
  const watchlist = getLatestWatchlist()
  const items = getLatestWatchlistItems(100) // Get all for full page

  if (!latestDate || !watchlist) {
    return (
      <div className="max-w-4xl">
        <h1 className="text-3xl font-bold text-zinc-100 mb-6">Latest Watchlist</h1>
        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
          <p className="text-zinc-400">No watchlist data available.</p>
          <p className="text-sm text-zinc-500 mt-2">Check back later or generate a new watchlist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">Latest Watchlist</h1>
          <p className="text-zinc-400 mt-1">
            {watchlist.markets.length} markets · {latestDate}
          </p>
        </div>
        <Link
          href="/"
          className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          ← Back to Home
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item, idx) => (
          <WatchlistCard key={idx} item={item} />
        ))}
      </div>
    </div>
  )
}
