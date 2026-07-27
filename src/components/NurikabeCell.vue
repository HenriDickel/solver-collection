<template>
  <div
    class="nurikabe-cell"
    :class="[
      `nurikabe-cell--${cell.state}`,
      { 'nurikabe-cell--clue': cell.clue !== null, 'nurikabe-cell--recently-updated': isRecentlyUpdated },
    ]"
    :aria-label="ariaLabel"
    role="gridcell"
  >
    {{ cell.clue ?? '' }}
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { NurikabeCell as NurikabeCellType } from '../types/nurikabe'

const { cell, columnIndex, isRecentlyUpdated, rowIndex } = defineProps<{
  cell: NurikabeCellType
  columnIndex: number
  isRecentlyUpdated: boolean
  rowIndex: number
}>()

const ariaLabel = computed(() => {
  const position = `Row ${rowIndex + 1}, column ${columnIndex + 1}`

  if (cell.clue !== null) return `${position}: island clue ${cell.clue}`
  if (cell.state === 'island') return `${position}: island`
  if (cell.state === 'water') return `${position}: water`
  return `${position}: unknown`
})
</script>
