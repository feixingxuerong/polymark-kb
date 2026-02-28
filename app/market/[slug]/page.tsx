import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getLatestWatchlistItems } from '@/lib/watchlist'
import { detectCategory, CATEGORY_LABELS, FilterCategory } from '@/lib/watchlist'
import { translateWeatherQuestion } from '@/lib/translate'
import { WatchlistItem } from '@/lib/watchlist'
import fs from 'fs'
import path from 'path'

// Make the page static for better performance
export const dynamic = 'force-static'

interface PageProps {
  params: Promise<{ slug: string }>
}

const OUTPUTS_DIR = path.join(process.cwd(), 'content/poly-knowledge/outputs')

/**
 * Find a market item by slug or market_id
 */
function findMarketItem(slug: string): WatchlistItem | null {
  const items = getLatestWatchlistItems(500)
  
  // First try to match by slug
  let item = items.find(i => i.slug === slug)
  if (item) return item

  // Also try to match by market_id (for URLs like /market/1456432)
  item = items.find(i => i.market_id === slug)
  if (item) return item

  // Try partial match on market_id (first 8 chars)
  item = items.find(i => i.market_id && i.market_id.startsWith(slug.slice(0, 8)))
  if (item) return item

  return null
}

/**
 * Get the latest weather-aviation sources file
 */
function getWeatherSources(): any | null {
  try {
    const files = fs.readdirSync(OUTPUTS_DIR)
    const sourceFiles = files
      .filter(f => f.startsWith('weather-aviation-sources-') && f.endsWith('.json'))
      .sort()
      .reverse()
    
    if (sourceFiles.length === 0) return null
    
    const raw = fs.readFileSync(path.join(OUTPUTS_DIR, sourceFiles[0]), 'utf-8')
    return JSON.parse(raw)
  } catch {
    return null
  }
}

/**
 * Find weather station/airport for a city
 */
function findStationForCity(sourcesData: any, city: string): any | null {
  if (!sourcesData?.data?.weather?.stations) return null
  
  const cityLower = city.toLowerCase()
  const stations = sourcesData.data.weather.stations
  
  // Direct match
  for (const station of stations) {
    const name = station.station?.name?.toLowerCase() || ''
    const id = station.station?.id?.toLowerCase() || ''
    if (name.includes(cityLower) || id.includes(cityLower)) {
      return station
    }
  }
  
  // City code mapping
  const cityCodes: Record<string, string[]> = {
    'nyc': ['KNYC', 'KEWR', 'KJFK', 'KLGA'],
    'new york': ['KNYC', 'KEWR', 'KJFK', 'KLGA'],
    'london': ['EGLL', 'EGKB'],
    'paris': ['LFPG', 'LFPO'],
    'tokyo': ['RJTT', 'RJNH'],
    'seoul': ['RKSI', 'RKSS'],
    'los angeles': ['KLAX', 'KBUR'],
    'chicago': ['KORD', 'KMDW'],
    'dallas': ['KDFW', 'KDAL'],
    'wellington': ['NZWN'],
  }
  
  const codes = cityCodes[cityLower]
  if (codes) {
    for (const code of codes) {
      for (const station of stations) {
        if (station.station?.id === code) {
          return station
        }
      }
    }
  }
  
  return null
}

/**
 * Format days to human readable
 */
function formatDaysLeft(days: number | null): string {
  if (days == null || !Number.isFinite(days)) return '未知'
  if (days <= 0) return '已到期'
  if (days < 1) return '今天'
  if (days < 7) return `${Math.round(days)}天`
  if (days < 30) return `${Math.round(days / 7)}周`
  return `${Math.round(days / 30)}月`
}

/**
 * Format settlement time
 */
function formatSettlement(endDate: string | null): string {
  if (!endDate) return '未知'
  try {
    const date = new Date(endDate)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    })
  } catch {
    return endDate
  }
}

/**
 * Get score level info
 */
function getScoreInfo(score: number): { label: string; color: string; bg: string } {
  if (score >= 8.5) return { label: '强信号', color: 'text-green-400', bg: 'bg-green-400/10' }
  if (score >= 7.0) return { label: '观察', color: 'text-yellow-400', bg: 'bg-yellow-400/10' }
  return { label: '高风险', color: 'text-red-400', bg: 'bg-red-400/10' }
}

/**
 * Extract city from question
 */
