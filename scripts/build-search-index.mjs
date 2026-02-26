import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

const contentDir = path.join(process.cwd(), 'content', 'poly-knowledge')
const outFile = path.join(process.cwd(), 'public', 'search-index.json')

function getAllFiles(dir) {
  const out = []
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name)
    if (ent.isDirectory()) out.push(...getAllFiles(full))
    else if (/\.mdx?$/.test(ent.name)) out.push(full)
  }
  return out
}

if (!fs.existsSync(contentDir)) {
  console.error('Missing content dir:', contentDir)
  process.exit(1)
}

const files = getAllFiles(contentDir)

const docs = files.map((file) => {
  const rel = path.relative(contentDir, file).replace(/\\/g, '/')
  const slug = rel.replace(/\.mdx?$/, '')
  const raw = fs.readFileSync(file, 'utf8')
  const { data, content } = matter(raw)
  const text = content
    .replace(/```[\s\S]*?```/g, ' ') // drop code blocks
    .replace(/`[^`]*`/g, ' ') // inline code
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1') // links
    .replace(/[#>*_\-|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return {
    slug,
    title: data.title || slug,
    description: data.description || '',
    category: data.category || '未分类',
    tags: data.tags || [],
    text,
  }
})

fs.mkdirSync(path.dirname(outFile), { recursive: true })
fs.writeFileSync(outFile, JSON.stringify({ generatedAt: new Date().toISOString(), docs }, null, 2))
console.log('Wrote', outFile, 'docs:', docs.length)
