'use client'

import { useEffect, useRef } from 'react'

export function HashScrollHandler() {
  const hasScrolled = useRef(false)

  useEffect(() => {
    // 防止重复执行
    if (hasScrolled.current) return
    hasScrolled.current = true

    const hash = window.location.hash.slice(1)
    if (hash) {
      // 延迟执行，确保 DOM 已渲染
      setTimeout(() => {
        const element = document.getElementById(hash)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          // 高亮显示
          element.classList.add('ring-2', 'ring-blue-500')
          setTimeout(() => {
            element.classList.remove('ring-2', 'ring-blue-500')
          }, 3000)
        }
      }, 100)
    }
  }, [])

  return null
}
