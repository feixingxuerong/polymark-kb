import type { Metadata } from 'next'
import './globals.css'
import { Sidebar } from '@/components/Sidebar'
import { SearchCmd } from '@/components/SearchCmd'
import { MobileLayout } from '@/components/MobileLayout'
import { getDocsByCategory } from '@/lib/docs'
import { getIndexChapters } from '@/lib/nav'

export const metadata: Metadata = {
  title: 'Polymarket Knowledge Base',
  description: 'Polymarket trading knowledge base - theories, strategies, and frameworks',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const categories = getDocsByCategory()
  const chapters = getIndexChapters()

  return (
    <html lang="en">
      <body className="antialiased">
        <div className="flex min-h-[100dvh] bg-zinc-950 text-zinc-100">
          {/* Desktop sidebar - hidden on mobile */}
          <div className="hidden md:block fixed left-0 top-0 h-screen">
            <Sidebar categories={categories} chapters={chapters} />
          </div>
          
          {/* Mobile layout with header and drawer */}
          <MobileLayout categories={categories} chapters={chapters}>
            <main className="flex-1 md:ml-64 p-4 md:p-8">{children}</main>
          </MobileLayout>
        </div>
        <SearchCmd />
      </body>
    </html>
  )
}
