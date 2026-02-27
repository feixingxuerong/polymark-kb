import Link from 'next/link'
import { WatchlistItem } from '@/lib/watchlist'
import { translateWeatherQuestion } from '@/lib/translate'

interface WatchlistCardProps {
  item: WatchlistItem
}

// 中文化字段标签
const FIELD_LABELS = {
  spread: '价差',
  liquidity: '流动性',
  daysLeft: '剩余',
  reason: '核心理由',
  score: '评分',
  action: '行动',
  entryPlan: '入场计划',
  monitorSources: '监控源',
  keyRisks: '关键风险',
}

// Action 中文徽章映射
const ACTION_MAP: Record<string, { label: string; color: string; bg: string }> = {
  tracking: { label: '跟踪', color: 'text-blue-400', bg: 'bg-blue-400/10' },
  waiting: { label: '等待', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  considering: { label: '考虑', color: 'text-purple-400', bg: 'bg-purple-400/10' },
  avoid: { label: '避免', color: 'text-red-400', bg: 'bg-red-400/10' },
}

// Score 中文映射
const SCORE_MAP: Record<string, { label: string; color: string; bg: string }> = {
  high: { label: '强信号', color: 'text-green-400', bg: 'bg-green-400/10' },
  watch: { label: '观察', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  risky: { label: '高风险', color: 'text-red-400', bg: 'bg-red-400/10' },
}

function formatLiquidity(value: number | null): string {
  if (value == null || !Number.isFinite(value)) return '—'
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`
  return `$${value.toFixed(0)}`
}

function formatDaysToEvent(days: number | null): string | null {
  if (days == null || !Number.isFinite(days)) return null
  if (days <= 0) return '已到期'
  if (days < 1) return '今天'
  if (days < 7) return `${Math.round(days)}天后`
  if (days < 30) return `${Math.round(days / 7)}周后`
  return `${Math.round(days / 30)}月后`
}

function getScoreLevel(score: number): 'high' | 'watch' | 'risky' {
  if (score >= 8.5) return 'high'
  if (score >= 7.0) return 'watch'
  return 'risky'
}

// 渲染可能存在的可选字段（action, monitor_sources, key_risks）
function OptionalFields({ item }: { item: WatchlistItem & { action?: string; monitor_sources?: string[]; key_risks?: string[]; entry_plan?: string } }) {
  const hasOptionalFields = item.action || item.monitor_sources?.length || item.key_risks?.length || item.entry_plan
  
  if (!hasOptionalFields) return null

  return (
    <div className="mt-3 pt-3 border-t border-zinc-800 space-y-2">
      {/* Action 徽章 */}
      {item.action && ACTION_MAP[item.action.toLowerCase()] && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">{FIELD_LABELS.action}:</span>
          <span className={`text-xs px-2 py-0.5 rounded ${ACTION_MAP[item.action.toLowerCase()].bg} ${ACTION_MAP[item.action.toLowerCase()].color}`}>
            {ACTION_MAP[item.action.toLowerCase()].label}
          </span>
        </div>
      )}

      {/* 入场计划 */}
      {item.entry_plan && (
        <div className="text-xs">
          <span className="text-zinc-500">{FIELD_LABELS.entryPlan}: </span>
          <span className="text-zinc-300">{item.entry_plan}</span>
        </div>
      )}

      {/* 监控源 - 紧凑折叠列表 */}
      {item.monitor_sources && item.monitor_sources.length > 0 && (
        <details className="text-xs">
          <summary className="cursor-pointer text-zinc-500 hover:text-zinc-400">
            {FIELD_LABELS.monitorSources}: {item.monitor_sources.length} 个
          </summary>
          <ul className="mt-1 ml-2 space-y-1 text-zinc-400">
            {item.monitor_sources.slice(0, 3).map((src, i) => (
              <li key={i} className="truncate">• {src}</li>
            ))}
            {item.monitor_sources.length > 3 && (
              <li className="text-zinc-600">+{item.monitor_sources.length - 3} 更多</li>
            )}
          </ul>
        </details>
      )}

      {/* 关键风险 - 紧凑折叠列表 */}
      {item.key_risks && item.key_risks.length > 0 && (
        <details className="text-xs">
          <summary className="cursor-pointer text-zinc-500 hover:text-zinc-400">
            {FIELD_LABELS.keyRisks}: {item.key_risks.length} 个
          </summary>
          <ul className="mt-1 ml-2 space-y-1 text-zinc-400">
            {item.key_risks.slice(0, 3).map((risk, i) => (
              <li key={i} className="truncate">⚠️ {risk}</li>
            ))}
            {item.key_risks.length > 3 && (
              <li className="text-zinc-600">+{item.key_risks.length - 3} 更多</li>
            )}
          </ul>
        </details>
      )}
    </div>
  )
}

export function WatchlistCard({ item }: WatchlistCardProps) {
  // 扩展类型以支持可选字段
  const extItem = item as WatchlistItem & { action?: string; monitor_sources?: string[]; key_risks?: string[]; entry_plan?: string }
  
  const scoreLevel = getScoreLevel(extItem.score)
  const { label: scoreLabel, color: scoreColor, bg: scoreBg } = SCORE_MAP[scoreLevel]
  const daysText = formatDaysToEvent(extItem.days_to_event)

  const cardContent = (
    <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 hover:bg-zinc-800/50 transition-all cursor-pointer h-full flex flex-col">
      {/* 标题/问题置顶 */}
      <div className="mb-3">
        <h3 className="text-zinc-100 font-medium text-sm leading-tight line-clamp-2">
          {extItem.question || '未知问题'}
        </h3>
        {/* 中文翻译行 */}
        {(() => {
          const cn = translateWeatherQuestion(extItem.question)
          return cn ? (
            <p className="text-zinc-400 text-xs mt-1.5 leading-tight">
              {cn}
            </p>
          ) : null
        })()}
      </div>

      {/* 核心理由 */}
      {extItem.reason && (
        <p className="text-zinc-400 text-xs mb-3 line-clamp-2">{extItem.reason}</p>
      )}

      {/* 关键指标行 */}
      <div className="flex items-center gap-3 text-xs text-zinc-500 flex-wrap mb-2">
        {extItem.spread_pct != null && extItem.spread_pct > 0 && (
          <span>
            {FIELD_LABELS.spread}: {extItem.spread_pct.toFixed(1)}%
          </span>
        )}
        {extItem.liquidity != null && (
          <span>{FIELD_LABELS.liquidity}: {formatLiquidity(extItem.liquidity)}</span>
        )}
        {daysText && (
          <span className="text-zinc-400">{FIELD_LABELS.daysLeft}: {daysText}</span>
        )}
      </div>

      {/* 评分徽章 */}
      <div className="flex items-center justify-between mt-auto">
        <span className={`text-xs px-2 py-0.5 rounded ${scoreBg} ${scoreColor}`}>
          {scoreLabel} {Number.isFinite(extItem.score) ? extItem.score.toFixed(1) : '—'}
        </span>
      </div>

      {/* 可选字段 (action, monitor_sources, key_risks, entry_plan) */}
      <OptionalFields item={extItem} />
    </div>
  )

  // Link to detail page if we have a slug, otherwise use external URL
  const detailSlug = extItem.slug || extItem.market_id
  if (detailSlug) {
    return (
      <Link
        href={`/market/${detailSlug}`}
        className="block"
      >
        {cardContent}
      </Link>
    )
  }

  // Fallback to external Polymarket URL
  if (extItem.url) {
    return (
      <a
        href={extItem.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        {cardContent}
      </a>
    )
  }

  return (
    <div className="relative group" title={extItem.market_id || 'No market URL'}>
      {cardContent}
      {extItem.market_id && (
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-50 text-xs text-zinc-600">
          {extItem.market_id.slice(0, 8)}...
        </div>
      )}
    </div>
  )
}
