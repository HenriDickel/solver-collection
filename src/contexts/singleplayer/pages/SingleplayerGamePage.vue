<template>
  <main class="page-shell play-page">
    <section class="hero" aria-labelledby="page-title">
      <p class="eyebrow">Singleplayer</p>
      <h1 id="page-title">{{ game.title }}</h1>
      <p class="intro">{{ game.description }}</p>
    </section>

    <SudokuGame v-if="game.slug === 'sudoku'" />
    <MinesweeperGame v-else-if="game.slug === 'minesweeper'" />
    <ChessGame v-else-if="game.slug === 'chess'" />
    <NonogramGame v-else-if="game.slug === 'nonogram'" />
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ChessGame from '../components/ChessGame.vue'
import MinesweeperGame from '../components/MinesweeperGame.vue'
import NonogramGame from '../components/NonogramGame.vue'
import SudokuGame from '../components/SudokuGame.vue'
import { getSingleplayerGameBySlug } from '../data/games'
import type { SingleplayerGameSlug } from '../../shared/types/play-game'

const props = defineProps<{ slug: SingleplayerGameSlug }>()
const game = computed(() => getSingleplayerGameBySlug(props.slug))
</script>
