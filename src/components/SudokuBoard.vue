<template>
  <section class="solver-layout" aria-label="Sudoku solver">
    <article
      class="board-card"
      :class="{
        'board-card--editing': solverMode === 'editing',
        'board-card--solving': solverMode !== 'editing',
      }"
      aria-labelledby="board-title"
    >
      <div class="board-header">
        <div>
          <h2 id="board-title">Sudoku</h2>
        </div>
        <span class="progress-pill">{{ filledCells }} / 81</span>
      </div>

      <div class="board" :class="{ 'board--solving': solverMode !== 'editing' }" aria-label="Sudoku board">
        <template v-for="(row, rowIndex) in board" :key="rowIndex">
          <SudokuCell
            v-for="(cell, columnIndex) in row"
            :key="`${rowIndex}-${columnIndex}`"
            :candidates="candidates[rowIndex][columnIndex]"
            :cell="cell"
            :column-index="columnIndex"
            :is-solving="solverMode !== 'editing'"
            :is-recently-filled="recentlyPlacedCells.includes(`${rowIndex}-${columnIndex}`)"
            :row-index="rowIndex"
            @update="sudokuStore.setCell(rowIndex, columnIndex, $event)"
          />
        </template>
      </div>

      <div class="solver-controls" :aria-busy="isAutoSolving">
        <button class="clear-button" type="button" @click="sudokuStore.clearBoard()">Clear</button>
        <button
          v-if="solverMode === 'editing'"
          class="solver-button"
          type="button"
          @click="sudokuStore.startSolver()"
        >
          Solve
        </button>
        <template v-else-if="solverMode === 'solving'">
          <button
            class="solver-button"
            type="button"
            :disabled="isAutoSolving"
            @click="sudokuStore.advanceSolver()"
          >
            {{ continueLabel }}
          </button>
          <button
            class="auto-button"
            type="button"
            :disabled="isAutoSolving"
            @click="sudokuStore.autoSolve()"
          >
            {{ isAutoSolving ? 'Auto solving…' : 'Auto solve' }}
          </button>
        </template>
        <span v-else class="solver-status" :class="`solver-status--${solverMode}`">
          {{ solverMode === 'solved' ? 'Solved' : 'No further strategy' }}
        </span>
      </div>
    </article>

    <aside class="terminal" aria-labelledby="terminal-title">
      <div class="terminal-header">
        <h2 id="terminal-title">Terminal</h2>
        <span class="terminal-indicator" :class="`terminal-indicator--${solverMode}`"></span>
      </div>

      <ol v-if="logs.length > 0" ref="terminalLog" class="terminal-log" aria-live="polite">
        <li
          v-for="log in logs"
          :key="log.id"
          class="terminal-log-entry"
          :class="`terminal-log-entry--${log.level}`"
        >
          <span aria-hidden="true">›</span>
          <span>{{ log.message }}</span>
        </li>
      </ol>
      <p v-else class="terminal-empty">Ready. Start the solver to follow the analysis.</p>
    </aside>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import SudokuCell from './SudokuCell.vue'
import { useSudokuStore } from '../stores/sudoku'

const sudokuStore = useSudokuStore()
const { board, candidates, filledCells, isAutoSolving, logs, nextStep, recentlyPlacedCells, solverMode } = storeToRefs(sudokuStore)

const continueLabel = computed(() =>
  nextStep.value === 'fillSingles' ? 'Place single values' : 'Check candidates',
)

const terminalLog = ref<HTMLOListElement | null>(null)

watch(
  logs,
  async () => {
    await nextTick()

    if (terminalLog.value) {
      terminalLog.value.scrollTop = terminalLog.value.scrollHeight
    }
  },
  { deep: true, flush: 'post' },
)
</script>
