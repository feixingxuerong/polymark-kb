import Link from 'next/link'
import { WatchlistItem } from '@/lib/watchlist'

interface WatchlistCardProps {
  item: WatchlistItem
}

function formatLiquidity(value: number): string {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}k`
  }
  return `$${value}`
}

function formatScore(score: number): { label: string; color: string } {
  if (score >= 8.5) return { label: 'Strong', color: 'text-green-400' }
  if (score >= 7.0) return { label: 'Watch', color: 'text-yellow-400' }
  return { label: 'Risky', color: 'text-red-400' }
}

export function WatchlistCard({ item }: WatchlistCardProps) {
  const { label: scoreLabel, color: scoreColor } = formatScore(item.score)

  const cardContent = (
    <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 hover:bg-zinc-800/50 transition-all cursor-pointer h-full">
      {/* Header: Question + Score */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="text-zinc-100 font-medium text-sm leading-tight flex-1 line-clamp-2">
          {item.question}
        </h3>
        <div className="shrink-0">
          <span className={`text-lg font-bold ${scoreColor}`}>{item.score.toFixed(1)}</span>
        </div>
      </div>

      {/* Reason */}
      <p className="text-zinc-400 text-xs mb-3 line-clamp-2">{item.reason}</p>

      {/* Stats */}
      <div className="flex items-center gap-3 text-xs text-zinc-500">
        <span>Spread: {item.spread_pct}%</span>
        <span>Liqq: {formatLiquidity(item.liquidity)}</span>
        <span>{item.days_to_event}d left</span>
      </div>

      {/* Score Label */}
      <div className="mt-3">
        <span className={`text-xs px-2 py-0.5 rounded ${scoreColor} bg-zinc-800`}>
          {scoreLabel}
        </span>
      </div>
    </div>
  )

  // Link to market URL if available, otherwise show market_id
  if (item.url) {
    return (
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        {cardContent}
      </a>
    )
  }

  return (
    <div className="relative group" title={item.market_id || 'No market URL'}>
      {cardContent}
      {item.market_id && (
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-50 text-xs text-zinc-600">
          {item.market_id.slice(0, 8)}...
        </div>
      )}
    </div>
  )
}
