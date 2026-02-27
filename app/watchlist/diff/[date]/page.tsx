import Link from 'next/link'
import { getWatchlistDiffByDate, getAllDiffFiles, getLatestDiffDate } from '@/lib/watchlistDiff'
import { DiffSection } from '@/components/DiffSection'

export const dynamic = 'force-static'

interface PageProps {
  params: Promise<{ date: string }>
}

export async function generateStaticParams() {
  const files = getAllDiffFiles()
  return files.map((file) => {
    const basename = file.split(/[/\\]/).pop() || ''
    const match = basename.match(/watchlist-diff-(\d{4}-\d{2}-\d{2})\.json/)
    return { date: match ? match[1] : '' }
  }).filter(p => p.date)
}

export default async function DateDiffPage({ params }: PageProps) {
  const { date } = await params
  const diff = getWatchlistDiffByDate(date)
  const latestDate = getLatestDiffDate()

  if (!diff) {
    return (
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-zinc-100">异动 {date}</h1>
          <Link
            href="/watchlist/diff/latest"
            className="text-sm text-zinc-500 hover:text-zinc-300"
          >
            ← 最新
          </Link>
        </div>
        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
          <p className="text-zinc-400">暂无 {date} 的异动数据。</p>
          <Link
            href="/watchlist/diff/latest"
            className="inline-block mt-4 text-sm text-blue-400 hover:text-blue-300"
          >
            查看最新异动 →
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
          <h1 className="text-2xl font-bold text-zinc-100">异动 {date}</h1>
          <Link
            href="/watchlist/diff/latest"
            className="text-sm text-zinc-500 hover:text-zinc-300"
          >
            ← 最新
          </Link>
        </div>
        
        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
          <p className="text-zinc-400">首次运行，暂无历史数据对比。</p>
          <p className="text-sm text-zinc-500 mt-2">
            今日 watchlist 共 {diff.summary?.today_count || 0} 个市场
          </p>
          <Link
            href={`/watchlist/${date}`}
            className="inline-block mt-4 text-sm text-blue-400 hover:text-blue-300"
          >
            查看 {date} 的完整 Watchlist →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">异动 {date}</h1>
          {diff.yesterday_date && (
            <p className="text-sm text-zinc-500 mt-1">对比 {diff.yesterday_date}</p>
          )}
        </div>
        <div className="flex gap-3">
          <Link
            href="/watchlist/diff/latest"
            className="text-sm text-zinc-500 hover:text-zinc-300"
          >
            最新 →
          </Link>
          <Link
            href={`/watchlist/${date}`}
            className="text-sm text-zinc-500 hover:text-zinc-300"
          >
            原始 Watchlist
          </Link>
        </div>
      </div>

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
        <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg">
          <div className="text-xs text-zinc-500">价差异动</div>
          <div className="text-xl font-bold text-purple-400">{diff.summary?.spread_moves_count || 0}</div>
        </div>
        <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg">
          <div className="text-xs text-zinc-500">流动性变化</div>
          <div className="text-xl font-bold text-cyan-400">{diff.summary?.liquidity_moves_count || 0}</div>
        </div>
      </div>

      {/* 异动详情 */}
      <DiffSection title="🔥 热门异动" items={diff.top_movers} type="top_movers" date={date} />
      <DiffSection title="🆕 新增" items={diff.new_entries} type="new_entries" date={date} />
      <DiffSection title="❌ 剔除" items={diff.dropped_entries} type="dropped_entries" date={date} />
      <DiffSection title="📈 评分跃升" items={diff.score_jumps} type="score_jumps" date={date} />
      <DiffSection title="📊 价差异动" items={diff.spread_moves} type="spread_moves" date={date} />
      <DiffSection title="💧 流动性变化" items={diff.liquidity_moves} type="liquidity_moves" date={date} />
    </div>
  )
}
