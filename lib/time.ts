/**
 * Format time for display in Asia/Shanghai timezone.
 * - Input: Date | ISO string | null
 * - Output: '2月27日 15:50' (same year) or '2026年2月27日 15:50' (cross year)
 * - Returns '-' on failure
 */

const SHANGHAI_TZ = 'Asia/Shanghai'

/**
 * Get current year in Shanghai timezone
 */
function getCurrentYearInShanghai(): number {
  const now = new Date()
  return parseInt(
    now.toLocaleString('zh-CN', { timeZone: SHANGHAI_TZ, year: 'numeric' }),
    10
  )
}

/**
 * Format time short - consistent display for Index last updated and Search index generatedAt.
 * Uses Shanghai timezone (Asia/Shanghai) for consistency.
 */
export function formatTimeShort(input: Date | string | null | undefined): string {
  if (!input) return '-'

  let date: Date
  try {
    date = input instanceof Date ? input : new Date(input)
    if (isNaN(date.getTime())) return '-'
  } catch {
    return '-'
  }

  // Get year, month, day, hour, minute in Shanghai timezone
  const year = parseInt(
    date.toLocaleString('zh-CN', { timeZone: SHANGHAI_TZ, year: 'numeric' }),
    10
  )
  const month = parseInt(
    date.toLocaleString('zh-CN', { timeZone: SHANGHAI_TZ, month: 'numeric' }),
    10
  )
  const day = parseInt(
    date.toLocaleString('zh-CN', { timeZone: SHANGHAI_TZ, day: 'numeric' }),
    10
  )
  const hour = parseInt(
    date.toLocaleString('zh-CN', { timeZone: SHANGHAI_TZ, hour: 'numeric', hour12: false }),
    10
  )
  const minute = parseInt(
    date.toLocaleString('zh-CN', { timeZone: SHANGHAI_TZ, minute: 'numeric' }),
    10
  )

  const currentYear = getCurrentYearInShanghai()

  // Format: '2026年2月27日 15:50' or '2月27日 15:50'
  const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
  const dateStr = `${month}月${day}日`

  if (year !== currentYear) {
    return `${year}年${dateStr} ${timeStr}`
  }

  return `${dateStr} ${timeStr}`
}
