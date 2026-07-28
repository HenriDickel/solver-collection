<template>
  <div>
    <header class="site-header">
      <nav class="site-nav" aria-label="Primary navigation">
        <RouterLink class="site-brand" to="/">
          <img class="site-brand-mark" :src="brandMarkUrl" alt="" aria-hidden="true" />
          <span class="site-brand-copy">
            <span>Bartagames</span>
            <span class="site-brand-subtitle">Puzzle &amp; game collection</span>
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
      <div class="collection-nav-shell">
        <nav class="collection-nav" aria-label="Game categories">
          <RouterLink class="collection-nav-link" :class="{ 'collection-nav-link--active': activeSection === 'multiplayer' }" to="/multiplayer">Multiplayer</RouterLink>
          <RouterLink class="collection-nav-link" :class="{ 'collection-nav-link--active': activeSection === 'singleplayer' }" to="/singleplayer">Singleplayer</RouterLink>
          <RouterLink class="collection-nav-link" :class="{ 'collection-nav-link--active': activeSection === 'solvers' }" to="/solvers">Solvers</RouterLink>
        </nav>
      </div>
    </header>

    <RouterView />

    <footer class="site-footer">
      <div class="site-footer-inner">
        <p class="site-footer-copyright">&copy; {{ currentYear }} Bartagames</p>
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
import { computed, ref } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { applyTheme, getPreferredTheme } from './contexts/shared/utils/theme'
import type { Theme } from './contexts/shared/utils/theme'

const currentYear = new Date().getFullYear()
const brandMarkUrl = `${import.meta.env.BASE_URL}bartagames-mark.png`
const theme = ref<Theme>(getPreferredTheme())
const route = useRoute()
const activeSection = computed(() => {
  if (route.path.startsWith('/play/') || route.path.startsWith('/singleplayer')) return 'singleplayer'
  if (route.path.startsWith('/party/') || route.path.startsWith('/multiplayer')) return 'multiplayer'
  return 'solvers'
})
function toggleTheme(): void {
  const nextTheme: Theme = theme.value === 'dark' ? 'light' : 'dark'
  applyTheme(nextTheme, true)
  theme.value = nextTheme
}

</script>
