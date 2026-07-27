<template>
  <SolverWorkspace
    :is-auto-solving="isAutoSolving"
    :logs="logs"
    :mode="solverMode"
    :progress="`${filledCells} / 81`"
    stuck-label="No further strategy"
    :title="title"
    @advance="sudokuStore.advanceSolver()"
    @auto-solve="sudokuStore.autoSolve()"
    @random="sudokuStore.loadRandomExample()"
  >
    <div class="board" :class="{ 'board--solving': solverMode !== 'ready' }" :aria-label="`${title} board`">
      <template v-for="(row, rowIndex) in board" :key="rowIndex">
        <SudokuCell
          v-for="(cell, columnIndex) in row"
          :key="`${rowIndex}-${columnIndex}`"
          :candidates="candidates[rowIndex][columnIndex]"
          :cell="cell"
          :column-index="columnIndex"
          :is-recently-filled="recentlyPlacedCells.includes(`${rowIndex}-${columnIndex}`)"
          :row-index="rowIndex"
        />
      </template>
    </div>
  </SolverWorkspace>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import SolverWorkspace from './SolverWorkspace.vue'
import SudokuCell from './SudokuCell.vue'
import { useSudokuStore } from '../stores/sudoku'

const { title } = defineProps<{ title: string }>()

const sudokuStore = useSudokuStore()
const { board, candidates, filledCells, isAutoSolving, logs, recentlyPlacedCells, solverMode } = storeToRefs(sudokuStore)
</script>
