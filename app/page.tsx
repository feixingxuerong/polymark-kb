import Link from 'next/link'
import { getAllDocs, getDocsByCategory, getRecentDocs, getIndexSyncInfo } from '@/lib/docs'
import { getLatestWatchlist, getLatestWatchlistDate, getLatestWatchlistItems, getWeatherActionItems } from '@/lib/watchlist'
import { getLatestWatchlistDiff, getLatestDiffDate } from '@/lib/watchlistDiff'
import { WatchlistCard } from '@/components/WatchlistCard'
import { WatchlistSection } from '@/components/WatchlistSection'
import { formatTimeShort } from '@/lib/time'
import { getIndexChapters } from '@/lib/nav'
import { WatchlistItem } from '@/lib/watchlist'
import { DiffItem } from '@/lib/watchlistDiff'

// Compact diff item card for radar section
function DiffItemCard({ item, type }: { item: DiffItem; type: 'new' | 'mover' }) {
  return (
    <Link
      href="/watchlist/diff/latest"
      className="block p-3 bg-zinc-900/60 border border-zinc-800 rounded-lg hover:bg-zinc-900 hover:border-zinc-700 transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <span className={`text-xs px-1.5 py-0.5 rounded ${
          type === 'new' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
        }`}>
          {type === 'new' ? '新入场' : '异动'}
        </span>
        {item.score_change != null && (
          <span className={`text-xs ${item.score_change > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {item.score_change > 0 ? '+' : ''}{item.score_change.toFixed(1)}
          </span>
        )}
      </div>
      <p className="text-zinc-300 text-sm mt-2 line-clamp-2">{item.question}</p>
    </Link>
  )
}

// Weather action list section (server component)
function WeatherActionSection({ items }: { items: WatchlistItem[] }) {
  if (items.length === 0) return null

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between gap-4 mb-4">
        <h2 className="text-lg font-semibold text-zinc-300">
          <span className="text-blue-400 mr-2">天气预报</span>
          今日行动清单
        </h2>
        <Link
          href="/sources/weather-aviation/latest"
          className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          天气/航空源 →
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {items.map((item, idx) => (
          <WatchlistCard key={idx} item={item} />
        ))}
      </div>
    </section>
  )
}

// Radar summary section (server component)
function RadarSummarySection({ diff, diffDate }: { diff: ReturnType<typeof getLatestWatchlistDiff> | null; diffDate: string | null }) {
  const hasData = diff && (
    (diff.new_entries && diff.new_entries.length > 0) ||
    (diff.top_movers && diff.top_movers.length > 0) ||
    !diff.first_run
  )

  if (!diff || !hasData) {
    return (
      <section className="mb-10">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold text-zinc-300">
            <span className="text-yellow-400 mr-2">异动雷达</span>
            摘要
          </h2>
          <Link
            href="/watchlist/diff/latest"
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            查看详情 →
          </Link>
        </div>
        <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl">
          <p className="text-zinc-500 text-sm">暂无异动数据（首日运行或无变化）</p>
        </div>
      </section>
    )
  }

  const newEntries = diff.new_entries?.slice(0, 5) || []
  const topMovers = diff.top_movers?.slice(0, 5) || []

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between gap-4 mb-4">
        <h2 className="text-lg font-semibold text-zinc-300">
          <span className="text-yellow-400 mr-2">异动雷达</span>
          摘要
        </h2>
        <Link
          href="/watchlist/diff/latest"
          className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          {diffDate} 详情 →
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* New entries */}
        <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl">
          <h3 className="text-sm font-medium text-zinc-400 mb-3">
            新入场 ({newEntries.length})
          </h3>
          <div className="space-y-2">
            {newEntries.length > 0 ? (
              newEntries.map((item, idx) => (
                <DiffItemCard key={idx} item={item} type="new" />
              ))
            ) : (
              <p className="text-zinc-600 text-sm">今日无新入场</p>
            )}
          </div>
        </div>

        {/* Top movers */}
        <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl">
          <h3 className="text-sm font-medium text-zinc-400 mb-3">
            异动项目 ({topMovers.length})
          </h3>
          <div className="space-y-2">
            {topMovers.length > 0 ? (
              topMovers.map((item, idx) => (
                <DiffItemCard key={idx} item={item} type="mover" />
              ))
            ) : (
              <p className="text-zinc-600 text-sm">今日无异动</p>
            )}
          </div>
        </div>
      </div>

      {/* Summary stats */}
      {diff.summary && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-zinc-900/40 border border-zinc-800 rounded-lg text-center">
            <p className="text-xs text-zinc-500">今日总数</p>
            <p className="text-lg font-semibold text-zinc-200">{diff.summary.today_count || 0}</p>
          </div>
          <div className="p-3 bg-zinc-900/40 border border-zinc-800 rounded-lg text-center">
            <p className="text-xs text-zinc-500">新入场</p>
            <p className="text-lg font-semibold text-green-400">{diff.summary.new_count || 0}</p>
          </div>
          <div className="p-3 bg-zinc-900/40 border border-zinc-800 rounded-lg text-center">
            <p className="text-xs text-zinc-500">评分跃升</p>
            <p className="text-lg font-semibold text-yellow-400">{diff.summary.score_jumps_count || 0}</p>
          </div>
          <div className="p-3 bg-zinc-900/40 border border-zinc-800 rounded-lg text-center">
            <p className="text-xs text-zinc-500">离场</p>
            <p className="text-lg font-semibold text-red-400">{diff.summary.dropped_count || 0}</p>
          </div>
        </div>
      )}
    </section>
  )
}

