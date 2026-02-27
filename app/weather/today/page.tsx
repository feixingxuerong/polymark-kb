import Link from 'next/link'
import { getWeatherActionItems, WatchlistItem } from '@/lib/watchlist'
import { getLatestWatchlistDiff, DiffItem } from '@/lib/watchlistDiff'
import { getLatestWeatherAviation, AviationSource } from '@/lib/weatherAviationSources'
import { SourceCard } from '@/components/SourceCard'
import { formatTimeShort } from '@/lib/time'

// =====================
// 行动清单卡片组件
// =====================
function ActionItemCard({ item, rank }: { item: WatchlistItem; rank: number }) {
  // 评分徽章颜色
  const scoreColor = item.score >= 70 ? 'bg-green-500/20 text-green-400' 
    : item.score >= 50 ? 'bg-yellow-500/20 text-yellow-400' 
    : 'bg-zinc-700/20 text-zinc-400'

  return (
    <Link
      href="/watchlist/latest"
      className="block p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl hover:bg-zinc-900 hover:border-blue-500/50 transition-all group"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className={`text-xs px-1.5 py-0.5 rounded ${scoreColor}`}>
          #{rank} {item.score?.toFixed(0)}
        </span>
        {item.days_to_event != null && (
          <span className="text-xs text-zinc-500 shrink-0">
            {item.days_to_event < 1 
              ? `${Math.round(item.days_to_event * 24)}h` 
              : `${item.days_to_event.toFixed(0)}天`}
          </span>
        )}
      </div>
      <p className="text-zinc-200 text-sm font-medium line-clamp-2 group-hover:text-blue-300 transition-colors">
        {item.question}
      </p>
      {item.reason && (
        <p className="text-zinc-500 text-xs mt-1 line-clamp-1">{item.reason}</p>
      )}
      {item.url && (
        <div className="mt-2 pt-2 border-t border-zinc-800">
          <span className="text-xs text-blue-400">查看市场 →</span>
        </div>
      )}
    </Link>
  )
}

// =====================
// 异动雷达卡片组件
// =====================
function DiffItemCard({ item, type }: { item: DiffItem; type: 'new' | 'mover' }) {
  return (
    <Link
      href="/watchlist/diff/latest"
      className="block p-2.5 bg-zinc-900/60 border border-zinc-800 rounded-lg hover:bg-zinc-900 hover:border-zinc-700 transition-colors"
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className={`text-[10px] px-1.5 py-0.5 rounded ${
          type === 'new' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
        }`}>
          {type === 'new' ? '新入场' : '异动'}
        </span>
        {item.score_change != null && (
          <span className={`text-xs ${item.score_change > 0 ? 'text-green-400' : item.score_change < 0 ? 'text-red-400' : 'text-zinc-500'}`}>
            {item.score_change > 0 ? '+' : ''}{item.score_change?.toFixed(1)}
          </span>
        )}
      </div>
      <p className="text-zinc-300 text-xs line-clamp-2">{item.question}</p>
    </Link>
  )
}

// =====================
// 今日天气行动清单区块
// =====================
function WeatherActionSection({ items, date }: { items: WatchlistItem[]; date: string | null }) {
  return (
    <section className="mb-6">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="text-base font-semibold text-zinc-200">
          <span className="text-blue-400 mr-1.5">🌤️</span>
          今日天气行动清单
        </h2>
        <Link
          href="/watchlist/latest"
          className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
        >
          查看全部 →
        </Link>
      </div>
      {items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-2">
          {items.map((item, idx) => (
            <ActionItemCard key={idx} item={item} rank={idx + 1} />
          ))}
        </div>
      ) : (
        <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl">
          <p className="text-zinc-500 text-sm">暂无天气/航空行动项</p>
        </div>
      )}
    </section>
  )
}

