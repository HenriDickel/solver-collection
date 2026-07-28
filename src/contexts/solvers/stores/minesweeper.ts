import { defineStore } from 'pinia'
import type {
  MinesweeperBoard,
  MinesweeperCell,
} from '../types/minesweeper'
import type { SolverLog, SolverLogLevel, SolverMode } from '../types/solver'
import { ExamplePool } from '../utils/example-pool'
import { getGridCellKey } from '../utils/grid'
import { shuffle } from '../utils/random'
import { createSolverRunController, waitForSolverStep } from '../utils/solver-run'

const boardSize = 15
const autoStepDelay = 350
const maxAutoSteps = 50
const totalMineCount = 40

const autoRunController = createSolverRunController()

function getNeighbors(rowIndex: number, columnIndex: number): Array<[number, number]> {
  const neighbors: Array<[number, number]> = []

  for (let row = rowIndex - 1; row <= rowIndex + 1; row += 1) {
    for (let column = columnIndex - 1; column <= columnIndex + 1; column += 1) {
      const isCurrentCell = row === rowIndex && column === columnIndex
      const isWithinBoard = row >= 0 && row < boardSize && column >= 0 && column < boardSize

      if (!isCurrentCell && isWithinBoard) {
        neighbors.push([row, column])
      }
    }
  }

  return neighbors
}

function getClue(rowIndex: number, columnIndex: number, mines: ReadonlySet<string>): number | null {
  if (mines.has(getGridCellKey(rowIndex, columnIndex))) {
    return null
  }

  return getNeighbors(rowIndex, columnIndex).filter(([row, column]) => mines.has(getGridCellKey(row, column))).length
}

function createBoard(mines: ReadonlySet<string>, hiddenSafeCells: ReadonlySet<string>): MinesweeperBoard {
  return Array.from({ length: boardSize }, (_, rowIndex) =>
    Array.from({ length: boardSize }, (_, columnIndex) => {
      const cellKey = getGridCellKey(rowIndex, columnIndex)
      const isMine = mines.has(cellKey)
      const isHiddenSafeCell = hiddenSafeCells.has(cellKey)

      return {
        clue: getClue(rowIndex, columnIndex, mines),
        state: isMine || isHiddenSafeCell ? 'hidden' : 'revealed',
      }
    }),
  )
}

function cloneBoard(board: MinesweeperBoard): MinesweeperBoard {
  return board.map((row) => row.map((cell) => ({ ...cell })))
}

function applyCertainMoves(board: MinesweeperBoard): boolean {
  const safeCells = new Set<string>()
  const mineCells = new Set<string>()

  for (let rowIndex = 0; rowIndex < boardSize; rowIndex += 1) {
    for (let columnIndex = 0; columnIndex < boardSize; columnIndex += 1) {
      const cell = board[rowIndex][columnIndex]

      if (cell.state !== 'revealed' || cell.clue === null || cell.clue === 0) continue

      const neighbors = getNeighbors(rowIndex, columnIndex)
      const hiddenNeighbors = neighbors.filter(([row, column]) => board[row][column].state === 'hidden')
      const flaggedNeighbors = neighbors.filter(([row, column]) => board[row][column].state === 'flagged')
      const remainingMines = cell.clue - flaggedNeighbors.length

      if (hiddenNeighbors.length === 0) continue

      if (remainingMines === 0) {
        for (const [row, column] of hiddenNeighbors) {
          safeCells.add(getGridCellKey(row, column))
        }
      } else if (remainingMines === hiddenNeighbors.length) {
        for (const [row, column] of hiddenNeighbors) {
          mineCells.add(getGridCellKey(row, column))
        }
      }
    }
  }

  let updatedCells = 0

  for (const cellKey of mineCells) {
    safeCells.delete(cellKey)
    const [rowIndex, columnIndex] = cellKey.split('-').map(Number)
    const cell = board[rowIndex][columnIndex]

    if (cell.state === 'hidden') {
      cell.state = 'flagged'
      updatedCells += 1
    }
  }

  for (const cellKey of safeCells) {
    const [rowIndex, columnIndex] = cellKey.split('-').map(Number)
    const cell = board[rowIndex][columnIndex]

    if (cell.state === 'hidden') {
      cell.state = 'revealed'
      updatedCells += 1
    }
  }

  return updatedCells > 0
}

