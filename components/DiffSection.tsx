import Link from 'next/link'
import { DiffItem } from '@/lib/watchlistDiff'

interface DiffSectionProps {
  title: string
  items?: DiffItem[]
  type: string
  date: string
}

function formatChange(value: number | null | undefined, suffix: string = ''): string {
  if (value === undefined || value === null) return ''
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}${suffix}`
}

function formatLiquidity(value: number | null | undefined): string {
  if (value == null) return '—'
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`
  return `$${value.toFixed(0)}`
}

// 生成变化摘要的中文描述
function getChangeSummary(item: DiffItem, type: string): string {
  switch (type) {
    case 'new_entries':
      return '新进入 Watchlist'
    case 'dropped_entries':
      return '已从 Watchlist 剔除'
    case 'score_jumps':
      return `评分变化 ${formatChange(item.score_change, '')}`
    case 'spread_moves':
      return `价差 ${formatChange(item.spread_change, '%')}`
    case 'liquidity_moves':
      return `流动性 ${formatChange(item.liquidity_change_pct, '%')}`
    case 'top_movers':
      const changes: string[] = []
      if (item.score_change) changes.push(`评分${formatChange(item.score_change)}`)
      if (item.spread_change) changes.push(`价差${formatChange(item.spread_change, '%')}`)
      if (item.liquidity_change_pct) changes.push(`流动性${formatChange(item.liquidity_change_pct, '%')}`)
      return changes.join(' · ') || '综合异动'
    default:
      return ''
  }
}

// 获取链接目标
function getLinkUrl(item: DiffItem, type: string, date: string): string | null {
  // 优先使用 item.url
  if (item.url) return item.url
  
  // 对于市场链接，可以使用 market_id 构建 Polymarket URL
  if (item.market_id) {
    return `https://polymarket.com/market/${item.market_id}`
  }
  
  return null
}

export function DiffSection({ title, items, type, date }: DiffSectionProps) {
  // 空数据不渲染
  if (!items || items.length === 0) {
    return null
  }

  // 限制显示数量，保持紧凑
  const displayItems = items.slice(0, 10)
  const hasMore = items.length > 10

  return (
    <section className="mb-6">
      <h2 className="text-lg font-semibold text-zinc-100 mb-3 flex items-center gap-2">
        {title}
        <span className="text-xs font-normal text-zinc-500">({items.length})</span>
      </h2>
      
      <div className="space-y-2">
        {displayItems.map((item, idx) => {
          const linkUrl = getLinkUrl(item, type, date)
          const summary = getChangeSummary(item, type)
          
          const content = (
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 hover:bg-zinc-800/50 transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm text-zinc-100 font-medium truncate">
                    {item.question || '未知市场'}
                  </h3>
                  {summary && (
                    <p className="text-xs text-zinc-400 mt-1">{summary}</p>
                  )}
                </div>
                
                {/* 关键指标 */}
                <div className="flex items-center gap-2 text-xs whitespace-nowrap">
                  {item.score !== undefined && (
                    <span className={`px-2 py-0.5 rounded ${
                      item.score >= 8 ? 'bg-green-400/10 text-green-400' :
                      item.score >= 7 ? 'bg-yellow-400/10 text-yellow-400' :
                      'bg-red-400/10 text-red-400'
                    }`}>
                      {item.score.toFixed(1)}
                    </span>
                  )}
                  {item.liquidity !== undefined && item.liquidity !== null && (
                    <span className="text-zinc-500">{formatLiquidity(item.liquidity)}</span>
                  )}
                </div>
              </div>
            </div>
          )

          // 如果有链接，包装成 Link
          if (linkUrl) {
            return (
              <a
                key={idx}
                href={linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                {content}
              </a>
            )
          }

          // 否则返回内部链接到 watchlist 页面
          return (
            <Link key={idx} href={`/watchlist/${date}`} className="block">
              {content}
            </Link>
          )
        })}
        
        {hasMore && (
          <Link
            href={`/watchlist/diff/${date}`}
            className="block text-center text-xs text-zinc-500 hover:text-zinc-400 py-2"
          >
            查看全部 {items.length} 项 →
          </Link>
        )}
      </div>
    </section>
  )
}
