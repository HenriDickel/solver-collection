<template>
  <section class="play-layout" aria-labelledby="game-board-title">
    <article class="play-card">
      <div class="play-card-header">
        <div>
          <p class="eyebrow">Solo picture puzzle</p>
          <h2 id="game-board-title">Solve the Nonogram</h2>
        </div>
        <span class="play-progress">{{ correctCells }} / 25</span>
      </div>

      <div class="play-nonogram" aria-label="Nonogram board and clues">
        <div class="play-nonogram-corner" aria-hidden="true"></div>
        <div class="play-nonogram-column-clues" aria-label="Column clues">
          <span v-for="(clues, columnIndex) in columnClues" :key="columnIndex">{{ formatClues(clues) }}</span>
        </div>
        <div class="play-nonogram-row-clues" aria-label="Row clues">
          <span v-for="(clues, rowIndex) in rowClues" :key="rowIndex">{{ formatClues(clues) }}</span>
        </div>
        <div class="play-nonogram-grid" role="grid" aria-label="Playable Nonogram grid">
          <button
            v-for="(cell, cellIndex) in board.flat()"
            :key="cellIndex"
            class="play-nonogram-cell"
            :class="`play-nonogram-cell--${cell}`"
            type="button"
            :aria-label="cell === 'marked' ? 'Marked cell' : 'Empty cell'"
            :aria-pressed="cell === 'marked'"
            :disabled="isComplete"
            @click="toggleCell(cellIndex)"
          ></button>
        </div>
      </div>

      <p v-if="isComplete" class="play-success">Picture complete.</p>
      <p v-else class="play-hint">Tap a cell to switch between marked and empty.</p>
      <div class="play-action-row">
        <button class="play-secondary-button" type="button" @click="restartGame">Restart picture</button>
        <button class="play-secondary-button" type="button" @click="startRandomPuzzle">New solvable picture</button>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type NonogramCellState = 'empty' | 'marked'
type NonogramGrid = boolean[][]
type NonogramClues = number[]

const gridSize = 5
const solution = ref<NonogramGrid>(createRandomSolution())
const board = ref<NonogramCellState[][]>(createBoard())
const rowClues = computed(() => solution.value.map((row) => getClues(row)))
const columnClues = computed(() => Array.from(
  { length: gridSize },
  (_, columnIndex) => getClues(solution.value.map((row) => row[columnIndex])),
))
const correctCells = computed(() => board.value.flat().filter((state, index) => {
  const solutionCell = solution.value.flat()[index]
  return state === (solutionCell ? 'marked' : 'empty')
}).length)
const isComplete = computed(() => correctCells.value === gridSize * gridSize)

function createBoard(): NonogramCellState[][] {
  return Array.from({ length: gridSize }, () => Array.from({ length: gridSize }, () => 'empty' as NonogramCellState))
}

function getClues(cells: boolean[]): NonogramClues {
  const clues: number[] = []
  let runLength = 0

  for (const cell of cells) {
    if (cell) {
      runLength += 1
      continue
    }

    if (runLength > 0) clues.push(runLength)
    runLength = 0
  }

  if (runLength > 0) clues.push(runLength)
  return clues
}

function formatClues(clues: NonogramClues): string {
  return clues.length > 0 ? clues.join(' ') : '0'
}

function cluesMatch(first: NonogramClues, second: NonogramClues): boolean {
  return first.length === second.length && first.every((clue, index) => clue === second[index])
}

function getLineCandidates(clues: NonogramClues): boolean[][] {
  return Array.from({ length: 2 ** gridSize }, (_, mask) => Array.from(
    { length: gridSize },
    (_, cellIndex) => (mask & (1 << cellIndex)) !== 0,
  )).filter((candidate) => cluesMatch(getClues(candidate), clues))
}

function hasSingleSolution(rowHints: NonogramClues[], columnHints: NonogramClues[]): boolean {
  const rowCandidates = rowHints.map((clues) => getLineCandidates(clues))
  const columnCandidates = columnHints.map((clues) => getLineCandidates(clues))
  let solutionCount = 0

  const fillRows = (rowIndex: number, columns: boolean[][]): void => {
    if (solutionCount >= 2) return

    if (rowIndex === gridSize) {
      if (columns.every((column, columnIndex) => cluesMatch(getClues(column), columnHints[columnIndex]))) {
        solutionCount += 1
      }
      return
    }

    for (const row of rowCandidates[rowIndex]) {
      const nextColumns = columns.map((column, columnIndex) => [...column, row[columnIndex]])
      const canMatchColumns = nextColumns.every((column, columnIndex) => columnCandidates[columnIndex].some((candidate) => (
        column.every((value, cellIndex) => value === candidate[cellIndex])
      )))

      if (canMatchColumns) fillRows(rowIndex + 1, nextColumns)
    }
  }

  fillRows(0, Array.from({ length: gridSize }, () => []))
  return solutionCount === 1
}

function createRandomSolution(): NonogramGrid {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    const candidate = Array.from(
      { length: gridSize },
      () => Array.from({ length: gridSize }, () => Math.random() < 0.48),
    )
    const markedCells = candidate.flat().filter(Boolean).length

    if (markedCells < 7 || markedCells > 18) continue

    const nextRowClues = candidate.map((row) => getClues(row))
    const nextColumnClues = Array.from(
      { length: gridSize },
      (_, columnIndex) => getClues(candidate.map((row) => row[columnIndex])),
    )

    if (hasSingleSolution(nextRowClues, nextColumnClues)) return candidate
  }

  return [
    [false, false, true, false, false],
    [false, true, true, true, false],
    [true, true, true, true, true],
    [false, true, true, true, false],
    [true, false, true, false, true],
  ]
}

function toggleCell(cellIndex: number): void {
  const rowIndex = Math.floor(cellIndex / gridSize)
  const columnIndex = cellIndex % gridSize
  board.value[rowIndex][columnIndex] = board.value[rowIndex][columnIndex] === 'marked' ? 'empty' : 'marked'
}

function restartGame(): void {
  board.value = createBoard()
}

function startRandomPuzzle(): void {
  solution.value = createRandomSolution()
  restartGame()
}
</script>
