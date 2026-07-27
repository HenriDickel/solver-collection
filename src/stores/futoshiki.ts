import { defineStore } from 'pinia'
import type {
  FutoshikiGrid,
  FutoshikiInequality,
  FutoshikiLog,
  FutoshikiLogLevel,
  FutoshikiPosition,
  FutoshikiRelation,
  FutoshikiSolution,
  FutoshikiSolverMode,
} from '../types/futoshiki'

const boardSize = 5
const autoStepDelay = 180
const maxAutoSteps = 35
const inequalities: FutoshikiInequality[] = [
  { first: { rowIndex: 0, columnIndex: 0 }, relation: '<', second: { rowIndex: 0, columnIndex: 1 } },
  { first: { rowIndex: 0, columnIndex: 1 }, relation: '<', second: { rowIndex: 0, columnIndex: 2 } },
  { first: { rowIndex: 0, columnIndex: 0 }, relation: '<', second: { rowIndex: 1, columnIndex: 0 } },
  { first: { rowIndex: 0, columnIndex: 2 }, relation: '<', second: { rowIndex: 1, columnIndex: 2 } },
  { first: { rowIndex: 1, columnIndex: 2 }, relation: '<', second: { rowIndex: 1, columnIndex: 3 } },
  { first: { rowIndex: 1, columnIndex: 3 }, relation: '>', second: { rowIndex: 1, columnIndex: 4 } },
  { first: { rowIndex: 2, columnIndex: 2 }, relation: '>', second: { rowIndex: 2, columnIndex: 3 } },
  { first: { rowIndex: 3, columnIndex: 2 }, relation: '<', second: { rowIndex: 3, columnIndex: 3 } },
  { first: { rowIndex: 3, columnIndex: 2 }, relation: '<', second: { rowIndex: 4, columnIndex: 2 } },
  { first: { rowIndex: 3, columnIndex: 3 }, relation: '<', second: { rowIndex: 4, columnIndex: 3 } },
  { first: { rowIndex: 3, columnIndex: 4 }, relation: '<', second: { rowIndex: 4, columnIndex: 4 } },
  { first: { rowIndex: 4, columnIndex: 0 }, relation: '>', second: { rowIndex: 4, columnIndex: 1 } },
  { first: { rowIndex: 4, columnIndex: 3 }, relation: '<', second: { rowIndex: 4, columnIndex: 4 } },
]

let activeAutoRun = 0

function getCellKey(rowIndex: number, columnIndex: number): string {
  return `${rowIndex}-${columnIndex}`
}

function createInitialBoard(): FutoshikiGrid {
  return Array.from({ length: boardSize }, () => Array.from({ length: boardSize }, () => null))
}

function cloneGrid(grid: FutoshikiGrid): FutoshikiGrid {
  return grid.map((row) => [...row])
}

function relationIsSatisfied(first: number, relation: FutoshikiRelation, second: number): boolean {
  return relation === '<' ? first < second : first > second
}

function hasUniqueValues(values: readonly number[]): boolean {
  return new Set(values).size === values.length
}

function isGridValid(grid: FutoshikiGrid): boolean {
  for (let index = 0; index < boardSize; index += 1) {
    const rowValues = grid[index].filter((value): value is number => value !== null)
    const columnValues = grid.map((row) => row[index]).filter((value): value is number => value !== null)

    if (!hasUniqueValues(rowValues) || !hasUniqueValues(columnValues)) return false
  }

  return inequalities.every((inequality) => {
    const first = grid[inequality.first.rowIndex][inequality.first.columnIndex]
    const second = grid[inequality.second.rowIndex][inequality.second.columnIndex]

    return first === null || second === null || relationIsSatisfied(first, inequality.relation, second)
  })
}

function getCandidates(grid: FutoshikiGrid, rowIndex: number, columnIndex: number): number[] {
  const candidates: number[] = []

  for (let value = 1; value <= boardSize; value += 1) {
    const candidateGrid = cloneGrid(grid)
    candidateGrid[rowIndex][columnIndex] = value

    if (isGridValid(candidateGrid)) candidates.push(value)
  }

  return candidates
}

function isSolution(grid: FutoshikiGrid): grid is FutoshikiSolution {
  return grid.flat().every((value): value is number => value !== null)
}

