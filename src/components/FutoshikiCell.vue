<template>
  <div
    class="futoshiki-cell"
    :class="{ 'futoshiki-cell--recently-updated': isRecentlyUpdated }"
    :aria-label="ariaLabel"
    role="gridcell"
  >
    {{ value ?? '' }}
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const { columnIndex, isRecentlyUpdated, rowIndex, value } = defineProps<{
  columnIndex: number
  isRecentlyUpdated: boolean
  rowIndex: number
  value: number | null
}>()

const ariaLabel = computed(() => {
  const position = `Row ${rowIndex + 1}, column ${columnIndex + 1}`

  return value === null ? `${position}: empty` : `${position}: ${value}`
})
</script>
