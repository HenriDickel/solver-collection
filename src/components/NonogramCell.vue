<template>
  <div
    class="nonogram-cell"
    :class="[
      `nonogram-cell--${cell.state}`,
      { 'nonogram-cell--recently-updated': isRecentlyUpdated },
    ]"
    :aria-label="ariaLabel"
    role="gridcell"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { NonogramCell as NonogramCellType } from '../types/nonogram'

const { cell, columnIndex, isRecentlyUpdated, rowIndex } = defineProps<{
  cell: NonogramCellType
  columnIndex: number
  isRecentlyUpdated: boolean
  rowIndex: number
}>()

const ariaLabel = computed(() => {
  const position = `Row ${rowIndex + 1}, column ${columnIndex + 1}`

  if (cell.state === 'filled') return `${position}: filled`
  if (cell.state === 'empty') return `${position}: confirmed empty`
  return `${position}: unknown`
})
</script>
