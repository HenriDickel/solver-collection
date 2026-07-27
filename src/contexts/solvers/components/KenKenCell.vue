<template>
  <div
    class="kenken-cell"
    :class="{
      'kenken-cell--recently-updated': isRecentlyUpdated,
    }"
    :aria-label="ariaLabel"
    role="gridcell"
  >
    <span v-if="cell.label" class="kenken-cage-label">{{ cell.label }}</span>
    <span v-if="cell.value !== null" class="kenken-value">{{ cell.value }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KenKenCell as KenKenCellType } from '../types/kenken'

const { cell, columnIndex, isRecentlyUpdated, rowIndex } = defineProps<{
  cell: KenKenCellType
  columnIndex: number
  isRecentlyUpdated: boolean
  rowIndex: number
}>()

const ariaLabel = computed(() => {
  const position = `Row ${rowIndex + 1}, column ${columnIndex + 1}`

  return cell.value === null ? `${position}: empty` : `${position}: ${cell.value}`
})
</script>
