import { ref, watch, onMounted } from 'vue'

const isDark = ref(false)

export function useTheme() {
  const setTheme = (dark) => {
    isDark.value = dark
    if (dark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  const toggleTheme = () => {
    setTheme(!isDark.value)
  }

  const initTheme = () => {
    // Check localStorage first
    const stored = localStorage.getItem('theme')
    if (stored) {
      setTheme(stored === 'dark')
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(prefersDark)
    }

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches)
      }
    })
  }

  return {
    isDark,
    setTheme,
    toggleTheme,
    initTheme
  }
}
