'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// 실제 사용하는 테마 값 화이트리스트 — localStorage 손상값 방어
const VALID_THEMES: readonly Theme[] = ['light', 'dark', 'system']

function isValidTheme(value: string | null): value is Theme {
  return value !== null && (VALID_THEMES as readonly string[]).includes(value)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')
  // 복원이 끝나기 전에는 적용하지 않는다 — 초기값 'system'으로 한 번 칠해버리면
  // head 인라인 스크립트가 이미 올바르게 칠해둔 결과를 덮어 깜빡임이 생긴다.
  const [restored, setRestored] = useState(false)

  // 저장된 테마 복원 — 화이트리스트 검증 후 적용, 손상값이면 기본값(system) 폴백
  useEffect(() => {
    const stored = localStorage.getItem('theme')
    if (isValidTheme(stored)) {
      setTheme(stored)
    } else if (stored !== null) {
      // 손상된 값 정리
      localStorage.removeItem('theme')
    }
    setRestored(true)
  }, [])

  // 테마 적용 및 resolved theme 계산
  useEffect(() => {
    if (!restored) return
    const root = document.documentElement

    const applyTheme = () => {
      let isDark = false

      if (theme === 'system') {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      } else {
        isDark = theme === 'dark'
      }

      setResolvedTheme(isDark ? 'dark' : 'light')

      // Remove all theme classes first
      root.classList.remove('dark', 'light')

      if (isDark) {
        root.classList.add('dark')
        root.style.colorScheme = 'dark'
      } else {
        root.classList.add('light')
        root.style.colorScheme = 'light'
      }
    }

    applyTheme()

    // 시스템 테마 변경 감지
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = () => applyTheme()
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    }
  }, [theme, restored])

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme: handleSetTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}