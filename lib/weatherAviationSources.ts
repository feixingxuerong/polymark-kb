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
  // 新 schema：来自 polymark-task scripts/generate-weather-aviation-sources.mjs
  data?: {
    weather?: {
      generatedAt?: string
      stations?: Array<{
        station?: {
          id?: string
          name?: string
          coordinates?: { lat?: number; lon?: number }
          grid?: {
            gridId?: string
            gridX?: number
            gridY?: number
            forecastUrl?: string
            forecastHourlyUrl?: string
            cwa?: string
          }
        }
      }>
    }
    aviation?: {
      generatedAt?: string
      airports?: Array<{
        airport?: {
          icao?: string
          iata?: string
          name?: string
          city?: string
          coordinates?: { lat?: number; lon?: number }
        }
        metar?: {
          observationTime?: string
          flightCategory?: string
        }
        taf?: any
      }>
    }
  }
  // 旧 schema（兼容）
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

    const generatedAt =
      data.data?.aviation?.generatedAt ||
      data.data?.weather?.generatedAt ||
      data.generatedAt ||
      data.generated_at ||
      new Date().toISOString()

    // 新 schema → 统一映射成 AviationSource[]（供 UI 复用）
    const mapped: AviationSource[] = []

    const weatherStations = data.data?.weather?.stations || []
    for (const s of weatherStations) {
      const st = s.station
      if (!st?.id) continue
      mapped.push({
        station_id: st.id,
        station_name: st.name || st.id,
        latitude: st.coordinates?.lat,
        longitude: st.coordinates?.lon,
        country: 'US',
        region: st.grid?.cwa,
        source_type: 'forecast',
        update_frequency: '约每小时',
        api_url: st.grid?.forecastUrl,
        coverage: st.grid?.gridId ? `${st.grid.gridId} ${st.grid.gridX},${st.grid.gridY}` : undefined,
        notes: 'NWS 网格预报（forecast）',
      })
    }

    const aviationAirports = data.data?.aviation?.airports || []
    for (const a of aviationAirports) {
      const ap = a.airport
      if (!ap?.icao) continue
      mapped.push({
        station_id: ap.icao,
        station_name: ap.name || ap.icao,
        icao: ap.icao,
        iata: ap.iata,
        latitude: ap.coordinates?.lat,
        longitude: ap.coordinates?.lon,
        country: 'US',
        region: ap.city,
        source_type: 'metar',
        update_frequency: '约每小时',
        notes: a.metar?.observationTime ? `METAR 观测时间: ${a.metar.observationTime}` : 'METAR（机场实况）',
      })
    }

    // 旧 schema 兼容
    const sources = (data.sources && Array.isArray(data.sources) ? data.sources : [])

    const finalSources = mapped.length > 0 ? mapped : sources

    return { date, generatedAt, sources: finalSources }
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
