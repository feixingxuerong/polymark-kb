# polymark-kb

Knowledge base website for Polymarket research.

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
