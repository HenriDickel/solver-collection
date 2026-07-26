<template>
  <main class="page-shell">
    <section class="hero" aria-labelledby="page-title">
      <p class="eyebrow">Solver Collection</p>
      <h1 id="page-title">Minesweeper Solver</h1>
      <p class="intro">
        Resolve simple Minesweeper boards with safe-cell and mine-flag deductions.
      </p>
    </section>

    <MinesweeperBoard />
  </main>
</template>

<script setup lang="ts">
import MinesweeperBoard from '../components/MinesweeperBoard.vue'
</script>