// =====================
// 异动雷达摘要区块
// =====================
function RadarSummarySection({ diff }: { diff: ReturnType<typeof getLatestWatchlistDiff> | null }) {
  const hasData = diff && (
    (diff.new_entries && diff.new_entries.length > 0) ||
    (diff.top_movers && diff.top_movers.length > 0) ||
    !diff.first_run
  )

  const newEntries = diff?.new_entries?.slice(0, 5) || []
  const topMovers = diff?.top_movers?.slice(0, 5) || []

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="text-base font-semibold text-zinc-200">
          <span className="text-yellow-400 mr-1.5">📡</span>
          异动雷达摘要
        </h2>
        <Link
          href="/watchlist/diff/latest"
          className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
        >
          详情 →
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* 新入场区块 */}
        <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl">
          <h3 className="text-xs font-medium text-zinc-400 mb-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
            新入场 ({newEntries.length})
          </h3>
          <div className="space-y-1.5">
            {newEntries.length > 0 ? (
              newEntries.map((item, idx) => (
                <DiffItemCard key={idx} item={item} type="new" />
              ))
            ) : (
              <p className="text-zinc-600 text-xs py-2">今日无新入场</p>
            )}
          </div>
        </div>

        {/* 异动项目区块 */}
        <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl">
          <h3 className="text-xs font-medium text-zinc-400 mb-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
            异动项目 ({topMovers.length})
          </h3>
          <div className="space-y-1.5">
            {topMovers.length > 0 ? (
              topMovers.map((item, idx) => (
                <DiffItemCard key={idx} item={item} type="mover" />
              ))
            ) : (
              <p className="text-zinc-600 text-xs py-2">今日无异动</p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

// =====================
// 数据源快览区块
// =====================
function SourcesSection({ sources, generatedAt }: { sources: AviationSource[]; generatedAt: string }) {
  // 按 station_id 分组去重
  const uniqueStations = sources.reduce((acc, source) => {
    const key = source.station_id || source.icao || source.iata || source.station_name
    if (!acc.has(key)) {
      acc.set(key, source)
    }
    return acc
  }, new Map<string, AviationSource>())

  const stationSources = Array.from(uniqueStations.values()).slice(0, 6)

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="text-base font-semibold text-zinc-200">
          <span className="text-purple-400 mr-1.5">📡</span>
          数据源快览
        </h2>
        <Link
          href="/sources/weather-aviation/latest"
          className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
        >
          全部站点 →
        </Link>
      </div>
      
      {/* 更新时间提示 */}
      <div className="text-xs text-zinc-500 mb-3 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
        最近更新: {formatTimeShort(generatedAt)}
      </div>

      {/* 站点卡片网格 */}
      {stationSources.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {stationSources.map((source, idx) => (
            <SourceCard key={idx} source={source} />
          ))}
        </div>
      ) : (
        <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl">
          <p className="text-zinc-500 text-sm">暂无数据源信息</p>
        </div>
      )}
    </section>
  )
}

// =====================
// 主页面组件
// =====================
export default function WeatherTodayPage() {
  // 获取天气行动清单
  const actionItems = getWeatherActionItems(5)
  
  // 获取异动数据
  const diffData = getLatestWatchlistDiff()
  
  // 获取数据源信息
  const sourcesData = getLatestWeatherAviation()
  const sources = sourcesData?.sources || []
  const sourcesGeneratedAt = sourcesData?.generatedAt || new Date().toISOString()

  return (
    <div className="max-w-6xl pb-8">
      {/* 页面头部 */}
      <header className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Link
            href="/"
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            ← 返回首页
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-zinc-100">
          🌤️ 今日天气研究面板
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          一屏掌握天气/航空市场机会
        </p>
      </header>

      {/* 快捷导航 */}
      <section className="mb-6">
        <div className="grid grid-cols-3 gap-2">
          <Link
            href="/watchlist/latest"
            className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-blue-600 transition-colors text-center"
          >
            <span className="text-blue-400 text-lg">📋</span>
            <p className="text-xs text-zinc-400 mt-1">观察清单</p>
          </Link>
          <Link
            href="/watchlist/diff/latest"
            className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-yellow-600 transition-colors text-center"
          >
            <span className="text-yellow-400 text-lg">📡</span>
            <p className="text-xs text-zinc-400 mt-1">异动雷达</p>
          </Link>
          <Link
            href="/sources/weather-aviation/latest"
            className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-purple-600 transition-colors text-center"
          >
            <span className="text-purple-400 text-lg">🔗</span>
            <p className="text-xs text-zinc-400 mt-1">数据源</p>
          </Link>
        </div>
      </section>

      {/* 今日天气行动清单 */}
      <WeatherActionSection items={actionItems} date={null} />

      {/* 异动雷达摘要 */}
      <RadarSummarySection diff={diffData} />

      {/* 数据源快览 */}
      <SourcesSection sources={sources} generatedAt={sourcesGeneratedAt} />
    </div>
  )
}
