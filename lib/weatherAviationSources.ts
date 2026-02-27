import fs from 'fs'
import path from 'path'

const OUTPUTS_DIR = path.join(process.cwd(), 'content/poly-knowledge/outputs')

export interface AviationSource {
  station_id: string
  station_name: string
  station_name_cn?: string
  icao?: string
  iata?: string
  latitude?: number
  longitude?: number
  country?: string
  region?: string
  source_type: 'metar' | 'taf' | 'sigmet' | 'airmet' | 'wind' | 'satellite' | 'radar' | 'lightning' | 'forecast' | 'analysis'
  update_frequency?: string
  url?: string
  api_url?: string
  data_format?: string
  coverage?: string
  notes?: string
}

export interface WeatherAviationSourcesData {
  date?: string
  generatedAt?: string
  generated_at?: string
  sources?: AviationSource[]
}

/**
 * Get all weather-aviation-sources files sorted by date (newest first).
 */
export function getAllWeatherAviationFiles(): string[] {
  if (!fs.existsSync(OUTPUTS_DIR)) {
    return []
  }

  const files = fs.readdirSync(OUTPUTS_DIR)
  const sourceFiles = files
    .filter((f) => f.match(/^weather-aviation-sources-\d{4}-\d{2}-\d{2}\.json$/))
    .map((f) => path.join(OUTPUTS_DIR, f))
    .sort()
    .reverse()

  return sourceFiles
}

/**
 * Get the latest weather-aviation-sources file path.
 */
export function getLatestWeatherAviationPath(): string | null {
  const files = getAllWeatherAviationFiles()
  return files.length > 0 ? files[0] : null
}

/**
 * Get the latest weather-aviation-sources date string (YYYY-MM-DD).
 */
export function getLatestWeatherAviationDate(): string | null {
  const latestPath = getLatestWeatherAviationPath()
  if (!latestPath) return null

  const match = path.basename(latestPath).match(/weather-aviation-sources-(\d{4}-\d{2}-\d{2})\.json/)
  return match ? match[1] : null
}

/**
 * Read and parse a weather-aviation-sources file by date.
 */
export function getWeatherAviationByDate(date: string): { date: string; generatedAt: string; sources: AviationSource[] } | null {
  const filePath = path.join(OUTPUTS_DIR, `weather-aviation-sources-${date}.json`)

  if (!fs.existsSync(filePath)) return null

  try {
    const raw = fs.readFileSync(filePath, 'utf-8')
    const data = JSON.parse(raw) as WeatherAviationSourcesData
    const generatedAt = data.generatedAt || data.generated_at || new Date().toISOString()
    const sources = data.sources || []
    return { date, generatedAt, sources }
  } catch (error) {
    console.error(`Error parsing weather-aviation-sources ${date}:`, error)
    return null
  }
}

/**
 * Get the latest weather-aviation-sources data.
 */
export function getLatestWeatherAviation(): { date: string; generatedAt: string; sources: AviationSource[] } | null {
  const latestDate = getLatestWeatherAviationDate()
  if (!latestDate) return null
  return getWeatherAviationByDate(latestDate)
}

/**
 * Get sources by type.
 */
export function getSourcesByType(sources: AviationSource[], type: string): AviationSource[] {
  return sources.filter(s => s.source_type === type)
}

/**
 * Get unique source types from a list.
 */
export function getUniqueSourceTypes(sources: AviationSource[]): string[] {
  const types = new Set(sources.map(s => s.source_type))
  return Array.from(types).sort()
}
