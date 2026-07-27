<template>
  <SolverWorkspace
    :is-auto-solving="isAutoSolving"
    :logs="logs"
    :mode="solverMode"
    :progress="`${flaggedMines} / ${mineCount}`"
    stuck-label="No further strategy"
    :title="title"
    @advance="minesweeperStore.advanceSolver()"
    @auto-solve="minesweeperStore.autoSolve()"
    @random="minesweeperStore.loadRandomExample()"
  >
    <div class="mine-board" role="grid" :aria-label="`${title} board`">
      <template v-for="(row, rowIndex) in board" :key="rowIndex">
        <MinesweeperCell
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
import MinesweeperCell from './MinesweeperCell.vue'
import SolverWorkspace from './SolverWorkspace.vue'
import { useMinesweeperStore } from '../stores/minesweeper'

const { title } = defineProps<{ title: string }>()

const minesweeperStore = useMinesweeperStore()
const { board, flaggedMines, isAutoSolving, logs, mineCount, recentlyUpdatedCells, solverMode } = storeToRefs(minesweeperStore)
</script>
