<template>
  <main class="page-shell">
    <section class="hero" aria-labelledby="page-title">
      <p class="eyebrow">Solver Collection</p>
      <h1 id="page-title">Nonogram Solver</h1>
      <p class="intro">
        Resolve a picture puzzle by comparing every row and column with its clues.
      </p>
    </section>

    <NonogramBoard />
  </main>
</template>

<script setup lang="ts">
import NonogramBoard from '../components/NonogramBoard.vue'
</script>
