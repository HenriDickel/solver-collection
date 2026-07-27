import { defineStore } from 'pinia'
import type {
  NonogramAxis,
  NonogramBoard,
  NonogramCellState,
  NonogramResolvedCellState,
} from '../types/nonogram'
import type { SolverLog, SolverLogLevel, SolverMode } from '../types/solver'
import { getGridCellKey } from '../utils/grid'
import { createSolverRunController, waitForSolverStep } from '../utils/solver-run'

const autoStepDelay = 350
const maxAutoSteps = 50
const nonogramSolution = [
  '..........',
  '.##....##.',
  '####..####',
  '##########',
  '.########.',
  '..######..',
  '...####...',
  '....##....',
  '..........',
  '..........',
]

const autoRunController = createSolverRunController()

function getClues(line: readonly boolean[]): number[] {
  const clues: number[] = []
  let runLength = 0

  for (const isFilled of line) {
    if (isFilled) {
      runLength += 1
    } else if (runLength > 0) {
      clues.push(runLength)
      runLength = 0
    }
  }

  if (runLength > 0) clues.push(runLength)

  return clues
}

function areCluesEqual(left: readonly number[], right: readonly number[]): boolean {
  return left.length === right.length && left.every((clue, index) => clue === right[index])
}

function getPatternClues(pattern: readonly NonogramResolvedCellState[]): number[] {
  return getClues(pattern.map((cell) => cell === 'filled'))
}

function getPossiblePatterns(
  knownCells: readonly NonogramCellState[],
  clues: readonly number[],
): NonogramResolvedCellState[][] {
  const patterns: NonogramResolvedCellState[][] = []
  const states: NonogramResolvedCellState[] = ['empty', 'filled']

  function buildPattern(index: number, pattern: NonogramResolvedCellState[]): void {
    if (index === knownCells.length) {
      if (areCluesEqual(getPatternClues(pattern), clues)) {
        patterns.push([...pattern])
      }
      return
    }

    for (const state of states) {
      if (knownCells[index] !== 'unknown' && knownCells[index] !== state) continue

      pattern.push(state)
      buildPattern(index + 1, pattern)
      pattern.pop()
    }
  }

  buildPattern(0, [])
  return patterns
}

function createInitialBoard(): NonogramBoard {
  return nonogramSolution.map((row) =>
    Array.from(row, () => ({ state: 'unknown' as NonogramCellState })),
  )
}

const rowClues = nonogramSolution.map((row) => getClues(Array.from(row, (cell) => cell === '#')))
const columnClues = Array.from({ length: nonogramSolution[0].length }, (_, columnIndex) =>
  getClues(nonogramSolution.map((row) => row[columnIndex] === '#')),
)

export const useNonogramStore = defineStore('nonogram', {
  state: () => ({
    board: createInitialBoard(),
    isAutoSolving: false,
    logs: [] as SolverLog[],
    nextLogId: 1,
    recentlyUpdatedCells: [] as string[],
    solverMode: 'ready' as SolverMode,
  }),
  getters: {
    cellCount: (state) => state.board.length * state.board[0].length,
    knownCells: (state) => state.board.flat().filter((cell) => cell.state !== 'unknown').length,
    rowClues: () => rowClues,
    columnClues: () => columnClues,
  },
  actions: {
    addLog(message: string, level: SolverLogLevel = 'info') {
      this.logs.push({ id: this.nextLogId, level, message })
      this.nextLogId += 1
    },
    getLine(axis: NonogramAxis, index: number): NonogramCellState[] {
      if (axis === 'row') {
        return this.board[index].map((cell) => cell.state)
      }

      return this.board.map((row) => row[index].state)
    },
    resetBoard() {
      autoRunController.cancel()
      this.board = createInitialBoard()
      this.isAutoSolving = false
      this.logs = []
      this.nextLogId = 1
      this.recentlyUpdatedCells = []
      this.solverMode = 'ready'
      this.addLog('Puzzle reset. The solver is ready.')
    },
    startSolver() {
      if (this.solverMode !== 'ready') return

      this.logs = []
      this.nextLogId = 1
      this.solverMode = 'solving'
      this.addLog('Solver started. Comparing each line with its possible patterns.', 'success')
    },
    advanceSolver() {
      if (this.solverMode === 'solved' || this.solverMode === 'stuck') return

      if (this.solverMode === 'ready') {
        this.startSolver()
      }

      this.recentlyUpdatedCells = []
      this.addLog('Checking all row and column clues.')

      const deductions = new Map<string, NonogramResolvedCellState>()

      for (const axis of ['row', 'column'] as const) {
        const cluesForAxis = axis === 'row' ? rowClues : columnClues

        for (let lineIndex = 0; lineIndex < cluesForAxis.length; lineIndex += 1) {
          const line = this.getLine(axis, lineIndex)
          const patterns = getPossiblePatterns(line, cluesForAxis[lineIndex])

          if (patterns.length === 0) {
            this.solverMode = 'stuck'
            this.addLog(`The ${axis} ${lineIndex + 1} conflicts with its clues.`, 'warning')
            return
          }

          for (let cellIndex = 0; cellIndex < line.length; cellIndex += 1) {
            const certainState = patterns[0][cellIndex]
            const isCertain = patterns.every((pattern) => pattern[cellIndex] === certainState)

            if (!isCertain || line[cellIndex] !== 'unknown') continue

            const rowIndex = axis === 'row' ? lineIndex : cellIndex
            const columnIndex = axis === 'row' ? cellIndex : lineIndex
            const cellKey = getGridCellKey(rowIndex, columnIndex)
            const previousState = deductions.get(cellKey)

            if (previousState === undefined || previousState === certainState) {
              deductions.set(cellKey, certainState)
            }
          }
        }
      }

      let filledCells = 0
      let emptyCells = 0

      for (const [cellKey, state] of deductions) {
        const [rowIndex, columnIndex] = cellKey.split('-').map(Number)
        const cell = this.board[rowIndex][columnIndex]

        if (cell.state !== 'unknown') continue

        cell.state = state
        this.recentlyUpdatedCells.push(cellKey)

        if (state === 'filled') {
          filledCells += 1
        } else {
          emptyCells += 1
        }
      }

      const updatedCells = filledCells + emptyCells

      if (this.knownCells === this.cellCount) {
        this.solverMode = 'solved'
        this.addLog('All cells are determined. The nonogram is solved.', 'success')
        return
      }

      if (updatedCells === 0) {
        this.solverMode = 'stuck'
        this.addLog('No further certain cells were found. This puzzle needs a more advanced strategy.', 'warning')
        return
      }

      this.addLog(`Applied ${updatedCells} certain cells: ${filledCells} filled and ${emptyCells} empty.`, 'success')
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