function getSolvingStepCount(board: MinesweeperBoard): number | null {
  const candidateBoard = cloneBoard(board)

  for (let step = 0; step < maxAutoSteps; step += 1) {
    if (candidateBoard.flat().every((cell) => cell.state !== 'hidden')) return step
    if (!applyCertainMoves(candidateBoard)) return null
  }

  return candidateBoard.flat().every((cell) => cell.state !== 'hidden') ? maxAutoSteps : null
}

function createGuaranteedSolvableBoard(): MinesweeperBoard {
  const candidateMineCells: string[] = []

  for (let rowIndex = 0; rowIndex < boardSize; rowIndex += 2) {
    for (let columnIndex = 0; columnIndex < boardSize; columnIndex += 2) {
      candidateMineCells.push(getGridCellKey(rowIndex, columnIndex))
    }
  }

  return createBoard(new Set(shuffle(candidateMineCells).slice(0, totalMineCount)), new Set())
}

function createRandomSolvableBoard(): MinesweeperBoard {
  let bestBoard = createGuaranteedSolvableBoard()
  let bestScore = -1

  for (let attempt = 0; attempt < 12; attempt += 1) {
    let board = createGuaranteedSolvableBoard()
    const safeCells = board.flatMap((row, rowIndex) => row.flatMap((cell, columnIndex) => (
      cell.clue === null ? [] : [getGridCellKey(rowIndex, columnIndex)]
    )))

    for (const cellKey of shuffle(safeCells)) {
      const [rowIndex, columnIndex] = cellKey.split('-').map(Number)
      const candidateBoard = cloneBoard(board)
      candidateBoard[rowIndex][columnIndex].state = 'hidden'

      if (getSolvingStepCount(candidateBoard) !== null) {
        board = candidateBoard
      }
    }

    const steps = getSolvingStepCount(board)
    const hiddenSafeCells = board.flat().filter((cell) => cell.clue !== null && cell.state === 'hidden').length
    const score = (steps ?? 0) * 1000 + hiddenSafeCells

    if (score > bestScore) {
      bestBoard = board
      bestScore = score
    }
  }

  return bestBoard
}

const minesweeperExamplePool = new ExamplePool<MinesweeperBoard>(createRandomSolvableBoard)

