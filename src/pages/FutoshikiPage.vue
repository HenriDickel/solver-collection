<template>
  <main class="page-shell">
    <section class="hero" aria-labelledby="page-title">
      <p class="eyebrow">Solver Collection</p>
      <h1 id="page-title">Futoshiki Solver</h1>
      <p class="intro">
        Resolve a Latin square while respecting every greater-than and less-than relation.
      </p>
    </section>

    <FutoshikiBoard />
  </main>
</template>

<script setup lang="ts">
import FutoshikiBoard from '../components/FutoshikiBoard.vue'
</script>
