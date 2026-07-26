<template>
  <main class="page-shell">
    <section class="hero" aria-labelledby="page-title">
      <p class="eyebrow">Vue &middot; Pinia &middot; Tailwind</p>
      <h1 id="page-title">Sudoku Solver</h1>
      <p class="intro">
        Build, inspect, and solve Sudoku puzzles step by step with live candidate analysis.
      </p>
    </section>

    <SudokuBoard />
  </main>
</template>

<script setup lang="ts">
import SudokuBoard from '../components/SudokuBoard.vue'
</script>
