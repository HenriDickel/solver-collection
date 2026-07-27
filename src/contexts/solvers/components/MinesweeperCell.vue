<template>
  <div
    class="mine-cell"
    :class="{
      'mine-cell--flagged': cell.state === 'flagged',
      'mine-cell--hidden': cell.state === 'hidden',
      'mine-cell--recently-updated': isRecentlyUpdated,
      'mine-cell--revealed': cell.state === 'revealed',
    }"
    :aria-label="ariaLabel"
    role="gridcell"
  >
    <span v-if="cell.state === 'flagged'" class="mine-flag" aria-hidden="true">⚑</span>
    <span v-else-if="cell.state === 'revealed'" class="mine-clue" :class="`mine-clue--${cell.clue}`">
      {{ cell.clue === 0 ? '' : cell.clue }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MinesweeperCell as MinesweeperCellType } from '../types/minesweeper'

const { cell, columnIndex, isRecentlyUpdated, rowIndex } = defineProps<{
  cell: MinesweeperCellType
  columnIndex: number
  isRecentlyUpdated: boolean
  rowIndex: number
}>()

const ariaLabel = computed(() => {
  const position = `Row ${rowIndex + 1}, column ${columnIndex + 1}`

  if (cell.state === 'flagged') return `${position}: flagged mine`
  if (cell.state === 'hidden') return `${position}: hidden`
  return `${position}: clue ${cell.clue}`
})
</script>
