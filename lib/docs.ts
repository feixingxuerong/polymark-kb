import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const contentDir = path.join(process.cwd(), 'content/poly-knowledge')

export interface DocMeta {
  slug: string
  title: string
  description?: string
  category?: string
  tags?: string[]
  updatedAt?: string
}

export interface Doc extends DocMeta {
  content: string
}

export function getAllDocs(): DocMeta[] {
  if (!fs.existsSync(contentDir)) return []

  const files = getAllFiles(contentDir)
  
  return files.map(file => {
    const relativePath = path.relative(contentDir, file)
    const slug = relativePath.replace(/\.mdx?$/, '').replace(/\\/g, '/')
    const fileContent = fs.readFileSync(file, 'utf-8')
    const { data } = matter(fileContent)
    
    return {
      slug,
      title: data.title || slug,
      description: data.description,
      category: data.category,
      tags: data.tags,
      updatedAt: data.updatedAt
    }
  }).sort((a, b) => a.slug.localeCompare(b.slug))
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
  
  return {
    slug,
    title: data.title || slug,
    description: data.description,
    category: data.category,
    tags: data.tags,
    updatedAt: data.updatedAt,
    content
  }
}

export function getDocsByCategory(): Record<string, DocMeta[]> {
  const docs = getAllDocs()
  const categories: Record<string, DocMeta[]> = {}
  
  for (const doc of docs) {
    const category = doc.category || '未分类'
    if (!categories[category]) {
      categories[category] = []
    }
    categories[category].push(doc)
  }
  
  return categories
}