function extractCityFromQuestion(question: string): string | null {
  const match = question.match(/Will the highest temperature in (.+?) be /i)
  return match ? match[1].trim() : null
}

/**
 * Generate probability judgment based on question type
 */
function generateProbabilityJudgment(item: WatchlistItem): string {
  const q = item.question || ''
  
  // Weather temperature questions
  if (q.toLowerCase().includes('temperature')) {
    const cityMatch = q.match(/in (.+?) be /)
    const city = cityMatch ? cityMatch[1] : '该地区'
    
    const orHigher = q.toLowerCase().includes('or higher')
    const orBelow = q.toLowerCase().includes('or below')
    const exactMatch = q.match(/be (\d+(?:\.\d+)?)\s*°?\s*(F|C) on/)
    const threshold = exactMatch ? exactMatch[1] : null
    const unit = exactMatch ? exactMatch[2] : 'F'
    
    let judgment = ''
    if (threshold) {
      if (orHigher) {
        judgment = `本助手判断：需核实 ${city} 历史同期气温分布。若阈值偏高（如${unit === 'F' ? threshold + '°F' : threshold + '°C'}），则概率偏低；反之则高。建议查看NOAA天气预报核实。`
      } else if (orBelow) {
        judgment = `本助手判断：需核实 ${city} 季节正常气温范围。若阈值偏低，则概率偏高。建议查看NOAA天气预报核实。`
      } else {
        judgment = `本助手判断：精确温度预测难度较大，建议关注天气预报的置信区间。`
      }
    } else {
      judgment = `本助手判断：天气类预测需参考NOAA/气象局预报，建议核实数据源时间戳与结算时间是否一致。`
    }
    return judgment
  }
  
  // Crypto questions
  if (q.toLowerCase().includes('bitcoin') || q.toLowerCase().includes('btc')) {
    return '本助手判断：加密货币价格波动剧烈，短期预测不确定性高。建议关注链上数据和市场情绪指标。'
  }
  
  // Default
  return '本助手判断：需根据具体事件类型判断。建议核实结算源可靠性与时间窗口。'
}

/**
 * Glossary items
 */
const GLOSSARY: Record<string, { term: string; definition: string }> = {
  'neg risk': {
    term: 'Neg Risk',
    definition: 'Neg Risk 是 Polymarket 的风险标记，表示该市场可能存在对冲限制或结算风险。'
  },
  'liquidity': {
    term: '流动性 (Liquidity)',
    definition: '市场中可用于交易的资金量。流动性越高，点差越小，交易成本越低。'
  },
  'spread': {
    term: '价差 (Spread)',
    definition: '买入价和卖出价之间的差额。价差越小，市场效率越高。'
  },
  'settlement': {
    term: '结算时间',
    definition: '市场到期并确定结果的时间。结算后无法再进行交易。'
  },
  'weather_signal_score': {
    term: 'Weather Signal Score',
    definition: '天气类预测的信号评分，综合考虑历史准确率、数据源可靠性等因素。'
  }
}

/**
 * Market Detail Page
 * Route: /market/[slug] (recommended) or /market/[market_id]
 */
