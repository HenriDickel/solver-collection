<template>
  <div>
    <header class="site-header">
      <nav class="site-nav" aria-label="Primary navigation">
        <RouterLink class="site-brand" to="/">
          <img class="site-brand-mark" :src="faviconUrl" alt="" aria-hidden="true" />
          <span class="site-brand-copy">
            <span>Solver Collection</span>
            <span class="site-brand-subtitle">Interactive puzzle lab</span>
          </span>
        </RouterLink>
        <button
          class="theme-toggle"
          type="button"
          :aria-label="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
          :aria-pressed="theme === 'dark'"
          @click="toggleTheme"
        >
          <svg v-if="theme === 'dark'" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="4"></circle>
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"></path>
          </svg>
          <svg v-else viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20.2 15.3A8.5 8.5 0 0 1 8.7 3.8 8.5 8.5 0 1 0 20.2 15.3Z"></path>
          </svg>
          <span>{{ theme === 'dark' ? 'Light mode' : 'Dark mode' }}</span>
        </button>
      </nav>
      <div class="game-nav-shell">
        <nav class="game-nav" aria-label="Solver games">
          <RouterLink v-for="game in games" :key="game.slug" class="game-nav-link" :to="game.path">
            {{ game.title }}
          </RouterLink>
        </nav>
      </div>
    </header>

    <RouterView />

    <footer class="site-footer">
      <div class="site-footer-inner">
        <p class="site-footer-copyright">&copy; {{ currentYear }} Solver Collection</p>
        <nav class="site-footer-links" aria-label="Legal information">
          <RouterLink to="/privacy">Privacy</RouterLink>
          <RouterLink to="/legal-notice">Legal notice</RouterLink>
          <RouterLink to="/accessibility">Accessibility</RouterLink>
        </nav>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { games } from './data/games'
import { preloadFutoshikiExamples } from './stores/futoshiki'
import { preloadKenKenExamples } from './stores/kenken'
import { preloadMazeExamples } from './stores/maze'
import { preloadMinesweeperExamples } from './stores/minesweeper'
import { preloadNonogramExamples } from './stores/nonogram'
import { preloadNurikabeExamples } from './stores/nurikabe'
import { preloadSudokuExamples } from './stores/sudoku'
import { applyTheme, getPreferredTheme } from './utils/theme'
import type { Theme } from './utils/theme'

const currentYear = new Date().getFullYear()
const faviconUrl = `${import.meta.env.BASE_URL}favicon.svg`
const theme = ref<Theme>(getPreferredTheme())

function toggleTheme(): void {
  const nextTheme: Theme = theme.value === 'dark' ? 'light' : 'dark'
  applyTheme(nextTheme, true)
  theme.value = nextTheme
}

onMounted(() => {
  preloadSudokuExamples()
  preloadMinesweeperExamples()
  preloadMazeExamples()
  preloadNonogramExamples()
  preloadKenKenExamples()
  preloadFutoshikiExamples()
  preloadNurikabeExamples()
})
</script>
