'use client'

import { useState } from 'react'
import { MagnifyingGlass, List, X, Folder, FileText } from '@phosphor-icons/react'
import Link from 'next/link'

function statusTone(status: string): { label: string; className: string } {
  const s = status.trim()
  if (s.includes('✅')) return { label: 'OK', className: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20' }
  if (s.includes('待')) return { label: 'TODO', className: 'bg-amber-500/15 text-amber-300 border-amber-500/20' }
  return { label: s || '—', className: 'bg-zinc-700/20 text-zinc-300 border-zinc-700/30' }
}

export function MobileLayout({
  children,
  categories,
  chapters,
}: {
  children: React.ReactNode
  categories: Record<string, any[]>
  chapters: any[]
}) {
  const [drawerOpen, setDrawerOpen] = useState(false) // Default closed (immersive reading first)

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-zinc-950 border-b border-zinc-800">
        <Link href="/" className="text-lg font-semibold text-zinc-100">
          Polymarket KB
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-search'))}
            className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 rounded-lg transition-colors"
            aria-label="搜索"
          >
            <MagnifyingGlass className="w-5 h-5" />
          </button>
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 rounded-lg transition-colors"
            aria-label="菜单"
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </header>
      
      {/* Spacer for fixed header */}
      <div className="md:hidden h-14" />

      {/* Mobile Drawer */}
      {drawerOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-50 md:hidden bg-black/60 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          
          {/* Drawer panel */}
          <aside className="fixed top-0 right-0 h-full w-72 bg-zinc-950 border-l border-zinc-800 z-50 md:hidden animate-slide-in">
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <span className="text-sm font-medium text-zinc-300">菜单</span>
              <button 
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 rounded-lg transition-colors"
                aria-label="关闭"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="p-4 overflow-y-auto h-[calc(100vh-60px)] sidebar-scroll">
              {Object.entries(categories).map(([category, docs]) => {
                const ch = chapters.find((c) => c.name === category)
                const tone = ch ? statusTone(ch.status) : null

                return (
                  <div key={category} className="mb-5">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                        <Folder weight="fill" className="w-3 h-3" />
                        {category}
                      </h3>
                      {tone && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${tone.className}`}>
                          {tone.label}
                        </span>
                      )}
                    </div>

                    <ul className="space-y-1">
                      {docs.map((doc) => (
                        <li key={doc.slug}>
                          <Link
                            href={`/docs/${doc.slug}`}
                            onClick={() => setDrawerOpen(false)}
                            className="flex items-center gap-2 px-2 py-2 text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 rounded-md transition-colors"
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
        </>
      )}

      {/* Main content area - with tap hint when drawer is open */}
      <div className="md:hidden">
        {children}
      </div>
    </>
  )
}
