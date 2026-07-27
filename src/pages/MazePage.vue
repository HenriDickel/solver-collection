<template>
  <main class="page-shell">
    <section class="hero" aria-labelledby="page-title">
      <p class="eyebrow">Solver Collection</p>
      <h1 id="page-title">Maze Solver</h1>
      <p class="intro">
        Find the shortest route through a maze, one breadth-first search layer at a time.
      </p>
    </section>

    <MazeBoard />
  </main>
</template>

<script setup lang="ts">
import MazeBoard from '../components/MazeBoard.vue'
</script>
