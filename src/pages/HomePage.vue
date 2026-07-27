<template>
  <main class="page-shell page-shell--home">
    <section class="collection-hero" aria-labelledby="page-title">
      <div class="collection-hero-copy">
        <p class="eyebrow">Interactive puzzle lab</p>
        <h1 id="page-title">Every puzzle has a path</h1>
        <p class="collection-hero-intro">
          Explore visual solvers that make each deduction, constraint, and next move easy to follow.
        </p>
        <div class="collection-hero-actions">
          <RouterLink class="hero-cta" :to="games[0].path">
            Start solving
            <span aria-hidden="true">→</span>
          </RouterLink>
          <a class="hero-secondary-action" href="#games">Browse all games</a>
        </div>
        <p class="collection-hero-meta">
          <span class="collection-hero-status" aria-hidden="true"></span>
          {{ games.length }} visual solvers
        </p>
      </div>

      <div class="collection-hero-visual" aria-hidden="true">
        <div class="hero-orbit hero-orbit--outer"></div>
        <div class="hero-orbit hero-orbit--inner"></div>
        <div class="hero-puzzle-core">
          <span v-for="tile in visualTiles" :key="tile" class="hero-puzzle-tile">{{ tile }}</span>
        </div>
        <span class="hero-spark hero-spark--one"></span>
        <span class="hero-spark hero-spark--two"></span>
        <span class="hero-spark hero-spark--three"></span>
      </div>
    </section>

    <section id="games" class="games-section" aria-labelledby="games-title">
      <div class="games-section-header">
        <div>
          <h2 id="games-title">SOLVER COLLECTION</h2>
        </div>
      </div>

      <div class="game-grid">
        <RouterLink
          v-for="(game, index) in games"
          :key="game.slug"
          class="game-card"
          :class="`game-card--${game.slug}`"
          :style="{ '--card-index': index }"
          :to="game.path"
        >
          <span class="game-card-glow" aria-hidden="true"></span>
          <div class="game-card-topline">
            <span class="game-card-symbol" aria-hidden="true">{{ game.symbol }}</span>
            <span class="game-card-category">{{ game.category }}</span>
          </div>
          <h3>{{ game.title }}</h3>
          <p>{{ game.description }}</p>
          <span class="game-card-link">
            Open solver
            <span aria-hidden="true">→</span>
          </span>
        </RouterLink>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { games } from '../data/games'

const visualTiles = ['1', '×', '3', '◼', '>', '9', '·', '2', '↗']
</script>
