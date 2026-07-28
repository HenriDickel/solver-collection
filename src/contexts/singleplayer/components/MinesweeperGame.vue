<template>
  <section class="play-layout" aria-labelledby="game-board-title">
    <article class="play-card">
      <div class="play-card-header">
        <div>
          <p class="eyebrow">Solo puzzle</p>
          <h2 id="game-board-title">Clear the minefield</h2>
        </div>
        <span class="play-progress">{{ revealedSafeCells }} / {{ safeCellCount }} safe</span>
      </div>

      <div class="play-mine-board" role="grid" aria-label="Minesweeper board">
        <button
          v-for="(cell, cellIndex) in board.flat()"
          :key="cellIndex"
          class="play-mine-cell"
          :class="{
            'play-mine-cell--flagged': cell.state === 'flagged',
            'play-mine-cell--hidden': cell.state === 'hidden',
            'play-mine-cell--mine': cell.hasMine && cell.state === 'revealed',
            'play-mine-cell--revealed': cell.state === 'revealed',
          }"
          type="button"
          :aria-label="getCellLabel(cellIndex)"
          :disabled="isFinished"
          @click="handleCell(cellIndex)"
          @contextmenu.prevent="toggleFlag(cellIndex)"
        >
          <span v-if="cell.state === 'flagged'" class="mine-flag" aria-hidden="true">&#9873;</span>
          <span v-else-if="cell.hasMine && cell.state === 'revealed'" aria-hidden="true">&#128163;</span>
          <span v-else-if="cell.state === 'revealed'" class="mine-clue" :class="`mine-clue--${cell.clue}`">
            {{ cell.clue === 0 ? '' : cell.clue }}
          </span>
        </button>
      </div>

      <p class="play-hint">{{ statusMessage }}</p>
      <div class="play-action-row">
        <button
          class="play-secondary-button"
          type="button"
          :aria-pressed="isFlagMode"
          @click="isFlagMode = !isFlagMode"
        >
          {{ isFlagMode ? 'Mark mines: on' : 'Mark mines: off' }} ({{ minesRemaining }} left)
        </button>
        <button class="play-secondary-button" type="button" @click="startNewGame">New game</button>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type MinesweeperCellState = 'flagged' | 'hidden' | 'revealed'
type MinesweeperGameState = 'lost' | 'playing' | 'ready' | 'won'

interface MinesweeperCell {
  clue: number
  hasMine: boolean
  state: MinesweeperCellState
}

type MinesweeperBoard = MinesweeperCell[][]

const boardSize = 9
const mineCount = 10
const safeCellCount = boardSize * boardSize - mineCount
const board = ref<MinesweeperBoard>(createEmptyBoard())
const gameState = ref<MinesweeperGameState>('ready')
const isFlagMode = ref(false)

const flaggedCells = computed(() => board.value.flat().filter((cell) => cell.state === 'flagged').length)
const minesRemaining = computed(() => mineCount - flaggedCells.value)
const revealedSafeCells = computed(() => gameState.value === 'ready'
  ? 0
  : board.value.flat().filter((cell) => !cell.hasMine && cell.state === 'revealed').length)
const isFinished = computed(() => gameState.value === 'lost' || gameState.value === 'won')
const statusMessage = computed(() => {
  if (gameState.value === 'ready') return 'Reveal a square to start. Your first move and its neighbors are always safe.'
  if (gameState.value === 'lost') return 'A mine exploded. Start a new game to try again.'
  if (gameState.value === 'won') return 'Minefield cleared — nicely done.'
  return isFlagMode.value ? 'Mark mines mode is on. Tap a covered square to flag or clear it.' : 'Tap a covered square to reveal it. Use Mark mines when you want to flag one.'
})

function getCellKey(rowIndex: number, columnIndex: number): string {
  return `${rowIndex}-${columnIndex}`
}

function getNeighbors(rowIndex: number, columnIndex: number): Array<[number, number]> {
  const neighbors: Array<[number, number]> = []

  for (let row = rowIndex - 1; row <= rowIndex + 1; row += 1) {
    for (let column = columnIndex - 1; column <= columnIndex + 1; column += 1) {
      const isCurrentCell = row === rowIndex && column === columnIndex
      const isInsideBoard = row >= 0 && row < boardSize && column >= 0 && column < boardSize

      if (!isCurrentCell && isInsideBoard) neighbors.push([row, column])
    }
  }

  return neighbors
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items]

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[result[index], result[swapIndex]] = [result[swapIndex], result[index]]
  }

  return result
}

