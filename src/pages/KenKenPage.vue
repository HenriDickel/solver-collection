<template>
  <main class="page-shell">
    <section class="hero" aria-labelledby="page-title">
      <p class="eyebrow">Solver Collection</p>
      <h1 id="page-title">KenKen Solver</h1>
      <p class="intro">
        Fill every row and column while satisfying the arithmetic target of each cage.
      </p>
    </section>

    <KenKenBoard />
  </main>
</template>

<script setup lang="ts">
import KenKenBoard from '../components/KenKenBoard.vue'
</script>
