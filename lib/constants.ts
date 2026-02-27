// Category types and constants for client components
// This file should NOT import server-only modules like 'fs'

export type FilterCategory = 'all' | 'weather' | 'aviation' | 'macro' | 'political' | 'crypto' | 'sports' | 'other'

export const FILTER_CATEGORIES: FilterCategory[] = ['all', 'weather', 'aviation', 'macro', 'political', 'crypto', 'sports', 'other']

// Category display names in Chinese
export const CATEGORY_LABELS: Record<FilterCategory, string> = {
  'all': '全部',
  'weather': '天气',
  'aviation': '航空',
  'macro': '宏观',
  'political': '政治',
  'crypto': 'Crypto',
  'sports': '体育',
  'other': '其它',
}

// Category detection keywords (duplicated from watchlist.ts for client-side use)
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'weather': ['weather', 'snow', 'rain', 'temperature', 'storm', 'hurricane', 'wind', 'fog', 'precipitation', '天气', '降雪', '降雨', '温度', '风暴'],
  'aviation': ['flight', 'airline', 'airport', 'pilot', 'aviation', 'delay', '取消', '航班', '机场', '飞行员'],
  'macro': ['gdp', 'inflation', 'unemployment', 'interest rate', 'fed', 'recession', 'gdp', 'cpi', 'pce', '宏观', 'gdp', '通胀', '失业率'],
  'political': ['election', 'trump', 'biden', 'congress', 'senate', 'president', 'vote', 'policy', '选举', '总统', '国会', '投票'],
  'crypto': ['bitcoin', 'btc', 'ethereum', 'eth', 'solana', 'sol', 'crypto', '加密', '币'],
  'sports': ['nba', 'nfl', 'mlb', 'nhl', 'soccer', 'football', 'tennis', 'game', 'match', 'score', 'win', '联赛', '比赛', '得分'],
}

export interface SimpleWatchlistItem {
  question: string
  reason: string
  category?: string
}

// Simple category detection for client-side filtering
export function detectCategoryClient(item: SimpleWatchlistItem): string {
  // Use existing category if available
  if (item.category && item.category !== 'unknown') {
    return item.category
  }

  const text = `${item.question} ${item.reason}`.toLowerCase()

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (text.includes(keyword.toLowerCase())) {
        return category
      }
    }
  }

  return 'other'
}
