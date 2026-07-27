import { defineStore } from 'pinia'
import type {
  NonogramBoard,
  NonogramCellState,
  NonogramResolvedCellState,
} from '../types/nonogram'
import type { SolverLog, SolverLogLevel, SolverMode } from '../types/solver'
import { ExamplePool } from '../utils/example-pool'
import { getGridCellKey } from '../utils/grid'
import { randomInteger } from '../utils/random'
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

function getClueSets(solution: readonly string[]) {
  return {
    columnClues: Array.from({ length: solution[0].length }, (_, columnIndex) =>
      getClues(solution.map((row) => row[columnIndex] === '#')),
    ),
    rowClues: solution.map((row) => getClues(Array.from(row, (cell) => cell === '#'))),
  }
}

function findCertainCells(
  board: readonly NonogramCellState[][],
  rowClues: readonly number[][],
  columnClues: readonly number[][],
): Map<string, NonogramResolvedCellState> | null {
  const deductions = new Map<string, NonogramResolvedCellState>()

  for (const axis of ['row', 'column'] as const) {
    const cluesForAxis = axis === 'row' ? rowClues : columnClues

    for (let lineIndex = 0; lineIndex < cluesForAxis.length; lineIndex += 1) {
      const line = axis === 'row'
        ? board[lineIndex]
        : board.map((row) => row[lineIndex])
      const patterns = getPossiblePatterns(line, cluesForAxis[lineIndex])

      if (patterns.length === 0) return null

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

  return deductions
}

function createBoard(solution: readonly string[]): NonogramBoard {
  return solution.map((row) =>
    Array.from(row, () => ({ state: 'unknown' as NonogramCellState })),
  )
}

function createRandomCandidate(): string[] {
  const size = nonogramSolution.length
  const grid = Array.from({ length: size }, () => Array.from({ length: size }, () => '.'))

  for (let shapeIndex = 0; shapeIndex < 4 + randomInteger(4); shapeIndex += 1) {
    const height = 1 + randomInteger(4)
    const width = 1 + randomInteger(4)
    const rowStart = randomInteger(size - height + 1)
    const columnStart = randomInteger(size - width + 1)

    for (let rowIndex = rowStart; rowIndex < rowStart + height; rowIndex += 1) {
      for (let columnIndex = columnStart; columnIndex < columnStart + width; columnIndex += 1) {
        grid[rowIndex][columnIndex] = '#'
      }
    }
  }

  return grid.map((row) => row.join(''))
}

function isSolvableByDeductions(solution: readonly string[]): boolean {
  const { columnClues, rowClues } = getClueSets(solution)
  const board = Array.from(
    { length: solution.length },
    () => Array.from({ length: solution[0].length }, () => 'unknown' as NonogramCellState),
  )

  for (let step = 0; step < maxAutoSteps; step += 1) {
    const deductions = findCertainCells(board, rowClues, columnClues)

    if (deductions === null || deductions.size === 0) return false

    for (const [cellKey, state] of deductions) {
      const [rowIndex, columnIndex] = cellKey.split('-').map(Number)
      board[rowIndex][columnIndex] = state
    }

    if (board.flat().every((cell) => cell !== 'unknown')) return true
  }

  return false
}

function createRandomSolution(): string[] {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const candidate = createRandomCandidate()

    if (isSolvableByDeductions(candidate)) return candidate
  }

  if (isSolvableByDeductions(nonogramSolution)) return nonogramSolution

  return Array.from({ length: nonogramSolution.length }, () => '.'.repeat(nonogramSolution[0].length))
}

function createPuzzle(solution: readonly string[]) {
  return {
    board: createBoard(solution),
    ...getClueSets(solution),
  }
}

const nonogramExamplePool = new ExamplePool<string[]>(createRandomSolution)

export function preloadNonogramExamples(): void {
  nonogramExamplePool.preload()
}

export const useNonogramStore = defineStore('nonogram', {
  state: () => ({
    board: [] as NonogramBoard,
    columnClues: [] as number[][],
    hasExample: false,
    isAutoSolving: false,
    isExampleLoading: false,
    logs: [] as SolverLog[],
    nextLogId: 1,
    recentlyUpdatedCells: [] as string[],
    rowClues: [] as number[][],
    solverMode: 'ready' as SolverMode,
  }),
  getters: {
    cellCount: (state) => state.board.length === 0 ? 0 : state.board.length * state.board[0].length,
    knownCells: (state) => state.board.flat().filter((cell) => cell.state !== 'unknown').length,
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
      nonogramExamplePool.take((solution) => {
        const puzzle = createPuzzle(solution)
        this.board = puzzle.board
        this.columnClues = puzzle.columnClues
        this.hasExample = true
        this.isExampleLoading = false
        this.logs = []
        this.nextLogId = 1
        this.recentlyUpdatedCells = []
        this.rowClues = puzzle.rowClues
        this.solverMode = 'ready'
        this.addLog('Random Nonogram picture generated.')
      })
    },
    startSolver() {
      if (!this.hasExample || this.solverMode !== 'ready') return

      this.logs = []
      this.nextLogId = 1
      this.solverMode = 'solving'
      this.addLog('Solver started. Comparing each line with its possible patterns.', 'success')
    },
    advanceSolver() {
      if (!this.hasExample || this.solverMode === 'solved' || this.solverMode === 'stuck') return

      if (this.solverMode === 'ready') {
        this.startSolver()
      }

      this.recentlyUpdatedCells = []
      this.addLog('Checking all row and column clues.')

      const boardStates = this.board.map((row) => row.map((cell) => cell.state))
      const deductions = findCertainCells(boardStates, this.rowClues, this.columnClues)

      if (deductions === null) {
        this.solverMode = 'stuck'
        this.addLog('The current board conflicts with its clues.', 'warning')
        return
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
