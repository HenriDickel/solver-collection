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
import { onMounted } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { games } from './data/games'
import { preloadFutoshikiExamples } from './stores/futoshiki'
import { preloadKenKenExamples } from './stores/kenken'
import { preloadMazeExamples } from './stores/maze'
import { preloadMinesweeperExamples } from './stores/minesweeper'
import { preloadNonogramExamples } from './stores/nonogram'
import { preloadNurikabeExamples } from './stores/nurikabe'
import { preloadSudokuExamples } from './stores/sudoku'

const currentYear = new Date().getFullYear()
const faviconUrl = `${import.meta.env.BASE_URL}favicon.svg`

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
