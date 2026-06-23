import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark' | 'system'

interface ThemeState {
  theme: Theme
  isDarkMode: boolean
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  initializeTheme: () => void
}

// Check if system prefers dark mode
const getSystemTheme = (): boolean => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

// Apply theme to document
const applyTheme = (isDark: boolean) => {
  if (isDark) {
    document.documentElement.classList.add('dark')
    document.documentElement.style.colorScheme = 'dark'
  } else {
    document.documentElement.classList.remove('dark')
    document.documentElement.style.colorScheme = 'light'
  }
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      isDarkMode: getSystemTheme(),

      setTheme: (theme: Theme) => {
        const isDarkMode = theme === 'system' ? getSystemTheme() : theme === 'dark'
        applyTheme(isDarkMode)
        set({ theme, isDarkMode })
      },

      toggleTheme: () => {
        const currentTheme = get().theme
        let newTheme: Theme
        
        if (currentTheme === 'light') {
          newTheme = 'dark'
        } else if (currentTheme === 'dark') {
          newTheme = 'light'
        } else {
          // If system, toggle based on current system preference
          newTheme = getSystemTheme() ? 'light' : 'dark'
        }
        
        const isDarkMode = newTheme === 'dark'
        applyTheme(isDarkMode)
        set({ theme: newTheme, isDarkMode })
      },

      initializeTheme: () => {
        const { theme } = get()
        const isDarkMode = theme === 'system' ? getSystemTheme() : theme === 'dark'
        applyTheme(isDarkMode)
        set({ isDarkMode })
        
        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        const handleChange = (e: MediaQueryListEvent) => {
          const { theme } = get()
          if (theme === 'system') {
            const isDark = e.matches
            applyTheme(isDark)
            set({ isDarkMode: isDark })
          }
        }
        
        mediaQuery.addEventListener('change', handleChange)
        
        // Cleanup on unmount (optional - for app-wide usage, keep it)
        return () => mediaQuery.removeEventListener('change', handleChange)
      },
    }),
    {
      name: 'theme-storage',
      getStorage: () => localStorage,
    }
  )
)