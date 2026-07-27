<template>
  <main class="page-shell">
    <section class="hero" aria-labelledby="page-title">
      <p class="eyebrow">Solver Collection</p>
      <h1 id="page-title">Nurikabe Solver</h1>
      <p class="intro">
        Grow numbered islands to their exact size while keeping one continuous sea.
      </p>
    </section>

    <NurikabeBoard />
  </main>
</template>

<script setup lang="ts">
import NurikabeBoard from '../components/NurikabeBoard.vue'
</script>
