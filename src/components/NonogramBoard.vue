<template>
  <section class="solver-layout" aria-label="Nonogram solver">
    <article
      class="board-card"
      :class="{
        'board-card--editing': solverMode === 'ready',
        'board-card--solving': solverMode !== 'ready',
      }"
      aria-labelledby="board-title"
    >
      <div class="board-header">
        <h2 id="board-title">Nonogram</h2>
        <span class="progress-pill">{{ knownCells }} / {{ cellCount }} resolved</span>
      </div>

      <div class="nonogram-workspace" aria-label="Nonogram board with row and column clues">
        <div class="nonogram-corner" aria-hidden="true"></div>
        <div class="nonogram-column-clues" aria-label="Column clues">
          <div v-for="(clues, columnIndex) in columnClues" :key="columnIndex" class="nonogram-clue nonogram-clue--column">
            <span v-for="(clue, clueIndex) in clues" :key="clueIndex">{{ clue }}</span>
            <span v-if="clues.length === 0">–</span>
          </div>
        </div>
        <div class="nonogram-row-clues" aria-label="Row clues">
          <div v-for="(clues, rowIndex) in rowClues" :key="rowIndex" class="nonogram-clue nonogram-clue--row">
            <span v-for="(clue, clueIndex) in clues" :key="clueIndex">{{ clue }}</span>
            <span v-if="clues.length === 0">–</span>
          </div>
        </div>
        <div class="nonogram-board" role="grid" aria-label="Nonogram cells">
          <template v-for="(row, rowIndex) in board" :key="rowIndex">
            <NonogramCell
              v-for="(cell, columnIndex) in row"
              :key="`${rowIndex}-${columnIndex}`"
              :cell="cell"
              :column-index="columnIndex"
              :is-recently-updated="recentlyUpdatedCells.includes(`${rowIndex}-${columnIndex}`)"
              :row-index="rowIndex"
            />
          </template>
        </div>
      </div>

      <div class="solver-controls" :aria-busy="isAutoSolving">
        <button class="clear-button" type="button" @click="nonogramStore.resetBoard()">Reset</button>
        <button
          v-if="solverMode === 'ready' || solverMode === 'solving'"
          class="solver-button"
          type="button"
          :disabled="isAutoSolving"
          @click="nonogramStore.advanceSolver()"
        >
          {{ solverMode === 'ready' ? 'Start solving' : 'Solve next step' }}
        </button>
        <button
          v-if="solverMode === 'ready' || solverMode === 'solving'"
          class="auto-button"
          type="button"
          :disabled="isAutoSolving"
          @click="nonogramStore.autoSolve()"
        >
          {{ isAutoSolving ? 'Auto solving…' : 'Auto solve' }}
        </button>
        <span v-else class="solver-status" :class="`solver-status--${solverMode}`">
          {{ solverMode === 'solved' ? 'Solved' : 'No further strategy' }}
        </span>
      </div>
    </article>

    <SolverTerminal :logs="logs" :mode="solverMode" />
  </section>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import NonogramCell from './NonogramCell.vue'
import SolverTerminal from './SolverTerminal.vue'
import { useNonogramStore } from '../stores/nonogram'

const nonogramStore = useNonogramStore()
const {
  board,
  cellCount,
  columnClues,
  isAutoSolving,
  knownCells,
  logs,
  recentlyUpdatedCells,
  rowClues,
  solverMode,
} = storeToRefs(nonogramStore)
</script>
