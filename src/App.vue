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
        <p class="site-footer-copyright">© {{ currentYear }} Solver Collection</p>
        <nav class="site-footer-links" aria-label="Rechtliche Informationen">
          <RouterLink to="/datenschutz">Datenschutz</RouterLink>
          <RouterLink to="/impressum">Impressum</RouterLink>
          <RouterLink to="/barrierefreiheit">Barrierefreiheit</RouterLink>
        </nav>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { games } from './data/games'

const currentYear = new Date().getFullYear()
const faviconUrl = `${import.meta.env.BASE_URL}favicon.svg`
</script>
