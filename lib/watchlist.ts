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
  date: string
  generatedAt: string
  markets: WatchlistItem[]
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
export function getWatchlistByDate(date: string): WatchlistData | null {
  const filePath = path.join(OUTPUTS_DIR, `watchlist-${date}.json`)

  if (!fs.existsSync(filePath)) {
    return null
  }

  try {
    const raw = fs.readFileSync(filePath, 'utf-8')
    const data = JSON.parse(raw) as WatchlistData
    return data
  } catch (error) {
    console.error(`Error parsing watchlist ${date}:`, error)
    return null
  }
}

/**
 * Get the latest watchlist data.
 */
export function getLatestWatchlist(): WatchlistData | null {
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

  const items = data.markets.sort((a, b) => b.score - a.score)
  return limit ? items.slice(0, limit) : items
}

/**
 * Get latest watchlist items with optional limit.
 */
export function getLatestWatchlistItems(limit: number = 20): WatchlistItem[] {
  const data = getLatestWatchlist()
  if (!data) return []

  const items = data.markets.sort((a, b) => b.score - a.score)
  return items.slice(0, limit)
}
