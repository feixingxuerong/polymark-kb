'use client'

import { useEffect, useMemo, useState } from 'react'
import { MagnifyingGlass } from '@phosphor-icons/react'
import Link from 'next/link'
import Fuse from 'fuse.js'

type SearchDoc = {
  slug: string
  title: string
  description?: string
  category?: string
  tags?: string[]
  text: string
}

type SearchIndex = {
  generatedAt: string
  docs: SearchDoc[]
}

export function SearchCmd() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState<SearchIndex | null>(null)

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

    // Listen for custom event to open search (used by mobile button)
    const handleOpenSearch = () => setIsOpen(true)

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('open-search', handleOpenSearch)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('open-search', handleOpenSearch)
    }
  }, [])

  useEffect(() => {
    if (!isOpen) return
    if (index) return
    fetch('/search-index.json')
      .then((r) => r.json())
      .then(setIndex)
      .catch(() => setIndex({ generatedAt: '', docs: [] }))
  }, [isOpen, index])

  const fuse = useMemo(() => {
    if (!index) return null
    return new Fuse(index.docs, {
      includeScore: true,
      threshold: 0.35,
      keys: [
        { name: 'title', weight: 0.5 },
        { name: 'description', weight: 0.25 },
        { name: 'text', weight: 0.25 },
      ],
    })
  }, [index])

  const results = useMemo(() => {
    const q = query.trim()
    if (!q || !fuse) return []
    return fuse.search(q).slice(0, 12).map((r) => r.item)
  }, [query, fuse])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/50 backdrop-blur-sm"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden"
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

        <div className="max-h-96 overflow-y-auto p-2">
          {results.length === 0 && query && (
            <p className="text-center text-zinc-500 py-8">No results found</p>
          )}
          {results.map((doc) => (
            <Link
              key={doc.slug}
              href={`/docs/${doc.slug}`}
              onClick={() => setIsOpen(false)}
              className="block p-3 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <p className="text-zinc-100 font-medium">{doc.title}</p>
              <p className="text-xs text-zinc-500 mt-1">
                {doc.category || '未分类'} · {doc.slug}
              </p>
              {(doc.description || doc.text) && (
                <p className="text-sm text-zinc-500 mt-1 line-clamp-2">
                  {doc.description || doc.text.slice(0, 140) + (doc.text.length > 140 ? '…' : '')}
                </p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
