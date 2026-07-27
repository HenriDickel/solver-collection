<template>
  <section class="play-layout" aria-labelledby="game-board-title">
    <article class="play-card">
      <div class="play-card-header">
        <div>
          <p class="eyebrow">Solo puzzle</p>
          <h2 id="game-board-title">Fill every row, column, and box</h2>
        </div>
        <span class="play-progress">{{ solvedCells }} / 81</span>
      </div>

      <div class="play-sudoku-grid" role="grid" aria-label="Sudoku board">
        <button
          v-for="(value, cellIndex) in board.flat()"
          :key="cellIndex"
          class="play-sudoku-cell"
          :class="{
            'play-sudoku-cell--given': puzzle.flat()[cellIndex] !== null,
            'play-sudoku-cell--incorrect': value !== null && value !== solution.flat()[cellIndex],
            'play-sudoku-cell--selected': selectedCellIndex === cellIndex,
            'play-sudoku-cell--box-top': Math.floor(cellIndex / 9) % 3 === 0,
            'play-sudoku-cell--box-left': cellIndex % 3 === 0,
          }"
          type="button"
          :disabled="puzzle.flat()[cellIndex] !== null || isComplete"
          @click="selectCell(cellIndex)"
        >
          {{ value ?? '' }}
        </button>
      </div>

      <p v-if="isComplete" class="play-success">Puzzle complete — nicely done.</p>
      <p v-else class="play-hint">Choose a square, then select a number. Mistakes: {{ mistakes }}</p>

      <div class="play-number-pad" aria-label="Number pad">
        <button v-for="number in numbers" :key="number" type="button" :disabled="selectedCellIndex === null || isComplete" @click="placeNumber(number)">
          {{ number }}
        </button>
        <button class="play-number-pad__clear" type="button" :disabled="selectedCellIndex === null || isComplete" @click="clearSelectedCell">
          Clear
        </button>
      </div>

      <button class="play-secondary-button" type="button" @click="restartGame">Restart puzzle</button>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type SudokuValue = number | null

const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const puzzle: SudokuValue[][] = [
  [5, 3, null, null, 7, null, null, null, null],
  [6, null, null, 1, 9, 5, null, null, null],
  [null, 9, 8, null, null, null, null, 6, null],
  [8, null, null, null, 6, null, null, null, 3],
  [4, null, null, 8, null, 3, null, null, 1],
  [7, null, null, null, 2, null, null, null, 6],
  [null, 6, null, null, null, null, 2, 8, null],
  [null, null, null, 4, 1, 9, null, null, 5],
  [null, null, null, null, 8, null, null, 7, 9],
]
const solution = [
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9],
]

const board = ref(createBoard())
const mistakes = ref(0)
const selectedCellIndex = ref<number | null>(null)

const solvedCells = computed(() => board.value.flat().filter((value, index) => value === solution.flat()[index]).length)
const isComplete = computed(() => solvedCells.value === 81)

function createBoard(): SudokuValue[][] {
  return puzzle.map((row) => [...row])
}

function selectCell(cellIndex: number): void {
  selectedCellIndex.value = cellIndex
}

function placeNumber(number: number): void {
  if (selectedCellIndex.value === null) return

  const rowIndex = Math.floor(selectedCellIndex.value / 9)
  const columnIndex = selectedCellIndex.value % 9

  if (number !== solution[rowIndex][columnIndex] && board.value[rowIndex][columnIndex] !== number) {
    mistakes.value += 1
  }

  board.value[rowIndex][columnIndex] = number
}

function clearSelectedCell(): void {
  if (selectedCellIndex.value === null) return

  const rowIndex = Math.floor(selectedCellIndex.value / 9)
  const columnIndex = selectedCellIndex.value % 9
  board.value[rowIndex][columnIndex] = null
}

function restartGame(): void {
  board.value = createBoard()
  mistakes.value = 0
  selectedCellIndex.value = null
}
</script>
