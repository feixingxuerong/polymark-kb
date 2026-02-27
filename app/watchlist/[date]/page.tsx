import Link from 'next/link'
import { getWatchlistByDate, getWatchlistItems, getAllWatchlistFiles } from '@/lib/watchlist'
import { WatchlistCard } from '@/components/WatchlistCard'

export const dynamic = 'force-static'

interface PageProps {
  params: Promise<{ date: string }>
}

export async function generateStaticParams() {
  const files = getAllWatchlistFiles()
  return files.map((file) => {
    const basename = file.split(/[/\\]/).pop() || ''
    const match = basename.match(/watchlist-(\d{4}-\d{2}-\d{2})\.json/)
    return { date: match ? match[1] : '' }
  }).filter(p => p.date)
}

export default async function DateWatchlistPage({ params }: PageProps) {
  const { date } = await params
  const watchlist = getWatchlistByDate(date)
  const items = getWatchlistItems(date, 100)

  if (!watchlist) {
    return (
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-zinc-100">Watchlist {date}</h1>
          <Link
            href="/"
            className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
          <p className="text-zinc-400">No watchlist data for {date}.</p>
          <Link
            href="/watchlist/latest"
            className="text-sm text-blue-400 hover:text-blue-300 mt-2 inline-block"
          >
            View latest watchlist →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">Watchlist {date}</h1>
          <p className="text-zinc-400 mt-1">
            {watchlist.items.length} markets
          </p>
        </div>
        <div className="flex gap-4">
          <Link
            href="/watchlist/latest"
            className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Latest →
          </Link>
          <Link
            href="/"
            className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            ← Home
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item, idx) => (
          <WatchlistCard key={idx} item={item} />
        ))}
      </div>
    </div>
  )
}
