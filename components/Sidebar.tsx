'use client'

import Link from 'next/link'
import { Folder, FileText } from '@phosphor-icons/react'
import type { DocMeta } from '@/lib/docs'
import type { IndexChapter } from '@/lib/nav'

function statusTone(status: string): { label: string; className: string } {
  const s = status.trim()
  if (s.includes('✅')) return { label: 'OK', className: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20' }
  if (s.includes('待')) return { label: 'TODO', className: 'bg-amber-500/15 text-amber-300 border-amber-500/20' }
  return { label: s || '—', className: 'bg-zinc-700/20 text-zinc-300 border-zinc-700/30' }
}

export function Sidebar({
  categories,
  chapters,
}: {
  categories: Record<string, DocMeta[]>
  chapters: IndexChapter[]
}) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-zinc-950 border-r border-zinc-800">
      <div className="p-4 border-b border-zinc-800">
        <Link href="/" className="text-lg font-semibold text-zinc-100">
          Polymarket KB
        </Link>
        <p className="text-xs text-zinc-500 mt-1">Theory & Strategy</p>
        <p className="text-[11px] text-zinc-600 mt-2">Cmd/Ctrl + K 搜索</p>
      </div>

      <nav className="p-4 overflow-y-auto h-[calc(100vh-110px)] sidebar-scroll">
        {Object.entries(categories).map(([category, docs]) => {
          const ch = chapters.find((c) => c.name === category)
          const tone = ch ? statusTone(ch.status) : null

          return (
            <div key={category} className="mb-4">
              <div className="flex items-center justify-between gap-2 mb-2">
                <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                  <Folder weight="fill" className="w-3 h-3" />
                  {category}
                </h3>
                {tone && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded border ${tone.className}`}
                    title={ch?.status}
                  >
                    {tone.label}
                  </span>
                )}
              </div>

              <ul className="space-y-1">
                {docs.map((doc) => (
                  <li key={doc.slug}>
                    <Link
                      href={`/docs/${doc.slug}`}
                      className="flex items-center gap-2 px-2 py-1.5 text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 rounded-md transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      {doc.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
