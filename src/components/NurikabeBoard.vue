<template>
  <SolverWorkspace
    :is-auto-solving="isAutoSolving"
    :logs="logs"
    :mode="solverMode"
    :progress="`${resolvedCells} / 81 resolved`"
    stuck-label="No further strategy"
    :title="title"
    @advance="nurikabeStore.advanceSolver()"
    @auto-solve="nurikabeStore.autoSolve()"
    @reset="nurikabeStore.resetBoard()"
  >
    <div class="nurikabe-board" role="grid" :aria-label="`${title} board`">
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
  </SolverWorkspace>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import NurikabeCell from './NurikabeCell.vue'
import SolverWorkspace from './SolverWorkspace.vue'
import { useNurikabeStore } from '../stores/nurikabe'

const { title } = defineProps<{ title: string }>()

const nurikabeStore = useNurikabeStore()
const { board, isAutoSolving, logs, recentlyUpdatedCells, resolvedCells, solverMode } = storeToRefs(nurikabeStore)
</script>
