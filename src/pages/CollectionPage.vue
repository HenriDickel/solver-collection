<template>
  <main class="page-shell collection-page">
    <section class="collection-page-hero" aria-labelledby="page-title">
      <p class="eyebrow">{{ sectionCopy.eyebrow }}</p>
      <h1 id="page-title">{{ sectionCopy.title }}</h1>
      <p class="intro">{{ sectionCopy.description }}</p>
    </section>

    <section class="game-grid collection-page-grid" :aria-label="sectionCopy.title">
      <RouterLink
        v-for="(game, index) in gamesForSection"
        :key="game.slug"
        class="game-card game-card--play"
        :class="`game-card--${game.slug}`"
        :style="{ '--card-index': index }"
        :to="game.path"
      >
        <span class="game-card-glow" aria-hidden="true"></span>
        <div class="game-card-topline">
          <span class="game-card-symbol" aria-hidden="true">{{ game.symbol }}</span>
          <span class="game-card-category">{{ 'players' in game ? game.players : game.category }}</span>
        </div>
        <h2>{{ game.title }}</h2>
        <p>{{ game.description }}</p>
        <span class="game-card-link">Play now <span aria-hidden="true">→</span></span>
      </RouterLink>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { games as solverGames } from '../contexts/solvers/data/games'
import { multiplayerGames } from '../contexts/multiplayer/data/games'
import { singleplayerGames } from '../contexts/singleplayer/data/games'
import type { PlaySection } from '../contexts/shared/types/play-game'

type CollectionSection = PlaySection | 'solvers'

const props = defineProps<{ section: CollectionSection }>()

const sectionCopy = computed(() => (
  props.section === 'solvers'
    ? {
        description: 'Watch reliable visual solvers explain every deduction and move.',
        eyebrow: 'See the logic unfold',
        title: 'Visual solvers',
      }
    : props.section === 'singleplayer'
      ? {
        description: 'Take a quiet break with a puzzle or a quick match against the computer.',
        eyebrow: 'Play at your pace',
        title: 'Singleplayer games',
      }
    : {
        description: 'Pass one device around the room and turn it into your next game night.',
        eyebrow: 'Bring the room together',
        title: 'Multiplayer games',
      }
))
const gamesForSection = computed(() => {
  if (props.section === 'solvers') return solverGames
  return props.section === 'singleplayer' ? singleplayerGames : multiplayerGames
})
</script>
