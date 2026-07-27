<template>
  <SolverWorkspace
    :has-example="hasExample"
    :is-auto-solving="isAutoSolving"
    :is-example-loading="isExampleLoading"
    :logs="logs"
    :mode="solverMode"
    :progress="`${exploredCells} / ${walkableCells} explored`"
    stuck-label="No route found"
    :title="title"
    @advance="mazeStore.advanceSolver()"
    @auto-solve="mazeStore.autoSolve()"
    @random="mazeStore.loadRandomExample()"
  >
    <div class="maze-board" role="grid" :aria-label="`${title} board`">
      <template v-for="(row, rowIndex) in board" :key="rowIndex">
        <MazeCell
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
import MazeCell from './MazeCell.vue'
import SolverWorkspace from './SolverWorkspace.vue'
import { useMazeStore } from '../stores/maze'

const { title } = defineProps<{ title: string }>()

const mazeStore = useMazeStore()
const { board, exploredCells, hasExample, isAutoSolving, isExampleLoading, logs, recentlyUpdatedCells, solverMode, walkableCells } = storeToRefs(mazeStore)
</script>
