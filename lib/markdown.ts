export function extractTitleFromMarkdown(content: string): string | null {
  const lines = content.split(/\r?\n/)
  for (const line of lines) {
    const m = /^#\s+(.+?)\s*$/.exec(line)
    if (m) return m[1]
  }
  return null
}
