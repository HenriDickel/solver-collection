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
            'play-sudoku-cell--box-top': Math.floor(cellIndex / 9) > 0 && Math.floor(cellIndex / 9) % 3 === 0,
            'play-sudoku-cell--box-left': cellIndex % 9 > 0 && cellIndex % 3 === 0,
          }"
          type="button"
          :disabled="puzzle.flat()[cellIndex] !== null || isComplete"
          @click="selectCell(cellIndex)"
        >
          {{ value ?? '' }}
        </button>
      </div>

      <p v-if="isComplete" class="play-success">Puzzle complete â€” nicely done.</p>
      <p v-else class="play-hint">Choose a square, then select a number. Mistakes: {{ mistakes }}</p>

      <div class="play-number-pad" aria-label="Number pad">
        <button v-for="number in numbers" :key="number" type="button" :disabled="selectedCellIndex === null || isComplete" @click="placeNumber(number)">
          {{ number }}
        </button>
        <button class="play-number-pad__clear" type="button" :disabled="selectedCellIndex === null || isComplete" @click="clearSelectedCell">
          Clear
        </button>
      </div>

      <div class="play-action-row">
        <button class="play-secondary-button" type="button" @click="restartGame">Restart puzzle</button>
        <button class="play-secondary-button" type="button" @click="startRandomGame">New solvable puzzle</button>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type SudokuValue = number | null
type SudokuGrid = SudokuValue[][]
type SudokuSolution = number[][]

const boardSize = 9
const targetEmptyCells = 45
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const generatedPuzzle = createRandomPuzzle()
const puzzle = ref<SudokuGrid>(generatedPuzzle.puzzle)
const solution = ref<SudokuSolution>(generatedPuzzle.solution)
const board = ref<SudokuGrid>(createBoard(puzzle.value))
const mistakes = ref(0)
const selectedCellIndex = ref<number | null>(null)

const solvedCells = computed(() => board.value.flat().filter((value, index) => value === solution.value.flat()[index]).length)
const isComplete = computed(() => solvedCells.value === boardSize * boardSize)

function shuffle<T>(items: T[]): T[] {
  const result = [...items]

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[result[index], result[swapIndex]] = [result[swapIndex], result[index]]
  }

  return result
}

function createBoard(source: SudokuGrid): SudokuGrid {
  return source.map((row) => [...row])
}

function createRandomSolution(): SudokuSolution {
  const digits = shuffle(numbers)
  const rowOrder = shuffle([0, 1, 2]).flatMap((band) => shuffle([0, 1, 2]).map((row) => band * 3 + row))
  const columnOrder = shuffle([0, 1, 2]).flatMap((stack) => shuffle([0, 1, 2]).map((column) => stack * 3 + column))

  return rowOrder.map((row) => columnOrder.map((column) => digits[(row * 3 + Math.floor(row / 3) + column) % boardSize]))
}

function isValidPlacement(grid: SudokuGrid, rowIndex: number, columnIndex: number, value: number): boolean {
  for (let index = 0; index < boardSize; index += 1) {
    if (grid[rowIndex][index] === value || grid[index][columnIndex] === value) return false
  }

  const boxRow = Math.floor(rowIndex / 3) * 3
  const boxColumn = Math.floor(columnIndex / 3) * 3

  for (let row = boxRow; row < boxRow + 3; row += 1) {
    for (let column = boxColumn; column < boxColumn + 3; column += 1) {
      if (grid[row][column] === value) return false
    }
  }

  return true
}

function countSolutions(source: SudokuGrid, limit = 2): number {
  const grid = createBoard(source)
  let solutions = 0

  const solve = (): void => {
    if (solutions >= limit) return

    let emptyCell: { columnIndex: number; rowIndex: number } | null = null

    for (let rowIndex = 0; rowIndex < boardSize && emptyCell === null; rowIndex += 1) {
      for (let columnIndex = 0; columnIndex < boardSize; columnIndex += 1) {
        if (grid[rowIndex][columnIndex] === null) {
          emptyCell = { columnIndex, rowIndex }
          break
        }
      }
    }

    if (emptyCell === null) {
      solutions += 1
      return
    }

    for (const number of numbers) {
      if (!isValidPlacement(grid, emptyCell.rowIndex, emptyCell.columnIndex, number)) continue

      grid[emptyCell.rowIndex][emptyCell.columnIndex] = number
      solve()
      grid[emptyCell.rowIndex][emptyCell.columnIndex] = null
    }
  }

  solve()
  return solutions
}

function createRandomPuzzle(): { puzzle: SudokuGrid; solution: SudokuSolution } {
  const nextSolution = createRandomSolution()
  const nextPuzzle: SudokuGrid = nextSolution.map((row) => [...row])
  let removedCells = 0

  for (const cellIndex of shuffle(Array.from({ length: boardSize * boardSize }, (_, index) => index))) {
    if (removedCells === targetEmptyCells) break

    const rowIndex = Math.floor(cellIndex / boardSize)
    const columnIndex = cellIndex % boardSize
    const value = nextPuzzle[rowIndex][columnIndex]
    nextPuzzle[rowIndex][columnIndex] = null

    if (countSolutions(nextPuzzle) !== 1) {
      nextPuzzle[rowIndex][columnIndex] = value
      continue
    }

    removedCells += 1
  }

  return { puzzle: nextPuzzle, solution: nextSolution }
}

function selectCell(cellIndex: number): void {
  selectedCellIndex.value = cellIndex
}

function placeNumber(number: number): void {
  if (selectedCellIndex.value === null) return

  const rowIndex = Math.floor(selectedCellIndex.value / boardSize)
  const columnIndex = selectedCellIndex.value % boardSize

  if (number !== solution.value[rowIndex][columnIndex] && board.value[rowIndex][columnIndex] !== number) {
    mistakes.value += 1
  }

  board.value[rowIndex][columnIndex] = number
}

function clearSelectedCell(): void {
  if (selectedCellIndex.value === null) return

  const rowIndex = Math.floor(selectedCellIndex.value / boardSize)
  const columnIndex = selectedCellIndex.value % boardSize
  board.value[rowIndex][columnIndex] = null
}

function restartGame(): void {
  board.value = createBoard(puzzle.value)
  mistakes.value = 0
  selectedCellIndex.value = null
}

function startRandomGame(): void {
  const nextPuzzle = createRandomPuzzle()
  puzzle.value = nextPuzzle.puzzle
  solution.value = nextPuzzle.solution
  restartGame()
}
</script>
