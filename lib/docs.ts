import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { inferCategoryFromSlug } from '@/lib/category'
import { extractTitleFromMarkdown } from '@/lib/markdown'
import { getIndexChapters } from '@/lib/nav'

const contentDir = path.join(process.cwd(), 'content/poly-knowledge')

export interface DocMeta {
  slug: string
  title: string
  description?: string
  category?: string
  tags?: string[]
  updatedAt?: string
  order?: number
  mtime?: string
  sources?: string[]
}

export interface Doc extends DocMeta {
  content: string
  mtime?: string
}

/**
 * Get file stats for a doc by slug.
 */
export function getDocStat(slug: string): { mtime: string; size: number } | null {
  const filePath = path.join(contentDir, `${slug}.md`)
  const filePathMd = path.join(contentDir, `${slug}.mdx`)

  let fullPath = ''
  if (fs.existsSync(filePath)) {
    fullPath = filePath
  } else if (fs.existsSync(filePathMd)) {
    fullPath = filePathMd
  } else {
    return null
  }

  const stats = fs.statSync(fullPath)
  return {
    mtime: stats.mtime.toISOString(),
    size: stats.size,
  }
}

export function getAllDocs(): DocMeta[] {
  if (!fs.existsSync(contentDir)) return []

  const files = getAllFiles(contentDir)
  
  return files
    .map((file) => {
      const relativePath = path.relative(contentDir, file)
      const slug = relativePath.replace(/\.mdx?$/, '').replace(/\\/g, '/')
      const fileContent = fs.readFileSync(file, 'utf-8')
      const { data, content } = matter(fileContent)

      const title = (data.title as string | undefined) || extractTitleFromMarkdown(content) || slug
      const category = (data.category as string | undefined) || inferCategoryFromSlug(slug)
      const description = data.description as string | undefined

      return {
        slug,
        title,
        description,
        category,
        tags: data.tags as string[] | undefined,
        updatedAt: data.updatedAt as string | undefined,
        order: typeof data.order === 'number' ? (data.order as number) : undefined,
      }
    })
    .sort((a, b) => {
      const ao = a.order ?? 9999
      const bo = b.order ?? 9999
      if (ao !== bo) return ao - bo
      return a.slug.localeCompare(b.slug)
    })
}

function getAllFiles(dir: string): string[] {
  const files: string[] = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...getAllFiles(fullPath))
    } else if (entry.name.match(/\.mdx?$/)) {
      files.push(fullPath)
    }
  }
  
  return files
}

export function getDocBySlug(slug: string): Doc | null {
  const filePath = path.join(contentDir, `${slug}.md`)
  const filePathMd = path.join(contentDir, `${slug}.mdx`)

  let fullPath = ''
  if (fs.existsSync(filePath)) {
    fullPath = filePath
  } else if (fs.existsSync(filePathMd)) {
    fullPath = filePathMd
  } else {
    return null
  }

  const fileContent = fs.readFileSync(fullPath, 'utf-8')
  const { data, content } = matter(fileContent)

  const title = (data.title as string | undefined) || extractTitleFromMarkdown(content) || slug
  const category = (data.category as string | undefined) || inferCategoryFromSlug(slug)

  // Get file modification time
  const stats = fs.statSync(fullPath)

  return {
    slug,
    title,
    description: data.description as string | undefined,
    category,
    tags: data.tags as string[] | undefined,
    updatedAt: data.updatedAt as string | undefined,
    content,
    mtime: stats.mtime.toISOString(),
    sources: data.sources as string[] | undefined,
  }
}

export function getDocsByCategory(): Record<string, DocMeta[]> {
  const docs = getAllDocs()
  const categories: Record<string, DocMeta[]> = {}

  for (const doc of docs) {
    const category = doc.category || '未分类'
    if (!categories[category]) categories[category] = []
    categories[category].push(doc)
  }

  // Order categories by index.md chapter table first, then fallback alphabetical.
  const chapters = getIndexChapters().map((c) => c.name)
  const chapterOrder = new Map(chapters.map((c, i) => [c, i]))

  const keys = Object.keys(categories)
  keys.sort((a, b) => {
    const ao = chapterOrder.get(a) ?? 9999
    const bo = chapterOrder.get(b) ?? 9999
    if (ao !== bo) return ao - bo
    return a.localeCompare(b)
  })

  const ordered: Record<string, DocMeta[]> = {}
  for (const k of keys) ordered[k] = categories[k]
  return ordered
}