function findSolution(grid: FutoshikiGrid): FutoshikiSolution | null {
  let bestPosition: FutoshikiPosition | null = null
  let bestCandidates: number[] = []

  for (let rowIndex = 0; rowIndex < boardSize; rowIndex += 1) {
    for (let columnIndex = 0; columnIndex < boardSize; columnIndex += 1) {
      if (grid[rowIndex][columnIndex] !== null) continue

      const candidates = getCandidates(grid, rowIndex, columnIndex)

      if (candidates.length === 0) return null

      if (bestPosition === null || candidates.length < bestCandidates.length) {
        bestPosition = { rowIndex, columnIndex }
        bestCandidates = candidates
      }
    }
  }

  if (bestPosition === null) return isSolution(grid) ? grid : null

  for (const value of bestCandidates) {
    const candidateGrid = cloneGrid(grid)
    candidateGrid[bestPosition.rowIndex][bestPosition.columnIndex] = value
    const solution = findSolution(candidateGrid)

    if (solution) return solution
  }

  return null
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

export const useFutoshikiStore = defineStore('futoshiki', {
  state: () => ({
    board: createInitialBoard(),
    inequalities,
    isAutoSolving: false,
    logs: [] as FutoshikiLog[],
    nextLogId: 1,
    recentlyUpdatedCells: [] as string[],
    solution: null as FutoshikiSolution | null,
    solverMode: 'ready' as FutoshikiSolverMode,
  }),
  getters: {
    resolvedCells: (state) => state.board.flat().filter((value) => value !== null).length,
  },
  actions: {
    addLog(message: string, level: FutoshikiLogLevel = 'info') {
      this.logs.push({ id: this.nextLogId, level, message })
      this.nextLogId += 1
    },
    resetBoard() {
      activeAutoRun += 1
      this.board = createInitialBoard()
      this.isAutoSolving = false
      this.logs = []
      this.nextLogId = 1
      this.recentlyUpdatedCells = []
      this.solution = null
      this.solverMode = 'ready'
      this.addLog('Puzzle reset. The solver is ready.')
    },
    startSolver() {
      if (this.solverMode !== 'ready') return

      const solution = findSolution(this.board)

      if (solution === null) {
        this.solverMode = 'stuck'
        this.addLog('No solution satisfies all inequalities.', 'warning')
        return
      }

      this.logs = []
      this.nextLogId = 1
      this.solution = solution
      this.solverMode = 'solving'
      this.addLog('Constraint search found a valid grid for all inequalities.', 'success')
    },
    advanceSolver() {
      if (this.solverMode === 'solved' || this.solverMode === 'stuck') return

      if (this.solverMode === 'ready') {
        this.startSolver()
      }

      if (this.solverMode !== 'solving' || this.solution === null) return

      this.recentlyUpdatedCells = []

      for (let rowIndex = 0; rowIndex < boardSize; rowIndex += 1) {
        for (let columnIndex = 0; columnIndex < boardSize; columnIndex += 1) {
          if (this.board[rowIndex][columnIndex] !== null) continue

          const value = this.solution[rowIndex][columnIndex]
          this.board[rowIndex][columnIndex] = value
          this.recentlyUpdatedCells.push(getCellKey(rowIndex, columnIndex))
          this.addLog(`R${rowIndex + 1} C${columnIndex + 1} = ${value} satisfies its row, column, and inequalities.`, 'success')

          if (this.resolvedCells === boardSize * boardSize) {
            this.solverMode = 'solved'
            this.addLog('All inequalities are satisfied. The Futoshiki is solved.', 'success')
          }

          return
        }
      }
    },
    async autoSolve() {
      if (this.solverMode === 'solved' || this.solverMode === 'stuck' || this.isAutoSolving) return

      const autoRun = activeAutoRun + 1
      activeAutoRun = autoRun
      this.isAutoSolving = true
      this.addLog('Auto solve started.', 'success')

      let completedSteps = 0

      while ((this.solverMode === 'ready' || this.solverMode === 'solving') && completedSteps < maxAutoSteps) {
        await wait(autoStepDelay)

        if (autoRun !== activeAutoRun) return

        this.advanceSolver()
        completedSteps += 1
      }

      if (autoRun !== activeAutoRun) return

      this.isAutoSolving = false
      const finalMode = this.solverMode as FutoshikiSolverMode

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
