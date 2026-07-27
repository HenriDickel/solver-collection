<template>
  <section class="solver-layout" aria-label="KenKen solver">
    <article
      class="board-card"
      :class="{
        'board-card--editing': solverMode === 'ready',
        'board-card--solving': solverMode !== 'ready',
      }"
      aria-labelledby="board-title"
    >
      <div class="board-header">
        <h2 id="board-title">KenKen</h2>
        <span class="progress-pill">{{ resolvedCells }} / 16 resolved</span>
      </div>

      <div class="kenken-board" role="grid" aria-label="KenKen board">
        <svg class="kenken-cage-lines" viewBox="0 0 4 4" preserveAspectRatio="none" aria-hidden="true">
          <line
            v-for="line in cageLines"
            :key="line.key"
            :x1="line.x1"
            :x2="line.x2"
            :y1="line.y1"
            :y2="line.y2"
            vector-effect="non-scaling-stroke"
          />
        </svg>
        <template v-for="(row, rowIndex) in board" :key="rowIndex">
          <KenKenCell
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
        <button class="clear-button" type="button" @click="kenKenStore.resetBoard()">Reset</button>
        <button
          v-if="solverMode === 'ready' || solverMode === 'solving'"
          class="solver-button"
          type="button"
          :disabled="isAutoSolving"
          @click="kenKenStore.advanceSolver()"
        >
          {{ solverMode === 'ready' ? 'Start solving' : 'Solve next step' }}
        </button>
        <button
          v-if="solverMode === 'ready' || solverMode === 'solving'"
          class="auto-button"
          type="button"
          :disabled="isAutoSolving"
          @click="kenKenStore.autoSolve()"
        >
          {{ isAutoSolving ? 'Auto solving…' : 'Auto solve' }}
        </button>
        <span v-else class="solver-status" :class="`solver-status--${solverMode}`">
          {{ solverMode === 'solved' ? 'Solved' : 'No solution found' }}
        </span>
      </div>
    </article>

    <SolverTerminal :logs="logs" :mode="solverMode" />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import KenKenCell from './KenKenCell.vue'
import SolverTerminal from './SolverTerminal.vue'
import { useKenKenStore } from '../stores/kenken'

const kenKenStore = useKenKenStore()
const { board, isAutoSolving, logs, recentlyUpdatedCells, resolvedCells, solverMode } = storeToRefs(kenKenStore)

interface KenKenCageLine {
  key: string
  x1: number
  x2: number
  y1: number
  y2: number
}

const cageLines = computed<KenKenCageLine[]>(() => {
  const lines: KenKenCageLine[] = []

  for (let rowIndex = 0; rowIndex < board.value.length; rowIndex += 1) {
    for (let columnIndex = 0; columnIndex < board.value[rowIndex].length; columnIndex += 1) {
      const cell = board.value[rowIndex][columnIndex]
      const cageAbove = rowIndex > 0 ? board.value[rowIndex - 1][columnIndex] : null
      const cageLeft = columnIndex > 0 ? board.value[rowIndex][columnIndex - 1] : null

      if (cageAbove !== null && cageAbove.cageId !== cell.cageId) {
        lines.push({
          key: `horizontal-${rowIndex}-${columnIndex}`,
          x1: columnIndex,
          x2: columnIndex + 1,
          y1: rowIndex,
          y2: rowIndex,
        })
      }

      if (cageLeft !== null && cageLeft.cageId !== cell.cageId) {
        lines.push({
          key: `vertical-${rowIndex}-${columnIndex}`,
          x1: columnIndex,
          x2: columnIndex,
          y1: rowIndex,
          y2: rowIndex + 1,
        })
      }
    }
  }

  return lines
})
</script>
