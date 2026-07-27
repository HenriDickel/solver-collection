<template>
  <main class="page-shell">
    <section class="hero" aria-labelledby="page-title">
      <p class="eyebrow">{{ game.category }}</p>
      <h1 id="page-title">{{ game.title }}</h1>
      <p class="intro">{{ game.description }}</p>
    </section>

    <component :is="boardComponent" :title="game.title" />
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Component } from 'vue'
import FutoshikiBoard from '../components/FutoshikiBoard.vue'
import KenKenBoard from '../components/KenKenBoard.vue'
import MazeBoard from '../components/MazeBoard.vue'
import MinesweeperBoard from '../components/MinesweeperBoard.vue'
import NonogramBoard from '../components/NonogramBoard.vue'
import NurikabeBoard from '../components/NurikabeBoard.vue'
import SudokuBoard from '../components/SudokuBoard.vue'
import { getGameBySlug } from '../data/games'
import type { GameSlug } from '../types/game'

const props = defineProps<{ slug: GameSlug }>()

const boardComponents: Record<GameSlug, Component> = {
  futoshiki: FutoshikiBoard,
  kenken: KenKenBoard,
  maze: MazeBoard,
  minesweeper: MinesweeperBoard,
  nonogram: NonogramBoard,
  nurikabe: NurikabeBoard,
  sudoku: SudokuBoard,
}

const game = computed(() => getGameBySlug(props.slug))
const boardComponent = computed(() => boardComponents[props.slug])
</script>