export default async function MarketDetailPage({ params }: PageProps) {
  const { slug } = await params
  const item = findMarketItem(slug)

  if (!item) {
    notFound()
  }

  const category = detectCategory(item)
  const categoryLabel = CATEGORY_LABELS[category as FilterCategory] || '其它'
  const questionCn = translateWeatherQuestion(item.question)
  const scoreInfo = getScoreInfo(item.score)
  const probabilityJudgment = generateProbabilityJudgment(item)
  
  // Get weather sources for weather-related markets
  let stationInfo: { name: string; forecastUrl: string; metarTime: string } | null = null
  if (category === 'weather' && item.question) {
    const city = extractCityFromQuestion(item.question)
    if (city) {
      const sourcesData = getWeatherSources()
      if (sourcesData) {
        const station = findStationForCity(sourcesData, city)
        if (station) {
          const latestObs = station.observations?.[0]
          stationInfo = {
            name: station.station?.name || city,
            forecastUrl: station.station?.grid?.forecastUrl || '',
            metarTime: latestObs?.observationTime || ''
          }
        }
      }
    }
  }

  // Parse endDate from the item (it's in the raw data)
  const endDate = (item as any).endDate || (item as any).end_date || null

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/watchlist/latest"
          className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          ← 返回 Watchlist
        </Link>
      </div>

      {/* Main Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        {/* Category & Score Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-400">
              {categoryLabel}
            </span>
            {(item as any).negRisk && (
              <span className="text-xs px-2 py-1 rounded bg-orange-500/20 text-orange-400">
                Neg Risk
              </span>
            )}
          </div>
          <span className={`text-sm px-3 py-1 rounded ${scoreInfo.bg} ${scoreInfo.color}`}>
            {scoreInfo.label} · {Number.isFinite(item.score) ? item.score.toFixed(1) : '—'}
          </span>
        </div>

        {/* Question (English) */}
        <h1 className="text-xl font-semibold text-zinc-100 mb-3">
          {item.question}
        </h1>

        {/* Question (Chinese) */}
        {questionCn && (
          <p className="text-zinc-400 text-lg mb-4 pb-4 border-b border-zinc-800">
            {questionCn}
          </p>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {/* Days to Event */}
          <div className="p-3 bg-zinc-800/50 rounded-lg">
            <div className="text-xs text-zinc-500 mb-1">结算时间</div>
            <div className="text-zinc-200">
              {endDate ? formatSettlement(endDate) : formatDaysLeft(item.days_to_event)}
            </div>
            {item.days_to_event != null && (
              <div className="text-xs text-zinc-500 mt-1">
                剩余 {formatDaysLeft(item.days_to_event)}
              </div>
            )}
          </div>

          {/* Liquidity */}
          <div className="p-3 bg-zinc-800/50 rounded-lg">
            <div className="text-xs text-zinc-500 mb-1">流动性</div>
            <div className="text-zinc-200">
              {item.liquidity != null 
                ? `$${item.liquidity >= 1000 ? (item.liquidity / 1000).toFixed(1) + 'k' : item.liquidity.toFixed(0)}`
                : '—'}
            </div>
          </div>

          {/* Spread */}
          <div className="p-3 bg-zinc-800/50 rounded-lg">
            <div className="text-xs text-zinc-500 mb-1">价差</div>
            <div className="text-zinc-200">
              {item.spread_pct != null ? `${item.spread_pct.toFixed(1)}%` : '—'}
            </div>
          </div>
        </div>

        {/* Reason */}
        {item.reason && (
          <div className="mt-6 p-4 bg-zinc-800/30 rounded-lg">
            <div className="text-xs text-zinc-500 mb-2">核心理由</div>
            <p className="text-zinc-300">{item.reason}</p>
          </div>
        )}

        {/* Action Badge */}
        {item.action && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-xs text-zinc-500">行动:</span>
            <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-400">
              {item.action}
            </span>
          </div>
        )}

        {/* Market Link */}
        {item.url && (
          <div className="mt-6 pt-4 border-t border-zinc-800">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
            >
              在 Polymarket 查看 →
            </a>
          </div>
        )}

        {/* Market ID (for debugging) */}
        {item.market_id && (
          <div className="mt-4 text-xs text-zinc-600">
            ID: {item.market_id} · Slug: {item.slug || 'N/A'}
          </div>
        )}
      </div>

      {/* Weather Signal Score (if available) */}
      {(item as any).weather_signal_score && (
        <div className="mt-4 p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
          <div className="text-xs text-zinc-500 mb-2">Weather Signal Score</div>
          <div className="text-zinc-300">
            {(item as any).weather_signal_score}
          </div>
        </div>
      )}

      {/* P1: Probability Calculation Card (Issue #15) */}
      {item.assistant_prob != null || item.assistant_evidence ? (
        <div className="mt-4 p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
          <div className="text-xs text-zinc-500 mb-3">概率计算 (assistant_prob)</div>
          
          {/* Probability */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="p-3 bg-zinc-800/50 rounded-lg">
              <div className="text-xs text-zinc-500 mb-1">概率</div>
              <div className="text-zinc-200 text-lg font-semibold">
                {item.assistant_prob != null ? `${(item.assistant_prob * 100).toFixed(1)}%` : '—'}
              </div>
            </div>
            
            {/* Threshold */}
            <div className="p-3 bg-zinc-800/50 rounded-lg">
              <div className="text-xs text-zinc-500 mb-1">阈值</div>
              <div className="text-zinc-200">
                {item.assistant_evidence?.threshold != null ? `${item.assistant_evidence.threshold}°` : '—'}
              </div>
            </div>
            
            {/* Predicted Max Temp */}
            <div className="p-3 bg-zinc-800/50 rounded-lg">
              <div className="text-xs text-zinc-500 mb-1">预测最高温</div>
              <div className="text-zinc-200">
                {item.assistant_evidence?.predicted_max != null ? `${item.assistant_evidence.predicted_max}°` : '—'}
              </div>
            </div>
            
            {/* Sigma */}
            <div className="p-3 bg-zinc-800/50 rounded-lg">
              <div className="text-xs text-zinc-500 mb-1">Sigma</div>
              <div className="text-zinc-200">
                {item.assistant_evidence?.sigma != null ? `±${item.assistant_evidence.sigma.toFixed(2)}` : '—'}
              </div>
            </div>
          </div>
          
          {/* Additional Info */}
          <div className="space-y-2 text-sm">
            {/* Station */}
            {item.assistant_evidence?.station && (
              <div className="flex items-center gap-2">
                <span className="text-zinc-500">站点:</span>
                <span className="text-zinc-300">{item.assistant_evidence.station}</span>
              </div>
            )}
            
            {/* Data Update Time */}
            {item.assistant_evidence?.updated_at && (
              <div className="flex items-center gap-2">
                <span className="text-zinc-500">数据更新时间:</span>
                <span className="text-zinc-300">
                  {new Date(item.assistant_evidence.updated_at).toLocaleString('zh-CN')}
                </span>
              </div>
            )}
            
            {/* Market Price Difference */}
            {item.assistant_evidence?.market_price != null && item.assistant_prob != null && (
              <div className="flex items-center gap-2">
                <span className="text-zinc-500">与市场价差:</span>
                <span className={`${
                  (item.assistant_prob - item.assistant_evidence.market_price) > 0 
                    ? 'text-green-400' 
                    : (item.assistant_prob - item.assistant_evidence.market_price) < 0 
                      ? 'text-red-400' 
                      : 'text-zinc-300'
                }`}>
                  {((item.assistant_prob - item.assistant_evidence.market_price) * 100).toFixed(1)}%
                  {item.assistant_prob > item.assistant_evidence.market_price ? ' ↑' : item.assistant_prob < item.assistant_evidence.market_price ? ' ↓' : ''}
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* No data - show placeholder */
        <div className="mt-4 p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
          <div className="text-xs text-zinc-500 mb-2">概率计算 (assistant_prob)</div>
          <p className="text-zinc-400 text-sm">未计算/待接入</p>
        </div>
      )}

      {/* P1: Weather Station Info */}
      {stationInfo && (
        <div className="mt-4 p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
          <div className="text-xs text-zinc-500 mb-2">绑定的气象站/机场</div>
          <div className="space-y-2">
            <div className="text-zinc-300">
              <span className="text-zinc-500">站点:</span> {stationInfo.name}
            </div>
            {stationInfo.forecastUrl && (
              <div>
                <a
                  href={stationInfo.forecastUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  NOAA 预报链接 →
                </a>
              </div>
            )}
            {stationInfo.metarTime && (
              <div className="text-zinc-500 text-xs">
                METAR 更新时间: {new Date(stationInfo.metarTime).toLocaleString('zh-CN')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* P1: Probability Judgment */}
      <div className="mt-4 p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
        <div className="text-xs text-zinc-500 mb-2">本助手概率判断</div>
        <p className="text-zinc-300 text-sm leading-relaxed">
          {probabilityJudgment}
        </p>
      </div>

      {/* P1: Glossary */}
      <div className="mt-4 p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
        <div className="text-xs text-zinc-500 mb-3">Glossary 术语解释</div>
        <div className="space-y-3">
          {Object.entries(GLOSSARY).map(([key, val]) => (
            <div key={key} className="text-sm">
              <span className="text-zinc-400 font-medium">{val.term}</span>
              <span className="text-zinc-500"> - {val.definition}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Generate static params for all markets
 */
export async function generateStaticParams() {
  const items = getLatestWatchlistItems(100)
  
  // Generate params for both slug and market_id
  const params = new Set<string>()
  
  items.forEach(item => {
    if (item.slug) params.add(item.slug)
    if (item.market_id) params.add(item.market_id)
  })

  return Array.from(params).map(slug => ({ slug }))
}
