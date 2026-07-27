<template>
  <div>
    <header class="site-header">
      <nav class="site-nav" aria-label="Primary navigation">
        <RouterLink class="site-brand" to="/">
          <span class="site-brand-mark" aria-hidden="true">S</span>
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
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { games } from './data/games'
</script>
