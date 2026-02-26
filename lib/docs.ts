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
}

export interface Doc extends DocMeta {
  content: string
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

  return {
    slug,
    title,
    description: data.description as string | undefined,
    category,
    tags: data.tags as string[] | undefined,
    updatedAt: data.updatedAt as string | undefined,
    content,
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
