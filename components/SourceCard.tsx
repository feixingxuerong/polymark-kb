import Link from 'next/link'
import { AviationSource } from '@/lib/weatherAviationSources'

interface SourceCardProps {
  source: AviationSource
}

// 数据源类型中文映射
const SOURCE_TYPE_LABELS: Record<string, string> = {
  metar: 'METAR 机场天气',
  taf: 'TAF 机场预报',
  sigmet: 'SIGMET 重要天气',
  airmet: 'AIRMET 机场天气',
  wind: '风场数据',
  satellite: '卫星云图',
  radar: '雷达回波',
  lightning: '闪电定位',
  forecast: '数值预报',
  analysis: '分析产品',
}

// 国家/地区中文映射
const COUNTRY_LABELS: Record<string, string> = {
  US: '美国',
  CN: '中国',
  JP: '日本',
  KR: '韩国',
  AU: '澳大利亚',
  UK: '英国',
  DE: '德国',
  FR: '法国',
  CA: '加拿大',
  global: '全球',
}

function getCountryLabel(country?: string): string {
  if (!country) return ''
  return COUNTRY_LABELS[country] || country
}

function getSourceTypeLabel(type: string): string {
  return SOURCE_TYPE_LABELS[type] || type
}

export function SourceCard({ source }: SourceCardProps) {
  // 生成唯一的 id 用于 URL hash 跳转（优先使用 ICAO）
  const anchorId = source.icao || source.station_id || source.iata || ''

  const cardContent = (
    <div 
      id={anchorId}
      className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 hover:bg-zinc-800/50 transition-all cursor-pointer h-full flex flex-col"
    >
      {/* 站点名称 */}
      <div className="mb-2">
        <h3 className="text-zinc-100 font-medium text-sm leading-tight">
          {source.station_name_cn || source.station_name || source.station_id}
        </h3>
        {source.station_name_cn && source.station_name && (
          <p className="text-zinc-500 text-xs">{source.station_name}</p>
        )}
      </div>

      {/* 站点信息 */}
      <div className="flex items-center gap-2 text-xs text-zinc-500 mb-2 flex-wrap">
        {source.station_id && (
          <span className="px-1.5 py-0.5 bg-zinc-800 rounded">{source.station_id}</span>
        )}
        {source.icao && (
          <span className="text-zinc-400">ICAO: {source.icao}</span>
        )}
        {source.iata && (
          <span className="text-zinc-400">IATA: {source.iata}</span>
        )}
      </div>

      {/* 数据源类型徽章 */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs px-2 py-0.5 rounded bg-blue-400/10 text-blue-400">
          {getSourceTypeLabel(source.source_type)}
        </span>
        {source.country && (
          <span className="text-xs text-zinc-500">
            {getCountryLabel(source.country)}
          </span>
        )}
      </div>

      {/* 更新频率和覆盖范围 */}
      <div className="text-xs text-zinc-500 space-y-1 mb-2">
        {source.update_frequency && (
          <p>更新频率: {source.update_frequency}</p>
        )}
        {source.coverage && (
          <p>覆盖范围: {source.coverage}</p>
        )}
      </div>

      {/* 备注 */}
      {source.notes && (
        <p className="text-zinc-400 text-xs line-clamp-2 mb-2">{source.notes}</p>
      )}

      {/* 链接 */}
      <div className="mt-auto pt-2 border-t border-zinc-800">
        {source.url ? (
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            访问数据源 →
          </a>
        ) : source.api_url ? (
          <a
            href={source.api_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            访问 API →
          </a>
        ) : (
          <span className="text-xs text-zinc-600">无公开链接</span>
        )}
      </div>
    </div>
  )

  // 如果有链接，整张卡片可点击
  if (source.url) {
    return (
      <a
        href={source.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        {cardContent}
      </a>
    )
  }

  if (source.api_url) {
    return (
      <a
        href={source.api_url}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        {cardContent}
      </a>
    )
  }

  return cardContent
}
