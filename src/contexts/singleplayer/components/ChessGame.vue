<template>
  <section class="play-layout" aria-labelledby="game-board-title">
    <article class="play-card">
      <div class="play-card-header">
        <div>
          <p class="eyebrow">Solo match</p>
          <h2 id="game-board-title">Kill the King chess</h2>
        </div>
        <span class="play-progress">{{ computerThinking ? 'Thinking…' : winner ?? 'Your move' }}</span>
      </div>

      <div class="play-chess-grid" role="grid" aria-label="Kill the King chess board">
        <button
          v-for="(piece, cellIndex) in board.flat()"
          :key="cellIndex"
          class="play-chess-cell"
          :class="{
            'play-chess-cell--dark': (Math.floor(cellIndex / 8) + cellIndex % 8) % 2 === 1,
            'play-chess-cell--selected': isSelected(cellIndex),
            'play-chess-cell--target': isLegalTarget(cellIndex),
            'play-chess-cell--white': piece !== null && getPieceColor(piece) === 'white',
          }"
          type="button"
          :disabled="computerThinking || winner !== null"
          @click="selectSquare(cellIndex)"
        >
          <span v-if="piece" :aria-label="getPieceName(piece)">{{ getPieceSymbol(piece) }}</span>
        </button>
      </div>

      <p class="play-hint">{{ statusMessage }} Capture the opposing king to win. Check and checkmate do not apply.</p>
      <button class="play-secondary-button" type="button" @click="startNewGame">New game</button>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type PieceColor = 'white' | 'black'
type ChessPiece = 'bp' | 'bb' | 'bn' | 'br' | 'bq' | 'bk' | 'wp' | 'wb' | 'wn' | 'wr' | 'wq' | 'wk'
type ChessBoard = Array<Array<ChessPiece | null>>

interface ChessPosition {
  columnIndex: number
  rowIndex: number
}

interface ChessMove {
  from: ChessPosition
  to: ChessPosition
}

const pieceSymbols: Record<ChessPiece, string> = {
  bb: '♝', bk: '♚', bn: '♞', bp: '♟', bq: '♛', br: '♜',
  wb: '♗', wk: '♔', wn: '♘', wp: '♙', wq: '♕', wr: '♖',
}

const board = ref<ChessBoard>(createStartingBoard())
const selectedPosition = ref<ChessPosition | null>(null)
const computerThinking = ref(false)
const winner = ref<'You win' | 'Computer wins' | null>(null)
const statusMessage = ref('You play white. Select one of your pieces to move.')

const selectedMoves = computed(() => (
  selectedPosition.value === null ? [] : getLegalMoves(board.value, selectedPosition.value)
))

function createStartingBoard(): ChessBoard {
  return [
    ['br', 'bn', 'bb', 'bq', 'bk', 'bb', 'bn', 'br'],
    ['bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp'],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ['wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp'],
    ['wr', 'wn', 'wb', 'wq', 'wk', 'wb', 'wn', 'wr'],
  ]
}

function getPieceColor(piece: ChessPiece): PieceColor {
  return piece.startsWith('w') ? 'white' : 'black'
}

function getPieceName(piece: ChessPiece): string {
  const color = getPieceColor(piece)
  const names: Record<ChessPiece, string> = {
    bb: 'bishop', bk: 'king', bn: 'knight', bp: 'pawn', bq: 'queen', br: 'rook',
    wb: 'bishop', wk: 'king', wn: 'knight', wp: 'pawn', wq: 'queen', wr: 'rook',
  }
  return `${color} ${names[piece]}`
}

function getPieceSymbol(piece: ChessPiece): string {
  return pieceSymbols[piece]
}

function isInsideBoard(position: ChessPosition): boolean {
  return position.rowIndex >= 0 && position.rowIndex < 8 && position.columnIndex >= 0 && position.columnIndex < 8
}

function positionsMatch(first: ChessPosition, second: ChessPosition): boolean {
  return first.rowIndex === second.rowIndex && first.columnIndex === second.columnIndex
}

