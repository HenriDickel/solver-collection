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
    <input
      v-if="!isSolving"
      class="cell-input"
      :aria-label="`Row ${rowIndex + 1}, column ${columnIndex + 1}`"
      inputmode="numeric"
      maxlength="1"
      :value="cell ?? ''"
      @input="handleInput"
    />
    <span v-else-if="cell !== null" class="cell-value" :aria-label="`Row ${rowIndex + 1}, column ${columnIndex + 1}: ${cell}`">
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

const { candidates, cell, columnIndex, isRecentlyFilled, isSolving, rowIndex } = defineProps<{
  candidates: SudokuCandidate
  cell: SudokuCellValue
  columnIndex: number
  isRecentlyFilled: boolean
  isSolving: boolean
  rowIndex: number
}>()

const emit = defineEmits<{
  update: [value: SudokuCellValue]
}>()

function isBoxEdge(index: number): boolean {
  return index > 0 && index % 3 === 0
}

function handleInput(event: Event): void {
  const input = event.target as HTMLInputElement
  const value = Number(input.value)
  const isValidValue = Number.isInteger(value) && value >= 1 && value <= 9

  emit('update', isValidValue ? value : null)
}
</script>
