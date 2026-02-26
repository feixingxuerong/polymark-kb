import type { Metadata } from 'next'
import './globals.css'
import { Sidebar } from '@/components/Sidebar'
import { SearchCmd } from '@/components/SearchCmd'
import { getAllDocs, getDocsByCategory } from '@/lib/docs'

export const metadata: Metadata = {
  title: 'Polymarket Knowledge Base',
  description: 'Polymarket trading knowledge base - theories, strategies, and frameworks',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const docs = getAllDocs()
  const categories = getDocsByCategory()

  return (
    <html lang="en">
      <body className="antialiased">
        <div className="flex min-h-[100dvh]">
          <Sidebar categories={categories} />
          <main className="flex-1 ml-64 p-8">
            {children}
          </main>
        </div>
        <SearchCmd docs={docs} />
      </body>
    </html>
  )
}
