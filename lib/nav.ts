import fs from 'node:fs'
import path from 'node:path'

export type IndexChapter = {
  name: string
  desc: string
  status: string
}

/**
 * Parse `content/poly-knowledge/index.md` “章节/主题” table into ordered chapters.
 * Best-effort parser (no heavy markdown deps).
 */
export function getIndexChapters(): IndexChapter[] {
  const indexPath = path.join(process.cwd(), 'content/poly-knowledge/index.md')
  if (!fs.existsSync(indexPath)) return []
  const raw = fs.readFileSync(indexPath, 'utf8')

  const start = raw.indexOf('## 章节/主题')
  if (start < 0) return []
  const after = raw.slice(start)

  // Find first markdown table block after the heading.
  const lines = after.split(/\r?\n/)
  const tableLines: string[] = []
  let inTable = false

  for (const line of lines) {
    if (!inTable) {
      if (line.trim().startsWith('|') && line.includes('章节') && line.includes('状态')) {
        inTable = true
        tableLines.push(line)
        continue
      }
    } else {
      if (!line.trim().startsWith('|')) break
      tableLines.push(line)
    }
  }

  // tableLines now include header + separator + rows.
  const rows = tableLines
    .filter((l) => l.trim().startsWith('|'))
    .slice(2) // drop header + ---
    .map((l) => l.split('|').slice(1, -1).map((c) => c.trim()))
    .filter((cols) => cols.length >= 3)

  return rows.map(([name, desc, status]) => ({
    name: stripBold(name),
    desc,
    status,
  }))
}

function stripBold(s: string) {
  return s.replace(/\*\*/g, '').trim()
}
