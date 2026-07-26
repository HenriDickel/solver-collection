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
        <button class="clear-button" type="button" @click="sudokuStore.clearBoard()">Reset</button>
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

    <SolverTerminal :logs="logs" :mode="solverMode" />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import SolverTerminal from './SolverTerminal.vue'
import SudokuCell from './SudokuCell.vue'
import { useSudokuStore } from '../stores/sudoku'

const sudokuStore = useSudokuStore()
const { board, candidates, filledCells, isAutoSolving, logs, nextStep, recentlyPlacedCells, solverMode } = storeToRefs(sudokuStore)

const continueLabel = computed(() =>
  nextStep.value === 'fillSingles' ? 'Place single values' : 'Check candidates',
)

</script>
