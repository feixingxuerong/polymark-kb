import Link from 'next/link'
import { getLatestDiffDate, getLatestWatchlistDiff, getAvailableDiffDates } from '@/lib/watchlistDiff'
import { DiffSection } from '@/components/DiffSection'

export const dynamic = 'force-static'

export default function LatestDiffPage() {
  const latestDate = getLatestDiffDate()
  const diff = getLatestWatchlistDiff()
  const availableDates = getAvailableDiffDates()

  if (!latestDate || !diff) {
    return (
      <div className="max-w-4xl">
        <h1 className="text-2xl font-bold text-zinc-100 mb-4">异动雷达</h1>
        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
          <p className="text-zinc-400">暂无异动数据。</p>
          <p className="text-sm text-zinc-500 mt-2">等待生成 watchlist-diff 数据后刷新。</p>
          <Link
            href="/watchlist/latest"
            className="inline-block mt-4 text-sm text-blue-400 hover:text-blue-300"
          >
            ← 返回最新 Watchlist
          </Link>
        </div>
      </div>
    )
  }

  // 如果是首次运行（无历史对比）
  if (diff.first_run) {
    return (
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-zinc-100">异动雷达</h1>
          <Link
            href="/watchlist/latest"
            className="text-sm text-zinc-500 hover:text-zinc-300"
          >
            ← Watchlist
          </Link>
        </div>
        
        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
          <p className="text-zinc-400">首次运行，暂无历史数据对比。</p>
          <p className="text-sm text-zinc-500 mt-2">
            今日 watchlist 共 {diff.summary?.today_count || 0} 个市场
          </p>
          <Link
            href={`/watchlist/diff/${latestDate}`}
            className="inline-block mt-4 text-sm text-blue-400 hover:text-blue-300"
          >
            查看详情 →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-zinc-100">异动雷达</h1>
        <div className="flex gap-3">
          <Link
            href="/watchlist/latest"
            className="text-sm text-zinc-500 hover:text-zinc-300"
          >
            Watchlist
          </Link>
        </div>
      </div>

      {/* 日期选择器 */}
      {availableDates.length > 1 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {availableDates.slice(0, 7).map((date) => (
            <Link
              key={date}
              href={`/watchlist/diff/${date}`}
              className={`text-xs px-3 py-1.5 rounded-lg whitespace-nowrap ${
                date === latestDate
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {date.slice(5)}
            </Link>
          ))}
        </div>
      )}

      {/* 摘要卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg">
          <div className="text-xs text-zinc-500">今日市场</div>
          <div className="text-xl font-bold text-zinc-100">{diff.summary?.today_count || 0}</div>
        </div>
        <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg">
          <div className="text-xs text-zinc-500">新增</div>
          <div className="text-xl font-bold text-green-400">{diff.summary?.new_count || 0}</div>
        </div>
        <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg">
          <div className="text-xs text-zinc-500">剔除</div>
          <div className="text-xl font-bold text-red-400">{diff.summary?.dropped_count || 0}</div>
        </div>
        <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg">
          <div className="text-xs text-zinc-500">评分波动</div>
          <div className="text-xl font-bold text-yellow-400">{diff.summary?.score_jumps_count || 0}</div>
        </div>
      </div>

      {/* 异动详情 */}
      <DiffSection title="🔥 热门异动" items={diff.top_movers} type="top_movers" date={latestDate} />
      <DiffSection title="🆕 新增" items={diff.new_entries} type="new_entries" date={latestDate} />
      <DiffSection title="❌ 剔除" items={diff.dropped_entries} type="dropped_entries" date={latestDate} />
      <DiffSection title="📈 评分跃升" items={diff.score_jumps} type="score_jumps" date={latestDate} />
      <DiffSection title="📊 价差异动" items={diff.spread_moves} type="spread_moves" date={latestDate} />
      <DiffSection title="💧 流动性变化" items={diff.liquidity_moves} type="liquidity_moves" date={latestDate} />
    </div>
  )
}
