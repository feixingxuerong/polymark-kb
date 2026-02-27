import Link from 'next/link'
import { getLatestWeatherAviation, getLatestWeatherAviationDate, getUniqueSourceTypes } from '@/lib/weatherAviationSources'
import { SourceCard } from '@/components/SourceCard'

export const dynamic = 'force-static'

export default function LatestWeatherAviationPage() {
  const latestDate = getLatestWeatherAviationDate()
  const data = getLatestWeatherAviation()

  if (!latestDate || !data) {
    return (
      <div className="max-w-4xl">
        <h1 className="text-3xl font-bold text-zinc-100 mb-6">气象航空数据源</h1>
        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
          <p className="text-zinc-400">暂无气象航空数据源。</p>
          <p className="text-sm text-zinc-500 mt-2">请稍后再查询，或联系管理员生成新的数据。</p>
        </div>
      </div>
    )
  }

  const sourceTypes = getUniqueSourceTypes(data.sources)

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">气象航空数据源</h1>
          <p className="text-zinc-400 mt-1">
            {data.sources.length} 个数据源 · {latestDate}
          </p>
        </div>
        <Link
          href="/"
          className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          ← 返回首页
        </Link>
      </div>

      {/* 数据源类型概览 */}
      <div className="mb-6 flex flex-wrap gap-2">
        {sourceTypes.map((type) => {
          const count = data.sources.filter(s => s.source_type === type).length
          return (
            <span key={type} className="text-xs px-2 py-1 bg-zinc-800 text-zinc-400 rounded">
              {type}: {count}
            </span>
          )
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.sources.map((source, idx) => (
          <SourceCard key={idx} source={source} />
        ))}
      </div>
    </div>
  )
}
