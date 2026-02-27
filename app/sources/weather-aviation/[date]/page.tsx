import Link from 'next/link'
import { getWeatherAviationByDate, getAllWeatherAviationFiles, getUniqueSourceTypes } from '@/lib/weatherAviationSources'
import { SourceCard } from '@/components/SourceCard'
import { HashScrollHandler } from '@/components/HashScrollHandler'

export const dynamic = 'force-static'

interface PageProps {
  params: Promise<{ date: string }>
}

export async function generateStaticParams() {
  const files = getAllWeatherAviationFiles()
  return files.map((file) => {
    const basename = file.split(/[/\\]/).pop() || ''
    const match = basename.match(/weather-aviation-sources-(\d{4}-\d{2}-\d{2})\.json/)
    return { date: match ? match[1] : '' }
  }).filter(p => p.date)
}

export default async function DateWeatherAviationPage({ params }: PageProps) {
  const { date } = await params
  const data = getWeatherAviationByDate(date)

  if (!data) {
    return (
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-zinc-100">气象航空数据源 {date}</h1>
          <Link
            href="/"
            className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            ← 返回首页
          </Link>
        </div>
        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
          <p className="text-zinc-400">{date} 暂无气象航空数据源。</p>
          <Link
            href="/sources/weather-aviation/latest"
            className="text-sm text-blue-400 hover:text-blue-300 mt-2 inline-block"
          >
            查看最新数据 →
          </Link>
        </div>
      </div>
    )
  }

  const sourceTypes = getUniqueSourceTypes(data.sources)

  return (
    <>
      <HashScrollHandler />
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-zinc-100">气象航空数据源 {date}</h1>
            <p className="text-zinc-400 mt-1">
              {data.sources.length} 个数据源
            </p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/sources/weather-aviation/latest"
              className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              最新 →
            </Link>
            <Link
              href="/"
              className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              ← 首页
            </Link>
          </div>
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
    </>
  )
}
