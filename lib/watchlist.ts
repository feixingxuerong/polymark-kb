import fs from 'fs'
import path from 'path'

const OUTPUTS_DIR = path.join(process.cwd(), 'content/poly-knowledge/outputs')

export interface WatchlistItem {
  question: string
  score: number
  spread_pct: number
  liquidity: number
  days_to_event: number
  reason: string
  market_id?: string
  url?: string
}

export interface WatchlistData {
  date?: string
  generatedAt?: string
  generated_at?: string
  markets?: WatchlistItem[]
  watchlist?: (WatchlistItem & { rank?: number })[]
}

function normalizeWatchlistData(date: string, data: WatchlistData): { date: string; generatedAt: string; items: WatchlistItem[] } {
  const generatedAt = data.generatedAt || data.generated_at || new Date().toISOString()
  const items = (data.markets || data.watchlist || []).map((it) => ({
    ...it,
    // ensure numbers
    score: typeof it.score === 'number' ? it.score : Number(it.score ?? 0),
    spread_pct: typeof it.spread_pct === 'number' ? it.spread_pct : Number(it.spread_pct ?? 0),
    liquidity: typeof it.liquidity === 'number' ? it.liquidity : Number(it.liquidity ?? 0),
    days_to_event: typeof it.days_to_event === 'number' ? it.days_to_event : Number(it.days_to_event ?? 0),
    reason: it.reason || '',
  }))
  return { date, generatedAt, items }
}

/**
 * Get all watchlist files sorted by date (newest first).
 */
export function getAllWatchlistFiles(): string[] {
  if (!fs.existsSync(OUTPUTS_DIR)) {
    return []
  }

  const files = fs.readdirSync(OUTPUTS_DIR)
  const watchlistFiles = files
    .filter((f) => f.match(/^watchlist-\d{4}-\d{2}-\d{2}\.json$/))
    .map((f) => path.join(OUTPUTS_DIR, f))
    .sort()
    .reverse()

  return watchlistFiles
}

/**
 * Get the latest watchlist file path.
 */
export function getLatestWatchlistPath(): string | null {
  const files = getAllWatchlistFiles()
  return files.length > 0 ? files[0] : null
}

/**
 * Get the latest watchlist date string (YYYY-MM-DD).
 */
export function getLatestWatchlistDate(): string | null {
  const latestPath = getLatestWatchlistPath()
  if (!latestPath) return null

  const match = path.basename(latestPath).match(/watchlist-(\d{4}-\d{2}-\d{2})\.json/)
  return match ? match[1] : null
}

/**
 * Read and parse a watchlist file by date.
 */
export function getWatchlistByDate(date: string): { date: string; generatedAt: string; items: WatchlistItem[] } | null {
  const filePath = path.join(OUTPUTS_DIR, `watchlist-${date}.json`)

  if (!fs.existsSync(filePath)) return null

  try {
    const raw = fs.readFileSync(filePath, 'utf-8')
    const data = JSON.parse(raw) as WatchlistData
    return normalizeWatchlistData(date, data)
  } catch (error) {
    console.error(`Error parsing watchlist ${date}:`, error)
    return null
  }
}

/**
 * Get the latest watchlist data.
 */
export function getLatestWatchlist(): { date: string; generatedAt: string; items: WatchlistItem[] } | null {
  const latestDate = getLatestWatchlistDate()
  if (!latestDate) return null
  return getWatchlistByDate(latestDate)
}

/**
 * Get watchlist items with optional limit.
 */
export function getWatchlistItems(date: string, limit?: number): WatchlistItem[] {
  const data = getWatchlistByDate(date)
  if (!data) return []

  const items = [...data.items].sort((a, b) => b.score - a.score)
  return limit ? items.slice(0, limit) : items
}

/**
 * Get latest watchlist items with optional limit.
 */
export function getLatestWatchlistItems(limit: number = 20): WatchlistItem[] {
  const data = getLatestWatchlist()
  if (!data) return []

  const items = [...data.items].sort((a, b) => b.score - a.score)
  return items.slice(0, limit)
}
