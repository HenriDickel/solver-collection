<template>
  <main class="page-shell play-page">
    <section class="hero" aria-labelledby="page-title">
      <p class="eyebrow">{{ game.section === 'singleplayer' ? 'Singleplayer' : 'Multiplayer · one shared device' }}</p>
      <h1 id="page-title">{{ game.title }}</h1>
      <p class="intro">{{ game.description }}</p>
    </section>

    <SudokuGame v-if="game.slug === 'sudoku'" />
    <ChessGame v-else-if="game.slug === 'chess'" />
    <NonogramGame v-else-if="game.slug === 'nonogram'" />
    <PartyGame v-else :game="game" />
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ChessGame from '../components/play/ChessGame.vue'
import NonogramGame from '../components/play/NonogramGame.vue'
import PartyGame from '../components/play/PartyGame.vue'
import SudokuGame from '../components/play/SudokuGame.vue'
import { getPlayGameBySlug } from '../data/play-games'
import type { PlayGameSlug } from '../types/play-game'

const props = defineProps<{ slug: PlayGameSlug }>()

const game = computed(() => getPlayGameBySlug(props.slug))
</script>
