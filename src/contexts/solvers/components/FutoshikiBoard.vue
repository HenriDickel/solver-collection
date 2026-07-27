<template>
  <SolverWorkspace
    :has-example="hasExample"
    :is-auto-solving="isAutoSolving"
    :is-example-loading="isExampleLoading"
    :logs="logs"
    :mode="solverMode"
    :progress="`${resolvedCells} / 25 resolved`"
    stuck-label="No solution found"
    :title="title"
    @advance="futoshikiStore.advanceSolver()"
    @auto-solve="futoshikiStore.autoSolve()"
    @random="futoshikiStore.loadRandomExample()"
  >
    <div class="futoshiki-board" role="grid" :aria-label="`${title} board`">
      <template v-for="(row, rowIndex) in board" :key="rowIndex">
        <template v-for="(value, columnIndex) in row" :key="`${rowIndex}-${columnIndex}`">
          <FutoshikiCell
            :column-index="columnIndex"
            :is-recently-updated="recentlyUpdatedCells.includes(`${rowIndex}-${columnIndex}`)"
            :row-index="rowIndex"
            :style="{ gridColumn: columnIndex * 2 + 1, gridRow: rowIndex * 2 + 1 }"
            :value="value"
          />
          <span
            v-if="columnIndex < row.length - 1"
            class="futoshiki-inequality futoshiki-inequality--horizontal"
            :style="{ gridColumn: columnIndex * 2 + 2, gridRow: rowIndex * 2 + 1 }"
            aria-hidden="true"
          >
            {{ getHorizontalRelation(rowIndex, columnIndex) }}
          </span>
          <span
            v-if="rowIndex < board.length - 1"
            class="futoshiki-inequality futoshiki-inequality--vertical"
            :style="{ gridColumn: columnIndex * 2 + 1, gridRow: rowIndex * 2 + 2 }"
            aria-hidden="true"
          >
            {{ getVerticalRelation(rowIndex, columnIndex) }}
          </span>
        </template>
      </template>
    </div>
  </SolverWorkspace>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import FutoshikiCell from './FutoshikiCell.vue'
import SolverWorkspace from './SolverWorkspace.vue'
import { useFutoshikiStore } from '../stores/futoshiki'

const { title } = defineProps<{ title: string }>()

const futoshikiStore = useFutoshikiStore()
const { board, hasExample, inequalities, isAutoSolving, isExampleLoading, logs, recentlyUpdatedCells, resolvedCells, solverMode } = storeToRefs(futoshikiStore)

const horizontalRelations = computed(() => {
  const relations = new Map<string, string>()

  for (const inequality of inequalities.value) {
    if (inequality.first.rowIndex === inequality.second.rowIndex) {
      relations.set(`${inequality.first.rowIndex}-${inequality.first.columnIndex}`, inequality.relation)
    }
  }

  return relations
})

const verticalRelations = computed(() => {
  const relations = new Map<string, string>()

  for (const inequality of inequalities.value) {
    if (inequality.first.columnIndex === inequality.second.columnIndex) {
      relations.set(`${inequality.first.rowIndex}-${inequality.first.columnIndex}`, inequality.relation)
    }
  }

  return relations
})

function getHorizontalRelation(rowIndex: number, columnIndex: number): string {
  return horizontalRelations.value.get(`${rowIndex}-${columnIndex}`) ?? ''
}

function getVerticalRelation(rowIndex: number, columnIndex: number): string {
  return verticalRelations.value.get(`${rowIndex}-${columnIndex}`) ?? ''
}
</script>
