import { useEffect, useState } from 'react'

const SITE_BG = { light: '#dfe4ee', dark: '#050507' } as const

function syncThemeColorMeta(theme: string) {
  const meta = document.getElementById('theme-color-meta')
  meta?.setAttribute('content', theme === 'dark' ? SITE_BG.dark : SITE_BG.light)
}

export function useDarkMode() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('theme') || 'light'
    } catch (e) {
      console.warn(e)
      return 'light'
    }
  })

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
    syncThemeColorMeta(theme)
    try {
      localStorage.setItem('theme', theme)
    } catch (e) {
      console.warn(e)
    }
  }, [theme])

  return [theme, setTheme] as const
}
