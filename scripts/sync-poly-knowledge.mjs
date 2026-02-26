import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true })
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name)
    const d = path.join(dest, entry.name)
    if (entry.isDirectory()) copyDir(s, d)
    else fs.copyFileSync(s, d)
  }
}

function emptyDir(dest) {
  if (!fs.existsSync(dest)) return
  for (const entry of fs.readdirSync(dest)) {
    fs.rmSync(path.join(dest, entry), { recursive: true, force: true })
  }
}

const repoRoot = path.join(__dirname, '..')
const src = path.join(repoRoot, '..', 'polymark-task', 'poly-knowledge')
const dest = path.join(repoRoot, 'content', 'poly-knowledge')

if (!fs.existsSync(src)) {
  console.error(`Source not found: ${src}`)
  console.error('Tip: clone feixingxuerong/polymark-task next to this repo, or use GitHub Actions sync.')
  process.exit(1)
}

emptyDir(dest)
copyDir(src, dest)
console.log(`Synced poly-knowledge -> ${dest}`)
