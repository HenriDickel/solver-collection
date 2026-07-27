<template>
  <section class="solver-layout" aria-label="Nurikabe solver">
    <article
      class="board-card"
      :class="{
        'board-card--editing': solverMode === 'ready',
        'board-card--solving': solverMode !== 'ready',
      }"
      aria-labelledby="board-title"
    >
      <div class="board-header">
        <h2 id="board-title">Nurikabe</h2>
        <span class="progress-pill">{{ resolvedCells }} / 81 resolved</span>
      </div>

      <div class="nurikabe-board" role="grid" aria-label="Nurikabe board">
        <template v-for="(row, rowIndex) in board" :key="rowIndex">
          <NurikabeCell
            v-for="(cell, columnIndex) in row"
            :key="`${rowIndex}-${columnIndex}`"
            :cell="cell"
            :column-index="columnIndex"
            :is-recently-updated="recentlyUpdatedCells.includes(`${rowIndex}-${columnIndex}`)"
            :row-index="rowIndex"
          />
        </template>
      </div>

      <div class="solver-controls" :aria-busy="isAutoSolving">
        <button class="clear-button" type="button" @click="nurikabeStore.resetBoard()">Reset</button>
        <button
          v-if="solverMode === 'ready' || solverMode === 'solving'"
          class="solver-button"
          type="button"
          :disabled="isAutoSolving"
          @click="nurikabeStore.advanceSolver()"
        >
          {{ solverMode === 'ready' ? 'Start solving' : 'Solve next step' }}
        </button>
        <button
          v-if="solverMode === 'ready' || solverMode === 'solving'"
          class="auto-button"
          type="button"
          :disabled="isAutoSolving"
          @click="nurikabeStore.autoSolve()"
        >
          {{ isAutoSolving ? 'Auto solving…' : 'Auto solve' }}
        </button>
        <span v-else class="solver-status" :class="`solver-status--${solverMode}`">
          {{ solverMode === 'solved' ? 'Solved' : 'No further strategy' }}
        </span>
      </div>
    </article>

    <SolverTerminal :logs="logs" :mode="solverMode" />
  </section>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import NurikabeCell from './NurikabeCell.vue'
import SolverTerminal from './SolverTerminal.vue'
import { useNurikabeStore } from '../stores/nurikabe'

const nurikabeStore = useNurikabeStore()
const { board, isAutoSolving, logs, recentlyUpdatedCells, resolvedCells, solverMode } = storeToRefs(nurikabeStore)
</script>
