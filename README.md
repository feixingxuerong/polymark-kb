# polymark-kb

Knowledge base website for Polymarket research.

## 仪表盘有哪些块

- **状态仪表盘**：文档总数、Index 最后更新时间、Search Index 生成时间
- **最近更新**：最近 5 个文档（按文件修改时间排序）
- **索引章节状态**：index.md 中“章节/主题”表的状态展示
- **待补充章节**：状态为"待开始/待补充"的章节列表

## Live

- https://polymark-kb.vercel.app

## Content sync

Source of truth lives in `feixingxuerong/polymark-task` → `poly-knowledge/`.

This repo keeps a copy under:
- `content/poly-knowledge/`

### Automatic (GitHub Actions)

Workflow: `.github/workflows/sync-poly-knowledge.yml`
- runs every 2 hours
- also supports manual trigger (workflow_dispatch)

It checks out `feixingxuerong/polymark-task`, copies `poly-knowledge/` into this repo, commits and pushes.

### Local (dev)

If you have `polymark-task` cloned next to this repo:

```bash
npm run sync:local
npm run dev
```

## Dev

```bash
npm i
npm run dev
```

Cmd/Ctrl + K opens search.