/**
 * Get recent N docs by file modification time.
 */
export function getRecentDocs(limit: number = 5): DocMeta[] {
  if (!fs.existsSync(contentDir)) return []

  const files = getAllFiles(contentDir)
  
  const docsWithMtime = files
    .map((file) => {
      const relativePath = path.relative(contentDir, file)
      const slug = relativePath.replace(/\.mdx?$/, '').replace(/\\/g, '/')
      const stats = fs.statSync(file)
      const fileContent = fs.readFileSync(file, 'utf-8')
      const { data, content } = matter(fileContent)

      const title = (data.title as string | undefined) || extractTitleFromMarkdown(content) || slug
      const category = (data.category as string | undefined) || inferCategoryFromSlug(slug)

      return {
        slug,
        title,
        description: data.description as string | undefined,
        category,
        tags: data.tags as string[] | undefined,
        updatedAt: data.updatedAt as string | undefined,
        order: typeof data.order === 'number' ? (data.order as number) : undefined,
        mtime: stats.mtimeMs,
      }
    })
    .sort((a, b) => b.mtime - a.mtime)
    .slice(0, limit)
    .map(({ mtime, ...doc }) => ({
      ...doc,
      mtime: new Date(mtime).toISOString(),
    }))

  return docsWithMtime
}

/**
 * Get sync status from index.md - find "Last updated" line.
 */
export function getIndexSyncInfo(): { lastUpdated: string | null; generatedAt: string | null } {
  const indexPath = path.join(process.cwd(), 'content/poly-knowledge/index.md')
  const searchIndexPath = path.join(process.cwd(), 'public/search-index.json')

  let lastUpdated: string | null = null
  let generatedAt: string | null = null

  // 1) Primary: Use fs.statSync to get file modification time
  if (fs.existsSync(indexPath)) {
    try {
      const stats = fs.statSync(indexPath)
      lastUpdated = stats.mtime.toISOString()
    } catch {
      // Fall through to other methods
    }
  }

  // 2) Fallback: If mtime didn't work, try parsing index.md content for "Last updated" line
  // Support multiple formats: "Last updated: 2024年12月25日", "Last updated: 2024-12-25", "Last updated: 2024/12/25"
  if (!lastUpdated && fs.existsSync(indexPath)) {
    try {
      const raw = fs.readFileSync(indexPath, 'utf8')
      // Match "Last updated" with various date formats
      const match = raw.match(/Last updated[:\s]*(\d{4}[年/-]\d{1,2}[月/-]\d{1,2}[日]?)/i)
      if (match) {
        lastUpdated = match[1].replace(/年/g, '-').replace(/月/g, '-').replace(/日/g, '')
        // Ensure ISO format
        if (!lastUpdated.includes('T')) {
          const parts = lastUpdated.split('-')
          if (parts.length === 3) {
            lastUpdated = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}T00:00:00.000Z`
          }
        }
      }
    } catch {
      // Fall through
    }
  }

  // 3) Final fallback: Parse changelog dates (### YYYY-MM-DD) from index.md
  if (!lastUpdated && fs.existsSync(indexPath)) {
    try {
      const raw = fs.readFileSync(indexPath, 'utf8')
      // Find all changelog dates like "### 2026-02-27"
      const dateMatches = raw.match(/^###\s+(\d{4}-\d{2}-\d{2})/gm)
      if (dateMatches && dateMatches.length > 0) {
        // Get the last (most recent) date
        const lastDate = dateMatches[dateMatches.length - 1].replace('###', '').trim()
        lastUpdated = `${lastDate}T00:00:00.000Z`
      }
    } catch {
      // Fall through
    }
  }

  // Read search-index.json generatedAt (always available as fallback)
  if (fs.existsSync(searchIndexPath)) {
    try {
      const indexData = JSON.parse(fs.readFileSync(searchIndexPath, 'utf8'))
      generatedAt = indexData.generatedAt || null
    } catch {
      // ignore parse errors
    }
  }

  return { lastUpdated, generatedAt }
}
