<template>
  <div
    class="maze-cell"
    :class="[
      `maze-cell--${cell.kind}`,
      `maze-cell--${cell.state}`,
      { 'maze-cell--recently-updated': isRecentlyUpdated },
    ]"
    :aria-label="ariaLabel"
    role="gridcell"
  >
    <span v-if="cell.kind === 'start'" class="maze-marker" aria-hidden="true">S</span>
    <span v-else-if="cell.kind === 'goal'" class="maze-marker" aria-hidden="true">E</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MazeCell as MazeCellType } from '../types/maze'

const { cell, columnIndex, isRecentlyUpdated, rowIndex } = defineProps<{
  cell: MazeCellType
  columnIndex: number
  isRecentlyUpdated: boolean
  rowIndex: number
}>()

const ariaLabel = computed(() => {
  const position = `Row ${rowIndex + 1}, column ${columnIndex + 1}`

  if (cell.kind === 'wall') return `${position}: wall`
  if (cell.kind === 'start') return `${position}: start`
  if (cell.kind === 'goal') return `${position}: exit`
  if (cell.state === 'route') return `${position}: solution route`
  if (cell.state === 'frontier') return `${position}: next to explore`
  if (cell.state === 'visited') return `${position}: explored`
  return `${position}: open path`
})
</script>
