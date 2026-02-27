import fs from 'fs'
import path from 'path'

const OUTPUTS_DIR = path.join(process.cwd(), 'content/poly-knowledge/outputs')

export interface DiffItem {
  question: string
  score?: number
  score_change?: number
  spread_pct?: number | null
  spread_change?: number | null
  liquidity?: number | null
  liquidity_change_pct?: number | null
  market_id?: string
  url?: string
  reason?: string
}

export interface WatchlistDiffData {
  generated_at?: string
  today_date?: string
  yesterday_date?: string | null
  first_run?: boolean
  summary?: {
    today_count?: number
    yesterday_count?: number
    new_count?: number
    dropped_count?: number
    score_jumps_count?: number
    spread_moves_count?: number
    liquidity_moves_count?: number
  }
  new_entries?: DiffItem[]
  dropped_entries?: DiffItem[]
  score_jumps?: DiffItem[]
  spread_moves?: DiffItem[]
  liquidity_moves?: DiffItem[]
  top_movers?: DiffItem[]
}

/**
 * Get all watchlist-diff files sorted by date (newest first).
 */
export function getAllDiffFiles(): string[] {
  if (!fs.existsSync(OUTPUTS_DIR)) {
    return []
  }

  const files = fs.readdirSync(OUTPUTS_DIR)
  const diffFiles = files
    .filter((f) => f.match(/^watchlist-diff-\d{4}-\d{2}-\d{2}\.json$/))
    .map((f) => path.join(OUTPUTS_DIR, f))
    .sort()
    .reverse()

  return diffFiles
}

/**
 * Get available dates for watchlist-diff (YYYY-MM-DD format).
 */
export function getAvailableDiffDates(): string[] {
  const files = getAllDiffFiles()
  return files.map((f) => {
    const match = path.basename(f).match(/watchlist-diff-(\d{4}-\d{2}-\d{2})\.json/)
    return match ? match[1] : ''
  }).filter(Boolean)
}

/**
 * Get the latest diff file path.
 */
export function getLatestDiffPath(): string | null {
  const files = getAllDiffFiles()
  return files.length > 0 ? files[0] : null
}

/**
 * Get the latest diff date string (YYYY-MM-DD).
 */
export function getLatestDiffDate(): string | null {
  const latestPath = getLatestDiffPath()
  if (!latestPath) return null

  const match = path.basename(latestPath).match(/watchlist-diff-(\d{4}-\d{2}-\d{2})\.json/)
  return match ? match[1] : null
}

/**
 * Read and parse a diff file by date.
 */
export function getWatchlistDiffByDate(date: string): WatchlistDiffData | null {
  const filePath = path.join(OUTPUTS_DIR, `watchlist-diff-${date}.json`)

  if (!fs.existsSync(filePath)) return null

  try {
    const raw = fs.readFileSync(filePath, 'utf-8')
    const data = JSON.parse(raw) as WatchlistDiffData
    return data
  } catch (error) {
    console.error(`Error parsing watchlist-diff ${date}:`, error)
    return null
  }
}

/**
 * Get the latest watchlist diff data.
 */
export function getLatestWatchlistDiff(): WatchlistDiffData | null {
  const latestDate = getLatestDiffDate()
  if (!latestDate) return null
  return getWatchlistDiffByDate(latestDate)
}