export default function Home() {
  const docs = getAllDocs()
  const categories = getDocsByCategory()
  const chapters = getIndexChapters()
  const recentDocs = getRecentDocs(5)
  const syncInfo = getIndexSyncInfo()

  // Get watchlist data
  const watchlistDate = getLatestWatchlistDate()
  const watchlistItems = getLatestWatchlistItems(20)
  const weatherActionItems = getWeatherActionItems(5)

  // Get diff data
  const diffData = getLatestWatchlistDiff()
  const diffDate = getLatestDiffDate()

  return (
    <div className="max-w-6xl pb-8">
      {/* Header */}
      <section className="mb-8 md:mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-zinc-100 mb-3">Polymarket Knowledge Base</h1>
        <p className="text-lg md:text-xl text-zinc-400">顶尖理论、策略框架与风控体系</p>
        <p className="text-sm text-zinc-600 mt-2">提示：Cmd/Ctrl + K 搜索</p>
      </section>

      {/* Quick Links - Top row */}
      <section className="mb-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          <Link
            href="/docs/index"
            className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors"
          >
            <h3 className="font-semibold text-zinc-100 mb-1">📖 Index</h3>
            <p className="text-sm text-zinc-500">知识库目录</p>
          </Link>
          <Link
            href="/docs/sources"
            className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors"
          >
            <h3 className="font-semibold text-zinc-100 mb-1">🔗 Sources</h3>
            <p className="text-sm text-zinc-500">数据源</p>
          </Link>
          <Link
            href="/sources/weather-aviation/latest"
            className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-blue-700 transition-colors"
          >
            <h3 className="font-semibold text-blue-400 mb-1">🌤️ 天气/航空</h3>
            <p className="text-sm text-zinc-500">气象市场</p>
          </Link>
          <Link
            href="/watchlist/diff/latest"
            className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-yellow-700 transition-colors"
          >
            <h3 className="font-semibold text-yellow-400 mb-1">📡 异动雷达</h3>
            <p className="text-sm text-zinc-500">每日变化</p>
          </Link>
          <Link
            href="/weather/today"
            className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-cyan-700 transition-colors"
          >
            <h3 className="font-semibold text-cyan-400 mb-1">🌀 今日天气</h3>
            <p className="text-sm text-zinc-500">行动+异动+源</p>
          </Link>
        </div>
      </section>

      {/* Weather Action List - Priority section */}
      <WeatherActionSection items={weatherActionItems} />

      {/* Radar Summary */}
      <RadarSummarySection diff={diffData} diffDate={diffDate} />

      {/* Today's Watchlist with filtering */}
      {watchlistDate && watchlistItems.length > 0 && (
        <WatchlistSection 
          initialItems={watchlistItems} 
          watchlistDate={watchlistDate} 
        />
      )}

      {/* Dashboard Stats */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-zinc-300 mb-4">状态仪表盘</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
            <p className="text-sm text-zinc-500 mb-1">文档总数</p>
            <p className="text-2xl font-bold text-zinc-100">{docs.length}</p>
          </div>
          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
            <p className="text-sm text-zinc-500 mb-1">Index 最后更新</p>
            <p className="text-lg font-semibold text-zinc-100">{formatTimeShort(syncInfo.lastUpdated)}</p>
          </div>
          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
            <p className="text-sm text-zinc-500 mb-1">Search Index</p>
            <p className="text-sm font-medium text-zinc-300">{formatTimeShort(syncInfo.generatedAt)}</p>
          </div>
        </div>
      </section>

      {/* Recent Updates */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-zinc-300 mb-4">最近更新</h2>
        <div className="space-y-2">
          {recentDocs.map((doc) => (
            <Link
              key={doc.slug}
              href={`/docs/${doc.slug}`}
              className="block p-3 bg-zinc-900/60 border border-zinc-800 rounded-lg hover:bg-zinc-900 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="text-zinc-200 font-medium">{doc.title}</span>
                  <span className="text-zinc-600 text-sm ml-2">{doc.category}</span>
                </div>
                <span className="text-xs text-zinc-500 shrink-0">
                  {formatTimeShort(doc.mtime)}
                </span>
              </div>
            </Link>
          ))}
          {recentDocs.length === 0 && (
            <p className="text-zinc-500 text-sm">暂无文档</p>
          )}
        </div>
      </section>

      {/* All Docs by Category (collapsed by default) */}
      <details className="mb-10">
        <summary className="cursor-pointer text-lg font-semibold text-zinc-300 mb-4 hover:text-zinc-100">
          所有文档 ({docs.length}) ▸
        </summary>
        <div className="mt-4">
          {Object.entries(categories).map(([category, categoryDocs]) => (
            <div key={category} className="mb-6">
              <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-2">{category}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {categoryDocs.map((doc) => (
                  <Link
                    key={doc.slug}
                    href={`/docs/${doc.slug}`}
                    className="p-3 bg-zinc-900/50 border border-zinc-800/50 rounded-lg hover:bg-zinc-900 hover:border-zinc-800 transition-colors"
                  >
                    <span className="text-zinc-300">{doc.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </details>
    </div>
  )
}
