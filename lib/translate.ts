/**
 * Chinese translation utilities for Polymarket questions.
 * Uses regex/templates instead of heavy translation dependencies.
 */

// City name mapping (common cities)
const CITY_CN: Record<string, string> = {
  'new york': '纽约',
  'nyc': '纽约',
  'los angeles': '洛杉矶',
  'chicago': '芝加哥',
  'houston': '休斯顿',
  'phoenix': '凤凰城',
  'philadelphia': '费城',
  'san antonio': '圣安东尼奥',
  'san diego': '圣迭戈',
  'dallas': '达拉斯',
  'austin': '奥斯汀',
  'seattle': '西雅图',
  'denver': '丹佛',
  'boston': '波士顿',
  'miami': '迈阿密',
  'atlanta': '亚特兰大',
  'london': '伦敦',
  'paris': '巴黎',
  'berlin': '柏林',
  'tokyo': '东京',
  'beijing': '北京',
  'shanghai': '上海',
  'hong kong': '香港',
  'singapore': '新加坡',
  'sydney': '悉尼',
  'melbourne': '墨尔本',
  'dubai': '迪拜',
  'toronto': '多伦多',
  'vancouver': '温哥华',
  'seoul': '首尔',
  'taipei': '台北',
  'wellington': '惠灵顿',
}

/**
 * Convert Fahrenheit to Celsius
 */
function fahrenheitToCelsius(f: number): number {
  return Math.round((f - 32) * 5 / 9)
}

/**
 * Parse weather temperature question and return Chinese translation.
 * Returns null if parsing fails.
 */
export function translateWeatherQuestion(question: string): string | null {
  if (!question) return null

  const q = question.trim()

  // Pattern 1: "Will the highest temperature in {city} be {threshold}°F or higher on {date}?"
  // Examples: "Will the highest temperature in NYC be 50°F or higher on February 28?"
  const pattern1 = /Will the highest temperature in (.+?) be (\d+(?:\.\d+)?)\s*°?\s*F or higher on (.+?)\?$/i
  let match = q.match(pattern1)
  if (match) {
    const city = match[1].trim()
    const threshold = match[2]
    const date = match[3].trim()
    const cityCn = CITY_CN[city.toLowerCase()] || city
    const celsius = fahrenheitToCelsius(parseFloat(threshold))
    return `预测：${date} ${cityCn} 最高气温是否 ≥${threshold}°F（约${celsius}°C）`
  }

  // Pattern 2: "Will the highest temperature in {city} be {threshold}°C on {date}?"
  // Examples: "Will the highest temperature in Wellington be 19°C on February 28?"
  const pattern2 = /Will the highest temperature in (.+?) be (\d+(?:\.\d+)?)\s*°?\s*C on (.+?)\?$/i
  match = q.match(pattern2)
  if (match) {
    const city = match[1].trim()
    const threshold = match[2]
    const date = match[3].trim()
    const cityCn = CITY_CN[city.toLowerCase()] || city
    return `预测：${date} ${cityCn} 最高气温是否为 ${threshold}°C`
  }

  // Pattern 3: "Will the highest temperature in {city} be {threshold}°C or higher on {date}?"
  // Examples: "Will the highest temperature in Seoul be 14°C or higher on February 28?"
  const pattern3 = /Will the highest temperature in (.+?) be (\d+(?:\.\d+)?)\s*°?\s*C or higher on (.+?)\?$/i
  match = q.match(pattern3)
  if (match) {
    const city = match[1].trim()
    const threshold = match[2]
    const date = match[3].trim()
    const cityCn = CITY_CN[city.toLowerCase()] || city
    return `预测：${date} ${cityCn} 最高气温是否 ≥${threshold}°C`
  }

  // Pattern 4: "Will the highest temperature in {city} be {threshold}°F or below on {date}?"
  // Example: "Will the highest temperature in Dallas be 72°F or below on March 1?"
  const pattern4 = /Will the highest temperature in (.+?) be (\d+(?:\.\d+)?)\s*°?\s*F or below on (.+?)\?$/i
  match = q.match(pattern4)
  if (match) {
    const city = match[1].trim()
    const threshold = match[2]
    const date = match[3].trim()
    const cityCn = CITY_CN[city.toLowerCase()] || city
    const celsius = fahrenheitToCelsius(parseFloat(threshold))
    return `预测：${date} ${cityCn} 最高气温是否 ≤${threshold}°F（约${celsius}°C）`
  }

  // Pattern 5: Simple "Will {city} have {weather} on {date}?" or similar
  // Fallback: try to extract basic info
  const pattern5 = /Will (.+?) (have|get|experience|see) (.+?) on (.+?)\?$/i
  match = q.match(pattern5)
  if (match) {
    const city = match[1].trim()
    const weather = match[3].trim()
    const date = match[4].trim()
    const cityCn = CITY_CN[city.toLowerCase()] || city
    return `预测：${date} ${cityCn} 是否${weather}`
  }

  // Pattern 6: Bitcoin/crypto pattern - "Bitcoin Up or Down - {date}"
  const pattern6 = /Bitcoin Up or Down - (.+?)(?:,|$)/i
  match = q.match(pattern6)
  if (match) {
    const date = match[1].trim()
    return `预测：比特币在 ${date} 涨跌`
  }

  // Pattern 7: Generic "Will X happen on date?" 
  const pattern7 = /^Will (.+?) (.+?) on (.+?)\?$/i
  match = q.match(pattern7)
  if (match) {
    const subject = match[1].trim()
    const verb = match[2].trim()
    const date = match[3].trim()
    return `预测：${date} ${subject} 是否${verb}`
  }

  return null
}

/**
 * Check if a question is a weather-related question
 */
export function isWeatherQuestion(question: string): boolean {
  if (!question) return false
  const q = question.toLowerCase()
  return q.includes('temperature') || q.includes('weather') || q.includes('snow') || 
         q.includes('rain') || q.includes('storm') || q.includes('hurricane')
}
