import { defineStore } from 'pinia'
import type {
  SolverStep,
  SudokuCandidate,
  SudokuCandidateGrid,
  SudokuGrid,
} from '../types/sudoku'
import type { SolverLog, SolverLogLevel, SolverMode } from '../types/solver'
import { getGridCellKey } from '../utils/grid'
import { shuffle } from '../utils/random'
import { createSolverRunController, waitForSolverStep } from '../utils/solver-run'

const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const autoStepDelay = 300
const maxAutoSteps = 100

const autoRunController = createSolverRunController()
const basePuzzle: SudokuGrid = [
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

function createInitialBoard(): SudokuGrid {
  return basePuzzle.map((row) => [...row])
}

function createBandPreservingPermutation(): number[] {
  return shuffle([0, 1, 2]).flatMap((groupIndex) =>
    shuffle([0, 1, 2]).map((offset) => groupIndex * 3 + offset),
  )
}

function createRandomBoard(): SudokuGrid {
  const rowIndexes = createBandPreservingPermutation()
  const columnIndexes = createBandPreservingPermutation()
  const shuffledDigits = shuffle(digits)
  const digitMap = new Map(digits.map((digit, index) => [digit, shuffledDigits[index]]))

  return rowIndexes.map((rowIndex) =>
    columnIndexes.map((columnIndex) => {
      const value = basePuzzle[rowIndex][columnIndex]
      return value === null ? null : digitMap.get(value) ?? value
    }),
  )
}

function getCandidatesForBoard(board: SudokuGrid, rowIndex: number, columnIndex: number): SudokuCandidate {
  if (board[rowIndex][columnIndex] !== null) return []

  const usedValues = new Set<number>()

  for (const value of board[rowIndex]) {
    if (value !== null) usedValues.add(value)
  }

  for (const row of board) {
    const value = row[columnIndex]
    if (value !== null) usedValues.add(value)
  }

  const boxRowStart = Math.floor(rowIndex / 3) * 3
  const boxColumnStart = Math.floor(columnIndex / 3) * 3

  for (let row = boxRowStart; row < boxRowStart + 3; row += 1) {
    for (let column = boxColumnStart; column < boxColumnStart + 3; column += 1) {
      const value = board[row][column]
      if (value !== null) usedValues.add(value)
    }
  }

  return digits.filter((digit) => !usedValues.has(digit))
}

function isSolvableBySingles(board: SudokuGrid): boolean {
  const candidateBoard = board.map((row) => [...row])

  for (let step = 0; step < maxAutoSteps; step += 1) {
    const singleCells: Array<[number, number, number]> = []
    let emptyCells = 0

    for (let rowIndex = 0; rowIndex < 9; rowIndex += 1) {
      for (let columnIndex = 0; columnIndex < 9; columnIndex += 1) {
        if (candidateBoard[rowIndex][columnIndex] !== null) continue

        emptyCells += 1
        const candidates = getCandidatesForBoard(candidateBoard, rowIndex, columnIndex)

        if (candidates.length === 0) return false
        if (candidates.length === 1) singleCells.push([rowIndex, columnIndex, candidates[0]])
      }
    }

    if (emptyCells === 0) return true
    if (singleCells.length === 0) return false

    for (const [rowIndex, columnIndex, value] of singleCells) {
      candidateBoard[rowIndex][columnIndex] = value
    }
  }

  return false
}

function createRandomSolvableBoard(): SudokuGrid {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const board = createRandomBoard()

    if (isSolvableBySingles(board)) return board
  }

  return createInitialBoard()
}

function createEmptyCandidateGrid(): SudokuCandidateGrid {
  return Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => []))
}

