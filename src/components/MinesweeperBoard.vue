<template>
  <section class="solver-layout" aria-label="Minesweeper solver">
    <article
      class="board-card"
      :class="{
        'board-card--editing': solverMode === 'ready',
        'board-card--solving': solverMode !== 'ready',
      }"
      aria-labelledby="board-title"
    >
      <div class="board-header">
        <h2 id="board-title">Minesweeper</h2>
        <span class="progress-pill">{{ flaggedMines }} / {{ mineCount }}</span>
      </div>

      <div class="mine-board" role="grid" aria-label="Minesweeper board">
        <template v-for="(row, rowIndex) in board" :key="rowIndex">
          <MinesweeperCell
            v-for="(cell, columnIndex) in row"
            :key="`${rowIndex}-${columnIndex}`"
            :cell="cell"
            :column-index="columnIndex"
            :is-recently-updated="recentlyUpdatedCells.includes(`${rowIndex}-${columnIndex}`)"
            :row-index="rowIndex"
          />
        </template>
      </div>

      <div class="solver-controls" :aria-busy="isAutoSolving">
        <button class="clear-button" type="button" @click="minesweeperStore.resetBoard()">Reset</button>
        <button
          v-if="solverMode === 'ready' || solverMode === 'solving'"
          class="solver-button"
          type="button"
          :disabled="isAutoSolving"
          @click="minesweeperStore.advanceSolver()"
        >
          {{ solverMode === 'ready' ? 'Start solving' : 'Solve next step' }}
        </button>
        <button
          v-if="solverMode === 'ready' || solverMode === 'solving'"
          class="auto-button"
          type="button"
          :disabled="isAutoSolving"
          @click="minesweeperStore.autoSolve()"
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
import MinesweeperCell from './MinesweeperCell.vue'
import SolverTerminal from './SolverTerminal.vue'
import { useMinesweeperStore } from '../stores/minesweeper'

const minesweeperStore = useMinesweeperStore()
const { board, flaggedMines, isAutoSolving, logs, mineCount, recentlyUpdatedCells, solverMode } = storeToRefs(minesweeperStore)
</script>
