import Link from 'next/link'
import { getDocBySlug, getAllDocs } from '@/lib/docs'
import { notFound } from 'next/navigation'
import { Markdown } from '@/components/Markdown'

function formatDate(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export async function generateStaticParams() {
  const docs = getAllDocs()
  return docs.map((doc) => ({
    slug: doc.slug.split('/'),
  }))
}

export default async function DocPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const resolvedParams = await params
  const slug = resolvedParams.slug.join('/')
  const doc = getDocBySlug(slug)

  if (!doc) notFound()

  const all = getAllDocs()
  const idx = all.findIndex((d) => d.slug === slug)
  const prev = idx > 0 ? all[idx - 1] : null
  const next = idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null

  return (
    <article className="max-w-3xl">
      {/* Metadata Header */}
      <div className="mb-6 pb-4 border-b border-zinc-800">
        <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-2 text-xs text-zinc-500">
          {doc.category && (
            <span className="px-2 py-0.5 bg-zinc-800/50 text-zinc-400 rounded">
              {doc.category}
            </span>
          )}
          <span className="font-mono">/{doc.slug}</span>
          {doc.mtime && (
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Last updated: {formatDate(doc.mtime)}
            </span>
          )}
        </div>
        
        {/* Sources from frontmatter */}
        {doc.sources && doc.sources.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-zinc-500">来源:</span>
            {doc.sources.map((source, i) => (
              <a
                key={i}
                href={source}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 hover:underline truncate max-w-[200px]"
              >
                {new URL(source).hostname}
              </a>
            ))}
          </div>
        )}
      </div>

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-100">{doc.title}</h1>
        {doc.description && <p className="text-lg text-zinc-400 mt-2">{doc.description}</p>}
      </header>

      <Markdown content={doc.content} />

      <hr className="border-zinc-800 my-10" />
      <div className="flex items-center justify-between gap-4">
        {prev ? (
          <Link
            className="text-sm text-zinc-400 hover:text-zinc-100"
            href={`/docs/${prev.slug}`}
          >
            ← {prev.title}
          </Link>
        ) : (
          <span />
        )}

        {next ? (
          <Link
            className="text-sm text-zinc-400 hover:text-zinc-100 text-right"
            href={`/docs/${next.slug}`}
          >
            {next.title} →
          </Link>
        ) : (
          <span />
        )}
      </div>
    </article>
  )
}
