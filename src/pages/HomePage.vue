<template>
  <main class="page-shell page-shell--home">
    <section class="collection-hero" aria-labelledby="page-title">
      <div class="collection-hero-copy">
        <p class="eyebrow">Solvers, solo games &amp; party nights</p>
        <h1 id="page-title">Find a game for every kind of room</h1>
        <p class="collection-hero-intro">
          Watch logic unfold, settle into a solo challenge, or pass one device around for the next great group game.
        </p>
        <div class="collection-hero-actions">
          <RouterLink class="hero-cta" to="/singleplayer">
            Start playing
            <span aria-hidden="true">&rarr;</span>
          </RouterLink>
          <a class="hero-secondary-action" href="#collections">Browse collections</a>
        </div>
        <p class="collection-hero-meta">
          <span class="collection-hero-status" aria-hidden="true"></span>
          {{ games.length + singleplayerGames.length + multiplayerGames.length }} ways to play
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

    <section id="collections" class="collection-mode-grid" aria-label="Collections">
      <RouterLink class="collection-mode-card collection-mode-card--solvers" to="/solvers">
        <span>01</span>
        <h2>Solvers</h2>
        <p>Visual explanations for puzzle logic.</p>
        <strong>{{ games.length }} experiences <i aria-hidden="true">&rarr;</i></strong>
      </RouterLink>
      <RouterLink class="collection-mode-card collection-mode-card--singleplayer" to="/singleplayer">
        <span>02</span>
        <h2>Singleplayer</h2>
        <p>Quiet challenges, built for your pace.</p>
        <strong>{{ singleplayerGames.length }} games <i aria-hidden="true">&rarr;</i></strong>
      </RouterLink>
      <RouterLink class="collection-mode-card collection-mode-card--multiplayer" to="/multiplayer">
        <span>03</span>
        <h2>Multiplayer</h2>
        <p>Local party games for one shared device.</p>
        <strong>{{ multiplayerGames.length }} games <i aria-hidden="true">&rarr;</i></strong>
      </RouterLink>
    </section>

    <section class="games-section" aria-labelledby="solvers-title">
      <div class="games-section-header">
        <div>
          <p class="eyebrow">Watch the logic</p>
          <h2 id="solvers-title">Visual solvers</h2>
        </div>
        <RouterLink class="section-link" to="/solvers">See all solvers &rarr;</RouterLink>
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
            <span class="game-card-symbol" aria-hidden="true"><GameIcon :slug="game.slug" /></span>
            <span class="game-card-category">{{ game.category }}</span>
          </div>
          <h3>{{ game.title }}</h3>
          <p>{{ game.description }}</p>
          <span class="game-card-link">Open solver <span aria-hidden="true">&rarr;</span></span>
        </RouterLink>
      </div>
    </section>

    <section class="games-section" aria-labelledby="singleplayer-title">
      <div class="games-section-header">
        <div>
          <p class="eyebrow">Play at your pace</p>
          <h2 id="singleplayer-title">Singleplayer</h2>
        </div>
        <RouterLink class="section-link" to="/singleplayer">See all solo games &rarr;</RouterLink>
      </div>

      <div class="game-grid">
        <RouterLink
          v-for="(game, index) in singleplayerGames"
          :key="game.slug"
          class="game-card game-card--play"
          :class="`game-card--${game.slug}`"
          :style="{ '--card-index': index }"
          :to="game.path"
        >
          <span class="game-card-glow" aria-hidden="true"></span>
          <div class="game-card-topline">
            <span class="game-card-symbol" aria-hidden="true"><GameIcon :slug="game.slug" /></span>
            <span class="game-card-category">{{ game.players }}</span>
          </div>
          <h3>{{ game.title }}</h3>
          <p>{{ game.description }}</p>
          <span class="game-card-link">Play now <span aria-hidden="true">&rarr;</span></span>
        </RouterLink>
      </div>
    </section>

    <section class="games-section" aria-labelledby="multiplayer-title">
      <div class="games-section-header">
        <div>
          <p class="eyebrow">Pass the device</p>
          <h2 id="multiplayer-title">Multiplayer</h2>
        </div>
        <RouterLink class="section-link" to="/multiplayer">See all party games &rarr;</RouterLink>
      </div>

      <div class="game-grid">
        <RouterLink
          v-for="(game, index) in multiplayerGames"
          :key="game.slug"
          class="game-card game-card--play"
          :class="`game-card--${game.slug}`"
          :style="{ '--card-index': index }"
          :to="game.path"
        >
          <span class="game-card-glow" aria-hidden="true"></span>
          <div class="game-card-topline">
            <span class="game-card-symbol" aria-hidden="true"><GameIcon :slug="game.slug" /></span>
            <span class="game-card-category">{{ game.players }}</span>
          </div>
          <h3>{{ game.title }}</h3>
          <p>{{ game.description }}</p>
          <span class="game-card-link">Start game <span aria-hidden="true">&rarr;</span></span>
        </RouterLink>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import GameIcon from '../components/GameIcon.vue'
import { games } from '../contexts/solvers/data/games'
import { multiplayerGames } from '../contexts/multiplayer/data/games'
import { singleplayerGames } from '../contexts/singleplayer/data/games'

const visualTiles = ['1', 'x', '3', '+', '>', '9', '.', '2', '^']
</script>
