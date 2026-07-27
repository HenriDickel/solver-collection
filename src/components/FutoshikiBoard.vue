<template>
  <section class="solver-layout" aria-label="Futoshiki solver">
    <article
      class="board-card"
      :class="{
        'board-card--editing': solverMode === 'ready',
        'board-card--solving': solverMode !== 'ready',
      }"
      aria-labelledby="board-title"
    >
      <div class="board-header">
        <h2 id="board-title">Futoshiki</h2>
        <span class="progress-pill">{{ resolvedCells }} / 25 resolved</span>
      </div>

      <div class="futoshiki-board" role="grid" aria-label="Futoshiki board">
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

      <div class="solver-controls" :aria-busy="isAutoSolving">
        <button class="clear-button" type="button" @click="futoshikiStore.resetBoard()">Reset</button>
        <button
          v-if="solverMode === 'ready' || solverMode === 'solving'"
          class="solver-button"
          type="button"
          :disabled="isAutoSolving"
          @click="futoshikiStore.advanceSolver()"
        >
          {{ solverMode === 'ready' ? 'Start solving' : 'Solve next step' }}
        </button>
        <button
          v-if="solverMode === 'ready' || solverMode === 'solving'"
          class="auto-button"
          type="button"
          :disabled="isAutoSolving"
          @click="futoshikiStore.autoSolve()"
        >
          {{ isAutoSolving ? 'Auto solving…' : 'Auto solve' }}
        </button>
        <span v-else class="solver-status" :class="`solver-status--${solverMode}`">
          {{ solverMode === 'solved' ? 'Solved' : 'No solution found' }}
        </span>
      </div>
    </article>

    <SolverTerminal :logs="logs" :mode="solverMode" />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import FutoshikiCell from './FutoshikiCell.vue'
import SolverTerminal from './SolverTerminal.vue'
import { useFutoshikiStore } from '../stores/futoshiki'

const futoshikiStore = useFutoshikiStore()
const { board, inequalities, isAutoSolving, logs, recentlyUpdatedCells, resolvedCells, solverMode } = storeToRefs(futoshikiStore)

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
