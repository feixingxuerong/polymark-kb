'use client'

import Link from 'next/link'
import { Folder, FileText } from '@phosphor-icons/react'
import type { DocMeta } from '@/lib/docs'

export function Sidebar({
  categories,
}: {
  categories: Record<string, DocMeta[]>
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

      <nav className="p-4 overflow-y-auto h-[calc(100vh-110px)]">
        {Object.entries(categories).map(([category, docs]) => (
          <div key={category} className="mb-4">
            <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Folder weight="fill" className="w-3 h-3" />
              {category}
            </h3>
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
        ))}
      </nav>
    </aside>
  )
}
