export const CATEGORY_ORDER: string[] = [
  'Meta',
  '基础概念',
  '费率结构',
  'Neg Risk',
  'API 集成',
  '策略研究',
  '风控框架',
  '结算争议',
  '市场数据',
  'Notes',
  'Temp',
  '未分类',
]

export function sortCategories(keys: string[]): string[] {
  const order = new Map(CATEGORY_ORDER.map((c, i) => [c, i]))
  return [...keys].sort((a, b) => {
    const ao = order.get(a) ?? 9999
    const bo = order.get(b) ?? 9999
    if (ao !== bo) return ao - bo
    return a.localeCompare(b)
  })
}

export function inferCategoryFromSlug(slug: string): string {
  const s = slug.toLowerCase()

  if (s === 'index' || s.endsWith('/index')) return 'Meta'
  if (s === 'sources' || s.includes('sources')) return 'Meta'
  if (s.includes('trade-readiness') || s.includes('checklist')) return 'Meta'

  if (s.includes('polymarket-docs') || s.includes('mission-charter') || s.includes('roadmap')) return '基础概念'
  if (s.includes('fees')) return '费率结构'
  if (s.includes('neg-risk') || s.includes('negrisk')) return 'Neg Risk'
  if (s.includes('api')) return 'API 集成'
  if (s.includes('profit') || s.includes('method')) return '策略研究'
  if (s.includes('risk') || s.includes('bankroll')) return '风控框架'
  if (s.includes('resolution') || s.includes('dispute')) return '结算争议'
  if (s.includes('market') || s.includes('watchlist') || s.includes('discovery')) return '市场数据'

  if (s.startsWith('notes/')) return 'Notes'
  if (s.startsWith('temp/')) return 'Temp'

  return '未分类'
}
