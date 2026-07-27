export type Theme = 'light' | 'dark'

const themeStorageKey = 'solver-collection-theme'

function getStoredTheme(): Theme | null {
  try {
    const theme = window.localStorage.getItem(themeStorageKey)
    return theme === 'light' || theme === 'dark' ? theme : null
  } catch {
    return null
  }
}

function getSystemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function getPreferredTheme(): Theme {
  return getStoredTheme() ?? getSystemTheme()
}

export function applyTheme(theme: Theme, shouldPersist = false): void {
  document.documentElement.dataset.theme = theme
  document.documentElement.style.colorScheme = theme

  if (!shouldPersist) return

  try {
    window.localStorage.setItem(themeStorageKey, theme)
  } catch {
    // A blocked local storage should not prevent the visual setting from working.
  }
}

export function initializeTheme(): Theme {
  const theme = getPreferredTheme()
  applyTheme(theme)
  return theme
}