export const useSudokuStore = defineStore('sudoku', {
  state: () => ({
    board: createInitialBoard(),
    candidates: createEmptyCandidateGrid(),
    isAutoSolving: false,
    logs: [] as SolverLog[],
    nextLogId: 1,
    nextStep: 'checkCandidates' as SolverStep,
    recentlyPlacedCells: [] as string[],
    solverMode: 'ready' as SolverMode,
  }),
  getters: {
    emptyCells: (state) => state.board.flat().filter((value) => value === null).length,
    filledCells: (state) => state.board.flat().filter((value) => value !== null).length,
  },
  actions: {
    loadRandomExample() {
      autoRunController.cancel()
      this.board = createRandomSolvableBoard()
      this.candidates = createEmptyCandidateGrid()
      this.isAutoSolving = false
      this.logs = []
      this.nextLogId = 1
      this.nextStep = 'checkCandidates'
      this.recentlyPlacedCells = []
      this.solverMode = 'ready'
      this.addLog('Random valid Sudoku example loaded.')
    },
    addLog(message: string, level: SolverLogLevel = 'info') {
      this.logs.push({ id: this.nextLogId, level, message })
      this.nextLogId += 1
    },
    getCandidatesForCell(rowIndex: number, columnIndex: number): SudokuCandidate {
      return getCandidatesForBoard(this.board, rowIndex, columnIndex)
    },
    analyzeCandidates() {
      const candidateGrid: SudokuCandidateGrid = []
      let emptyCells = 0
      let singleCandidates = 0
      let impossibleCells = 0

      this.recentlyPlacedCells = []
      this.addLog('Checking possible values for every empty cell.')

      for (let rowIndex = 0; rowIndex < 9; rowIndex += 1) {
        const candidateRow: SudokuCandidate[] = []

        for (let columnIndex = 0; columnIndex < 9; columnIndex += 1) {
          const cell = this.board[rowIndex][columnIndex]
          const candidates = cell === null ? this.getCandidatesForCell(rowIndex, columnIndex) : []
          candidateRow.push(candidates)

          if (cell === null) {
            emptyCells += 1

            if (candidates.length === 1) singleCandidates += 1
            if (candidates.length === 0) impossibleCells += 1

            const options = candidates.length > 0 ? candidates.join(', ') : 'no possible value'
            this.addLog(`R${rowIndex + 1} C${columnIndex + 1}: ${options}`, candidates.length === 0 ? 'warning' : 'info')
          }
        }

        candidateGrid.push(candidateRow)
      }

      this.candidates = candidateGrid
      this.addLog(
        `Analysis complete: ${emptyCells} empty cells, ${singleCandidates} single-candidate cells.`,
        singleCandidates > 0 ? 'success' : 'info',
      )

      if (impossibleCells > 0) {
        this.addLog(`${impossibleCells} cells have no possible value. Review the input.`, 'warning')
      }

      return { emptyCells, impossibleCells, singleCandidates }
    },
    startSolver() {
      if (this.solverMode !== 'ready') return

      this.logs = []
      this.nextLogId = 1
      this.solverMode = 'solving'
      this.addLog(`Solver mode started: ${this.filledCells} digits are given.`, 'success')

      const summary = this.analyzeCandidates()

      if (summary.emptyCells === 0) {
        this.solverMode = 'solved'
        this.addLog('The Sudoku is already complete.', 'success')
        return
      }

      this.nextStep = 'fillSingles'
      this.addLog('Next, cells with one possible value will be placed.')
    },
    fillSingleCandidates() {
      let insertedCells = 0

      this.recentlyPlacedCells = []
      this.addLog('Placing all cells that have exactly one possible value.')

      for (let rowIndex = 0; rowIndex < 9; rowIndex += 1) {
        for (let columnIndex = 0; columnIndex < 9; columnIndex += 1) {
          const candidates = this.candidates[rowIndex][columnIndex]

          if (this.board[rowIndex][columnIndex] === null && candidates.length === 1) {
            const value = candidates[0]
            this.board[rowIndex][columnIndex] = value
            this.recentlyPlacedCells.push(getGridCellKey(rowIndex, columnIndex))
            insertedCells += 1
            this.addLog(`R${rowIndex + 1} C${columnIndex + 1} = ${value} placed.`, 'success')
          }
        }
      }

      if (this.emptyCells === 0) {
        this.solverMode = 'solved'
        this.addLog('The Sudoku is solved.', 'success')
        return
      }

      if (insertedCells === 0) {
        this.solverMode = 'stuck'
        this.addLog('No single-candidate cell was found. This solver needs a more advanced strategy.', 'warning')
        return
      }

      this.nextStep = 'checkCandidates'
      this.addLog(`${insertedCells} values placed. Candidates will be checked again next.`, 'success')
    },
    advanceSolver() {
      if (this.solverMode === 'ready') {
        this.startSolver()
        return
      }

      if (this.solverMode !== 'solving') return

      if (this.nextStep === 'checkCandidates') {
        const summary = this.analyzeCandidates()

        if (summary.emptyCells === 0) {
          this.solverMode = 'solved'
          this.addLog('The Sudoku is solved.', 'success')
          return
        }

        this.nextStep = 'fillSingles'
        this.addLog('Candidates updated. Single-candidate cells will be placed next.')
        return
      }

      this.fillSingleCandidates()
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
