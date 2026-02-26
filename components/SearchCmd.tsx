'use client'

import { useEffect, useMemo, useState } from 'react'
import { MagnifyingGlass } from '@phosphor-icons/react'
import Link from 'next/link'
import type { DocMeta } from '@/lib/docs'

export function SearchCmd({ docs }: { docs: DocMeta[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')

  const filteredDocs = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return docs.filter(
      (d) => d.title.toLowerCase().includes(q) || (d.description?.toLowerCase().includes(q) ?? false)
    )
  }, [docs, query])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/50 backdrop-blur-sm"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 p-4 border-b border-zinc-800">
          <MagnifyingGlass className="w-5 h-5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search docs..."
            className="flex-1 bg-transparent text-zinc-100 placeholder-zinc-500 outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <kbd className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">ESC</kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {filteredDocs.length === 0 && query && (
            <p className="text-center text-zinc-500 py-8">No results found</p>
          )}
          {filteredDocs.map((doc) => (
            <Link
              key={doc.slug}
              href={`/docs/${doc.slug}`}
              onClick={() => setIsOpen(false)}
              className="block p-3 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <p className="text-zinc-100 font-medium">{doc.title}</p>
              {doc.description && (
                <p className="text-sm text-zinc-500 mt-0.5 line-clamp-1">{doc.description}</p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