function createEmptyBoard(): MinesweeperBoard {
  return Array.from({ length: boardSize }, () => Array.from(
    { length: boardSize },
    (): MinesweeperCell => ({ clue: 0, hasMine: false, state: 'hidden' }),
  ))
}

function createBoard(firstRowIndex: number, firstColumnIndex: number): MinesweeperBoard {
  const protectedCells = new Set([
    getCellKey(firstRowIndex, firstColumnIndex),
    ...getNeighbors(firstRowIndex, firstColumnIndex).map(([rowIndex, columnIndex]) => getCellKey(rowIndex, columnIndex)),
  ])
  const availableCells: string[] = []

  for (let rowIndex = 0; rowIndex < boardSize; rowIndex += 1) {
    for (let columnIndex = 0; columnIndex < boardSize; columnIndex += 1) {
      const cellKey = getCellKey(rowIndex, columnIndex)
      if (!protectedCells.has(cellKey)) availableCells.push(cellKey)
    }
  }

  const mines = new Set(shuffle(availableCells).slice(0, mineCount))

  return Array.from({ length: boardSize }, (_, rowIndex) => Array.from({ length: boardSize }, (_, columnIndex) => {
    const cellKey = getCellKey(rowIndex, columnIndex)
    const hasMine = mines.has(cellKey)
    const clue = hasMine ? 0 : getNeighbors(rowIndex, columnIndex)
      .filter(([row, column]) => mines.has(getCellKey(row, column))).length

    return { clue, hasMine, state: 'hidden' }
  }))
}

function revealCell(rowIndex: number, columnIndex: number): void {
  const selectedCell = board.value[rowIndex][columnIndex]
  if (selectedCell.state !== 'hidden') return

  if (selectedCell.hasMine) {
    selectedCell.state = 'revealed'
    gameState.value = 'lost'

    for (const cell of board.value.flat()) {
      if (cell.hasMine) cell.state = 'revealed'
    }
    return
  }

  const cellsToReveal: Array<[number, number]> = [[rowIndex, columnIndex]]

  while (cellsToReveal.length > 0) {
    const nextCell = cellsToReveal.pop()
    if (nextCell === undefined) continue

    const [nextRowIndex, nextColumnIndex] = nextCell
    const cell = board.value[nextRowIndex][nextColumnIndex]

    if (cell.state !== 'hidden' || cell.hasMine) continue
    cell.state = 'revealed'

    if (cell.clue === 0) {
      for (const neighbor of getNeighbors(nextRowIndex, nextColumnIndex)) {
        cellsToReveal.push(neighbor)
      }
    }
  }

  if (revealedSafeCells.value === safeCellCount) gameState.value = 'won'
}

function toggleFlag(cellIndex: number): void {
  if (isFinished.value || gameState.value === 'ready') return

  const rowIndex = Math.floor(cellIndex / boardSize)
  const columnIndex = cellIndex % boardSize
  const cell = board.value[rowIndex][columnIndex]

  if (cell.state === 'revealed') return

  if (cell.state === 'hidden') {
    if (flaggedCells.value === mineCount) return
    cell.state = 'flagged'
    return
  }

  cell.state = 'hidden'
}

function handleCell(cellIndex: number): void {
  const rowIndex = Math.floor(cellIndex / boardSize)
  const columnIndex = cellIndex % boardSize

  if (gameState.value === 'ready') {
    board.value = createBoard(rowIndex, columnIndex)
    gameState.value = 'playing'
    revealCell(rowIndex, columnIndex)
    return
  }

  if (isFlagMode.value) {
    toggleFlag(cellIndex)
    return
  }

  revealCell(rowIndex, columnIndex)
}

function getCellLabel(cellIndex: number): string {
  const rowIndex = Math.floor(cellIndex / boardSize)
  const columnIndex = cellIndex % boardSize
  const cell = board.value[rowIndex][columnIndex]
  const position = `Row ${rowIndex + 1}, column ${columnIndex + 1}`

  if (cell.state === 'hidden') return `${position}: covered`
  if (cell.state === 'flagged') return `${position}: marked as a mine`
  if (cell.hasMine) return `${position}: mine`
  return `${position}: ${cell.clue === 0 ? 'no adjacent mines' : `${cell.clue} adjacent mines`}`
}

function startNewGame(): void {
  board.value = createEmptyBoard()
  gameState.value = 'ready'
  isFlagMode.value = false
}
</script>
