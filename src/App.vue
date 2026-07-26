<template>
  <div>
    <header class="site-header">
      <nav class="site-nav" aria-label="Solver navigation">
        <RouterLink class="site-brand" to="/sudoku">Solver Collection</RouterLink>
        <div class="solver-nav-links">
          <RouterLink class="solver-nav-link" to="/sudoku">Sudoku</RouterLink>
          <RouterLink class="solver-nav-link" to="/minesweeper">Minesweeper</RouterLink>
        </div>
      </nav>
    </header>

    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>