function getLegalMoves(currentBoard: ChessBoard, from: ChessPosition): ChessPosition[] {
  const piece = currentBoard[from.rowIndex][from.columnIndex]
  if (piece === null) return []

  const color = getPieceColor(piece)
  const moves: ChessPosition[] = []
  const addMove = (position: ChessPosition): boolean => {
    if (!isInsideBoard(position)) return false

    const target = currentBoard[position.rowIndex][position.columnIndex]
    if (target === null) {
      moves.push(position)
      return true
    }

    if (getPieceColor(target) !== color) moves.push(position)
    return false
  }
  const addSlidingMoves = (directions: Array<[number, number]>): void => {
    for (const [rowOffset, columnOffset] of directions) {
      let nextPosition = {
        columnIndex: from.columnIndex + columnOffset,
        rowIndex: from.rowIndex + rowOffset,
      }

      while (addMove(nextPosition)) {
        nextPosition = {
          columnIndex: nextPosition.columnIndex + columnOffset,
          rowIndex: nextPosition.rowIndex + rowOffset,
        }
      }
    }
  }

  if (piece.endsWith('p')) {
    const direction = color === 'white' ? -1 : 1
    const startRow = color === 'white' ? 6 : 1
    const oneStep = { columnIndex: from.columnIndex, rowIndex: from.rowIndex + direction }

    if (isInsideBoard(oneStep) && currentBoard[oneStep.rowIndex][oneStep.columnIndex] === null) {
      moves.push(oneStep)
      const twoStep = { columnIndex: from.columnIndex, rowIndex: from.rowIndex + direction * 2 }

      if (from.rowIndex === startRow && currentBoard[twoStep.rowIndex][twoStep.columnIndex] === null) moves.push(twoStep)
    }

    for (const columnOffset of [-1, 1]) {
      const capturePosition = { columnIndex: from.columnIndex + columnOffset, rowIndex: from.rowIndex + direction }

      if (!isInsideBoard(capturePosition)) continue
      const target = currentBoard[capturePosition.rowIndex][capturePosition.columnIndex]
      if (target !== null && getPieceColor(target) !== color) moves.push(capturePosition)
    }
  } else if (piece.endsWith('n')) {
    for (const [rowOffset, columnOffset] of [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]]) {
      addMove({ columnIndex: from.columnIndex + columnOffset, rowIndex: from.rowIndex + rowOffset })
    }
  } else if (piece.endsWith('b')) {
    addSlidingMoves([[-1, -1], [-1, 1], [1, -1], [1, 1]])
  } else if (piece.endsWith('r')) {
    addSlidingMoves([[-1, 0], [0, -1], [0, 1], [1, 0]])
  } else if (piece.endsWith('q')) {
    addSlidingMoves([[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]])
  } else {
    for (const [rowOffset, columnOffset] of [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]) {
      addMove({ columnIndex: from.columnIndex + columnOffset, rowIndex: from.rowIndex + rowOffset })
    }
  }

  return moves
}

function isSelected(cellIndex: number): boolean {
  return selectedPosition.value !== null
    && selectedPosition.value.rowIndex === Math.floor(cellIndex / 8)
    && selectedPosition.value.columnIndex === cellIndex % 8
}

function isLegalTarget(cellIndex: number): boolean {
  const target = { columnIndex: cellIndex % 8, rowIndex: Math.floor(cellIndex / 8) }
  return selectedMoves.value.some((move) => positionsMatch(move, target))
}

function selectSquare(cellIndex: number): void {
  const position = { columnIndex: cellIndex % 8, rowIndex: Math.floor(cellIndex / 8) }
  const piece = board.value[position.rowIndex][position.columnIndex]

  if (selectedPosition.value === null) {
    if (piece !== null && getPieceColor(piece) === 'white') {
      selectedPosition.value = position
      statusMessage.value = 'Choose one of the highlighted squares.'
    }
    return
  }

  const canMove = selectedMoves.value.some((move) => positionsMatch(move, position))

  if (canMove) {
    makeMove({ from: selectedPosition.value, to: position })
    selectedPosition.value = null

    if (winner.value === null) {
      computerThinking.value = true
      statusMessage.value = 'The computer is choosing a move…'
      window.setTimeout(makeComputerMove, 480)
    }
    return
  }

  selectedPosition.value = piece !== null && getPieceColor(piece) === 'white' ? position : null
  statusMessage.value = selectedPosition.value === null ? 'Select one of your white pieces.' : 'Choose one of the highlighted squares.'
}

function makeMove(move: ChessMove): void {
  const movingPiece = board.value[move.from.rowIndex][move.from.columnIndex]
  const capturedPiece = board.value[move.to.rowIndex][move.to.columnIndex]

  if (movingPiece === null) return

  board.value[move.to.rowIndex][move.to.columnIndex] = movingPiece
  board.value[move.from.rowIndex][move.from.columnIndex] = null

  if (capturedPiece === 'bk') {
    winner.value = 'You win'
    statusMessage.value = 'You captured the king. You win!'
  } else if (capturedPiece === 'wk') {
    winner.value = 'Computer wins'
    statusMessage.value = 'The computer captured your king.'
  }
}

function makeComputerMove(): void {
  const availableMoves: ChessMove[] = []

  for (let rowIndex = 0; rowIndex < 8; rowIndex += 1) {
    for (let columnIndex = 0; columnIndex < 8; columnIndex += 1) {
      const piece = board.value[rowIndex][columnIndex]
      if (piece === null || getPieceColor(piece) !== 'black') continue

      const from = { columnIndex, rowIndex }
      for (const to of getLegalMoves(board.value, from)) {
        availableMoves.push({ from, to })
      }
    }
  }

  const captureMoves = availableMoves.filter((move) => board.value[move.to.rowIndex][move.to.columnIndex] !== null)
  const movePool = captureMoves.length > 0 ? captureMoves : availableMoves
  const move = movePool[Math.floor(Math.random() * movePool.length)]

  computerThinking.value = false

  if (!move) {
    winner.value = 'You win'
    statusMessage.value = 'The computer has no move left. You win!'
    return
  }

  makeMove(move)
  if (winner.value === null) statusMessage.value = 'Your move. Select a white piece.'
}

function startNewGame(): void {
  board.value = createStartingBoard()
  selectedPosition.value = null
  computerThinking.value = false
  winner.value = null
  statusMessage.value = 'You play white. Select one of your pieces to move.'
}
</script>