export const useMinesweeperStore = defineStore('minesweeper', {
  state: () => ({
    board: [] as MinesweeperBoard,
    hasExample: false,
    isAutoSolving: false,
    isExampleLoading: false,
    logs: [] as SolverLog[],
    nextLogId: 1,
    recentlyUpdatedCells: [] as string[],
    solverMode: 'ready' as SolverMode,
  }),
  getters: {
    flaggedMines: (state) => state.board.flat().filter((cell) => cell.state === 'flagged').length,
    mineCount: () => totalMineCount,
  },
  actions: {
    addLog(message: string, level: SolverLogLevel = 'info') {
      this.logs.push({ id: this.nextLogId, level, message })
      this.nextLogId += 1
    },
    loadRandomExample() {
      autoRunController.cancel()
      this.isAutoSolving = false

      if (this.isExampleLoading) return

      this.isExampleLoading = true
      minesweeperExamplePool.take((board) => {
        this.board = board
        this.hasExample = true
        this.isExampleLoading = false
        this.logs = []
        this.nextLogId = 1
        this.recentlyUpdatedCells = []
        this.solverMode = 'ready'
        this.addLog('Random Minesweeper board generated.')
      })
    },
    getCell(rowIndex: number, columnIndex: number): MinesweeperCell {
      return this.board[rowIndex][columnIndex]
    },
    advanceSolver() {
      if (!this.hasExample || this.solverMode === 'solved' || this.solverMode === 'stuck') return

      if (this.solverMode === 'ready') {
        this.logs = []
        this.nextLogId = 1
        this.solverMode = 'solving'
        this.addLog('Solver started. Checking all revealed clues.', 'success')
      }

      this.recentlyUpdatedCells = []

      const safeCells = new Set<string>()
      const mineCells = new Set<string>()
      this.addLog('Comparing each clue with its hidden neighbors.')

      for (let rowIndex = 0; rowIndex < boardSize; rowIndex += 1) {
        for (let columnIndex = 0; columnIndex < boardSize; columnIndex += 1) {
          const cell = this.getCell(rowIndex, columnIndex)

          if (cell.state !== 'revealed' || cell.clue === null || cell.clue === 0) continue

          const neighbors = getNeighbors(rowIndex, columnIndex)
          const hiddenNeighbors = neighbors.filter(([row, column]) => this.getCell(row, column).state === 'hidden')
          const flaggedNeighbors = neighbors.filter(([row, column]) => this.getCell(row, column).state === 'flagged')
          const remainingMines = cell.clue - flaggedNeighbors.length

          if (hiddenNeighbors.length === 0) continue

          if (remainingMines === 0) {
            for (const [row, column] of hiddenNeighbors) {
              safeCells.add(getGridCellKey(row, column))
            }
          } else if (remainingMines === hiddenNeighbors.length) {
            for (const [row, column] of hiddenNeighbors) {
              mineCells.add(getGridCellKey(row, column))
            }
          }
        }
      }

      for (const cellKey of mineCells) {
        safeCells.delete(cellKey)
        const [rowIndex, columnIndex] = cellKey.split('-').map(Number)
        const cell = this.getCell(rowIndex, columnIndex)

        if (cell.state === 'hidden') {
          cell.state = 'flagged'
          this.recentlyUpdatedCells.push(cellKey)
          this.addLog(`R${rowIndex + 1} C${columnIndex + 1} is flagged as a mine.`, 'success')
        }
      }

      for (const cellKey of safeCells) {
        const [rowIndex, columnIndex] = cellKey.split('-').map(Number)
        const cell = this.getCell(rowIndex, columnIndex)

        if (cell.state === 'hidden') {
          cell.state = 'revealed'
          this.recentlyUpdatedCells.push(cellKey)
          this.addLog(`R${rowIndex + 1} C${columnIndex + 1} is safe and revealed.`, 'success')
        }
      }

      if (this.board.flat().every((cell) => cell.state !== 'hidden')) {
        this.solverMode = 'solved'
        this.addLog('All mines are flagged and all safe cells are revealed.', 'success')
        return
      }

      if (this.recentlyUpdatedCells.length === 0) {
        this.solverMode = 'stuck'
        this.addLog('No certain move was found. This board needs a more advanced strategy.', 'warning')
        return
      }

      this.addLog(`${this.recentlyUpdatedCells.length} certain moves were applied.`, 'success')
    },
    async autoSolve() {
      if (!this.hasExample || this.solverMode === 'solved' || this.solverMode === 'stuck' || this.isAutoSolving) return

      const autoRun = autoRunController.start()
      this.isAutoSolving = true
      this.addLog('Auto solve started.', 'success')

      let completedSteps = 0

      while ((this.solverMode === 'ready' || this.solverMode === 'solving') && completedSteps < maxAutoSteps) {
        await waitForSolverStep(autoStepDelay)

        if (!autoRunController.isCurrent(autoRun)) return

        this.advanceSolver()
        completedSteps += 1
      }

      if (!autoRunController.isCurrent(autoRun)) return

      this.isAutoSolving = false
      const finalMode = this.solverMode as SolverMode

      if (finalMode === 'solved') {
        this.addLog(`Auto solve completed after ${completedSteps} steps.`, 'success')
      } else if (finalMode === 'stuck') {
        this.addLog(`Auto solve stopped after ${completedSteps} steps.`, 'warning')
      } else {
        this.solverMode = 'stuck'
        this.addLog(`Auto solve stopped after reaching the ${maxAutoSteps}-step limit.`, 'warning')
      }
    },
  },
})
