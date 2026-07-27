import { defineStore } from 'pinia'
import type {
  MinesweeperBoard,
  MinesweeperCell,
} from '../types/minesweeper'
import type { SolverLog, SolverLogLevel, SolverMode } from '../types/solver'
import { getGridCellKey } from '../utils/grid'
import { createSolverRunController, waitForSolverStep } from '../utils/solver-run'

const boardSize = 15
const autoStepDelay = 350
const maxAutoSteps = 50
const mineLocations = new Set([
  '0-13', '0-14', '1-2', '1-7', '1-10', '1-11', '2-2', '2-5', '2-7', '2-14',
  '3-12', '5-6', '5-7', '5-13', '7-6', '7-12', '7-13', '8-1', '8-8', '9-0',
  '9-1', '9-2', '10-4', '10-10', '10-11', '10-12', '11-0', '11-2', '11-3', '11-6',
  '12-4', '12-12', '12-14', '13-1', '13-3', '13-4', '13-8', '13-10', '14-5', '14-6',
])
const initiallyHiddenSafeCells = new Set([
  '0-1', '0-2', '0-3', '0-4', '0-5', '0-6', '0-7', '0-12', '1-0', '1-1',
  '1-3', '1-5', '1-6', '1-13', '2-1', '2-9', '2-11', '2-12', '3-0', '3-4',
  '3-5', '3-11', '6-2', '7-4', '7-5', '7-7', '7-9', '7-11', '8-6', '8-7',
  '9-4', '9-9', '10-13', '10-14', '12-0',
])

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

function getClue(rowIndex: number, columnIndex: number): number | null {
  if (mineLocations.has(getGridCellKey(rowIndex, columnIndex))) {
    return null
  }

  return getNeighbors(rowIndex, columnIndex).filter(([row, column]) => mineLocations.has(getGridCellKey(row, column))).length
}

function createInitialBoard(): MinesweeperBoard {
  return Array.from({ length: boardSize }, (_, rowIndex) =>
    Array.from({ length: boardSize }, (_, columnIndex) => {
      const cellKey = getGridCellKey(rowIndex, columnIndex)
      const isMine = mineLocations.has(cellKey)
      const isHiddenSafeCell = initiallyHiddenSafeCells.has(cellKey)

      return {
        clue: getClue(rowIndex, columnIndex),
        state: isMine || isHiddenSafeCell ? 'hidden' : 'revealed',
      }
    }),
  )
}

export const useMinesweeperStore = defineStore('minesweeper', {
  state: () => ({
    board: createInitialBoard(),
    isAutoSolving: false,
    logs: [] as SolverLog[],
    nextLogId: 1,
    recentlyUpdatedCells: [] as string[],
    solverMode: 'ready' as SolverMode,
  }),
  getters: {
    flaggedMines: (state) => state.board.flat().filter((cell) => cell.state === 'flagged').length,
    mineCount: () => mineLocations.size,
  },
  actions: {
    addLog(message: string, level: SolverLogLevel = 'info') {
      this.logs.push({ id: this.nextLogId, level, message })
      this.nextLogId += 1
    },
    resetBoard() {
      autoRunController.cancel()
      this.board = createInitialBoard()
      this.isAutoSolving = false
      this.logs = []
      this.nextLogId = 1
      this.recentlyUpdatedCells = []
      this.solverMode = 'ready'
      this.addLog('Board reset. The solver is ready.')
    },
    getCell(rowIndex: number, columnIndex: number): MinesweeperCell {
      return this.board[rowIndex][columnIndex]
    },
    advanceSolver() {
      if (this.solverMode === 'solved' || this.solverMode === 'stuck') return

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
      if (this.solverMode === 'solved' || this.solverMode === 'stuck' || this.isAutoSolving) return

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
