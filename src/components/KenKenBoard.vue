<template>
  <SolverWorkspace
    :has-example="hasExample"
    :is-auto-solving="isAutoSolving"
    :is-example-loading="isExampleLoading"
    :logs="logs"
    :mode="solverMode"
    :progress="`${resolvedCells} / 16 resolved`"
    stuck-label="No solution found"
    :title="title"
    @advance="kenKenStore.advanceSolver()"
    @auto-solve="kenKenStore.autoSolve()"
    @random="kenKenStore.loadRandomExample()"
  >
    <div class="kenken-board" role="grid" :aria-label="`${title} board`">
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
  </SolverWorkspace>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import KenKenCell from './KenKenCell.vue'
import SolverWorkspace from './SolverWorkspace.vue'
import { useKenKenStore } from '../stores/kenken'

const { title } = defineProps<{ title: string }>()

const kenKenStore = useKenKenStore()
const { board, hasExample, isAutoSolving, isExampleLoading, logs, recentlyUpdatedCells, resolvedCells, solverMode } = storeToRefs(kenKenStore)

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
