<template>
  <section class="solver-layout" aria-label="Maze solver">
    <article
      class="board-card"
      :class="{
        'board-card--editing': solverMode === 'ready',
        'board-card--solving': solverMode !== 'ready',
      }"
      aria-labelledby="board-title"
    >
      <div class="board-header">
        <h2 id="board-title">Maze</h2>
        <span class="progress-pill">{{ exploredCells }} / {{ walkableCells }} explored</span>
      </div>

      <div class="maze-board" role="grid" aria-label="Maze board">
        <template v-for="(row, rowIndex) in board" :key="rowIndex">
          <MazeCell
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
        <button class="clear-button" type="button" @click="mazeStore.resetBoard()">Reset</button>
        <button
          v-if="solverMode === 'ready' || solverMode === 'solving'"
          class="solver-button"
          type="button"
          :disabled="isAutoSolving"
          @click="mazeStore.advanceSolver()"
        >
          {{ solverMode === 'ready' ? 'Start solving' : 'Solve next step' }}
        </button>
        <button
          v-if="solverMode === 'ready' || solverMode === 'solving'"
          class="auto-button"
          type="button"
          :disabled="isAutoSolving"
          @click="mazeStore.autoSolve()"
        >
          {{ isAutoSolving ? 'Auto solving…' : 'Auto solve' }}
        </button>
        <span v-else class="solver-status" :class="`solver-status--${solverMode}`">
          {{ solverMode === 'solved' ? 'Solved' : 'No route found' }}
        </span>
      </div>
    </article>

    <SolverTerminal :logs="logs" :mode="solverMode" />
  </section>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import MazeCell from './MazeCell.vue'
import SolverTerminal from './SolverTerminal.vue'
import { useMazeStore } from '../stores/maze'

const mazeStore = useMazeStore()
const { board, exploredCells, isAutoSolving, logs, recentlyUpdatedCells, solverMode, walkableCells } = storeToRefs(mazeStore)
</script>
