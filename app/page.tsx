import Link from 'next/link'
import { getAllDocs, getDocsByCategory } from '@/lib/docs'

import { getIndexChapters } from '@/lib/nav'

export default function Home() {
  const docs = getAllDocs()
  const categories = getDocsByCategory()
  const chapters = getIndexChapters()

  return (
    <div className="max-w-4xl">
      <section className="mb-12">
        <h1 className="text-4xl font-bold text-zinc-100 mb-4">Polymarket Knowledge Base</h1>
        <p className="text-xl text-zinc-400">顶尖理论、策略框架与风控体系</p>
        <p className="text-sm text-zinc-600 mt-3">提示：Cmd/Ctrl + K 搜索</p>
      </section>

      <section className="mb-10">
        <div className="grid grid-cols-3 gap-4">
          <Link
            href="/docs/index"
            className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors"
          >
            <h3 className="font-semibold text-zinc-100 mb-1">Index</h3>
            <p className="text-sm text-zinc-500">知识库目录与结构</p>
          </Link>

          <Link
            href="/docs/sources"
            className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors"
          >
            <h3 className="font-semibold text-zinc-100 mb-1">Sources</h3>
            <p className="text-sm text-zinc-500">数据源与参考链接</p>
          </Link>

          <Link
            href="/docs/trade-readiness-checklist"
            className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors"
          >
            <h3 className="font-semibold text-zinc-100 mb-1">Checklist</h3>
            <p className="text-sm text-zinc-500">出手门槛（理论版）</p>
          </Link>
        </div>
      </section>

      <section className="mb-12">
        <div className="flex items-end justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold text-zinc-300">索引章节状态</h2>
          <p className="text-sm text-zinc-600">来源：index.md 的“章节/主题”表</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {chapters.map((c) => (
            <div key={c.name} className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-zinc-100 font-medium">{c.name}</p>
                  <p className="text-sm text-zinc-500 mt-1 line-clamp-2">{c.desc}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-300 shrink-0">{c.status}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl">
          <h3 className="text-sm font-semibold text-zinc-300 mb-2">Next to write（待补充）</h3>
          <ul className="text-sm text-zinc-400 space-y-1">
            {chapters
              .filter((c) => c.status.includes('待'))
              .map((c) => (
                <li key={c.name} className="flex items-center justify-between gap-3">
                  <span>{c.name}</span>
                  <span className="text-xs text-zinc-600">{c.status}</span>
                </li>
              ))}
            {chapters.filter((c) => c.status.includes('待')).length === 0 && (
              <li className="text-zinc-500">暂无待补充章节</li>
            )}
          </ul>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-zinc-300 mb-4">所有文档 ({docs.length})</h2>
        {Object.entries(categories).map(([category, categoryDocs]) => (
          <div key={category} className="mb-6">
            <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-2">{category}</h3>
            <div className="grid grid-cols-2 gap-2">
              {categoryDocs.map((doc) => (
                <Link
                  key={doc.slug}
                  href={`/docs/${doc.slug}`}
                  className="p-3 bg-zinc-900/50 border border-zinc-800/50 rounded-lg hover:bg-zinc-900 hover:border-zinc-800 transition-colors"
                >
                  <span className="text-zinc-300">{doc.title}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}
