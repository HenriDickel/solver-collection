<template>
  <div
    class="cell"
    :class="{
      'cell--box-top': isBoxEdge(rowIndex),
      'cell--box-left': isBoxEdge(columnIndex),
      'cell--given': cell !== null,
      'cell--recently-filled': isRecentlyFilled,
    }"
  >
    <span v-if="cell !== null" class="cell-value" :aria-label="`Row ${rowIndex + 1}, column ${columnIndex + 1}: ${cell}`">
      {{ cell }}
    </span>
    <div v-else class="candidate-grid" :aria-label="`Candidates for row ${rowIndex + 1}, column ${columnIndex + 1}`">
      <span
        v-for="option in digits"
        :key="option"
        class="candidate"
        :class="{ invisible: !candidates.includes(option) }"
      >
        {{ option }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SudokuCandidate, SudokuCellValue } from '../types/sudoku'

const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9]

const { candidates, cell, columnIndex, isRecentlyFilled, rowIndex } = defineProps<{
  candidates: SudokuCandidate
  cell: SudokuCellValue
  columnIndex: number
  isRecentlyFilled: boolean
  rowIndex: number
}>()

function isBoxEdge(index: number): boolean {
  return index > 0 && index % 3 === 0
}

</script>
