import { getDocBySlug, getAllDocs } from '@/lib/docs'
import { notFound } from 'next/navigation'
import { Markdown } from '@/components/Markdown'

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

  if (!doc) {
    notFound()
  }

  return (
    <article className="max-w-3xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-100">{doc.title}</h1>
        {doc.description && <p className="text-lg text-zinc-400 mt-2">{doc.description}</p>}
        {doc.category && (
          <span className="inline-block mt-3 text-xs px-2 py-1 bg-zinc-800 text-zinc-400 rounded">
            {doc.category}
          </span>
        )}
      </header>

      <Markdown content={doc.content} />
    </article>
  )
}
