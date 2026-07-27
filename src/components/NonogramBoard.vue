<template>
  <SolverWorkspace
    :is-auto-solving="isAutoSolving"
    :logs="logs"
    :mode="solverMode"
    :progress="`${knownCells} / ${cellCount} resolved`"
    stuck-label="No further strategy"
    :title="title"
    @advance="nonogramStore.advanceSolver()"
    @auto-solve="nonogramStore.autoSolve()"
    @random="nonogramStore.loadRandomExample()"
  >
    <div class="nonogram-workspace" :aria-label="`${title} board with row and column clues`">
      <div class="nonogram-corner" aria-hidden="true"></div>
      <div class="nonogram-column-clues" aria-label="Column clues">
        <div v-for="(clues, columnIndex) in columnClues" :key="columnIndex" class="nonogram-clue nonogram-clue--column">
          <span v-for="(clue, clueIndex) in clues" :key="clueIndex">{{ clue }}</span>
          <span v-if="clues.length === 0">–</span>
        </div>
      </div>
      <div class="nonogram-row-clues" aria-label="Row clues">
        <div v-for="(clues, rowIndex) in rowClues" :key="rowIndex" class="nonogram-clue nonogram-clue--row">
          <span v-for="(clue, clueIndex) in clues" :key="clueIndex">{{ clue }}</span>
          <span v-if="clues.length === 0">–</span>
        </div>
      </div>
      <div class="nonogram-board" role="grid" aria-label="Nonogram cells">
        <template v-for="(row, rowIndex) in board" :key="rowIndex">
          <NonogramCell
            v-for="(cell, columnIndex) in row"
            :key="`${rowIndex}-${columnIndex}`"
            :cell="cell"
            :column-index="columnIndex"
            :is-recently-updated="recentlyUpdatedCells.includes(`${rowIndex}-${columnIndex}`)"
            :row-index="rowIndex"
          />
        </template>
      </div>
    </div>
  </SolverWorkspace>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import NonogramCell from './NonogramCell.vue'
import SolverWorkspace from './SolverWorkspace.vue'
import { useNonogramStore } from '../stores/nonogram'

const { title } = defineProps<{ title: string }>()

const nonogramStore = useNonogramStore()
const {
  board,
  cellCount,
  columnClues,
  isAutoSolving,
  knownCells,
  logs,
  recentlyUpdatedCells,
  rowClues,
  solverMode,
} = storeToRefs(nonogramStore)
</script>
