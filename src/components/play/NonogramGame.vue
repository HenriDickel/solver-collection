<template>
  <section class="play-layout" aria-labelledby="game-board-title">
    <article class="play-card">
      <div class="play-card-header">
        <div>
          <p class="eyebrow">Solo picture puzzle</p>
          <h2 id="game-board-title">Reveal the hidden lighthouse</h2>
        </div>
        <span class="play-progress">{{ resolvedCells }} / 25</span>
      </div>

      <div class="play-nonogram" aria-label="Nonogram board and clues">
        <div class="play-nonogram-corner" aria-hidden="true"></div>
        <div class="play-nonogram-column-clues" aria-label="Column clues">
          <span v-for="(clues, columnIndex) in columnClues" :key="columnIndex">{{ clues.join(' ') }}</span>
        </div>
        <div class="play-nonogram-row-clues" aria-label="Row clues">
          <span v-for="(clues, rowIndex) in rowClues" :key="rowIndex">{{ clues.join(' ') }}</span>
        </div>
        <div class="play-nonogram-grid" role="grid" aria-label="Playable Nonogram grid">
          <button
            v-for="(cell, cellIndex) in board.flat()"
            :key="cellIndex"
            class="play-nonogram-cell"
            :class="`play-nonogram-cell--${cell}`"
            type="button"
            :disabled="isComplete"
            @click="cycleCell(cellIndex)"
          >
            <span v-if="cell === 'empty'" aria-hidden="true">×</span>
          </button>
        </div>
      </div>

      <p v-if="isComplete" class="play-success">The lighthouse is complete.</p>
      <p v-else class="play-hint">Tap a cell to cycle through blank, filled, and marked empty.</p>
      <button class="play-secondary-button" type="button" @click="restartGame">Restart picture</button>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type NonogramCellState = 'unknown' | 'filled' | 'empty'

const solution = [
  '..#..',
  '.###.',
  '#####',
  '.###.',
  '#.#.#',
]
const rowClues = [[1], [3], [5], [3], [1, 1, 1]]
const columnClues = [[1, 1], [3], [5], [3], [1, 1]]
const board = ref(createBoard())

const resolvedCells = computed(() => board.value.flat().filter((state) => state !== 'unknown').length)
const isComplete = computed(() => board.value.flat().every((state, index) => {
  const solutionCell = solution.flatMap((row) => Array.from(row))[index]
  return state === (solutionCell === '#' ? 'filled' : 'empty')
}))

function createBoard(): NonogramCellState[][] {
  return Array.from({ length: 5 }, () => Array.from({ length: 5 }, () => 'unknown' as NonogramCellState))
}

function cycleCell(cellIndex: number): void {
  const rowIndex = Math.floor(cellIndex / 5)
  const columnIndex = cellIndex % 5
  const nextState: Record<NonogramCellState, NonogramCellState> = {
    empty: 'unknown',
    filled: 'empty',
    unknown: 'filled',
  }
  board.value[rowIndex][columnIndex] = nextState[board.value[rowIndex][columnIndex]]
}

function restartGame(): void {
  board.value = createBoard()
}
</script>
