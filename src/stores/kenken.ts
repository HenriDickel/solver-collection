import { defineStore } from 'pinia'
import type {
  KenKenBoard,
  KenKenCage,
  KenKenCell,
  KenKenGrid,
  KenKenLog,
  KenKenLogLevel,
  KenKenOperator,
  KenKenPosition,
  KenKenSolution,
  KenKenSolverMode,
} from '../types/kenken'

const boardSize = 4
const autoStepDelay = 220
const maxAutoSteps = 30
const cages: KenKenCage[] = [
  { cells: [{ rowIndex: 0, columnIndex: 0 }, { rowIndex: 0, columnIndex: 1 }], id: 'a', operator: '+', target: 3 },
  { cells: [{ rowIndex: 0, columnIndex: 2 }, { rowIndex: 0, columnIndex: 3 }], id: 'b', operator: '*', target: 12 },
  { cells: [{ rowIndex: 1, columnIndex: 0 }, { rowIndex: 2, columnIndex: 0 }], id: 'c', operator: '*', target: 6 },
  { cells: [{ rowIndex: 1, columnIndex: 1 }, { rowIndex: 1, columnIndex: 2 }], id: 'd', operator: '*', target: 12 },
  { cells: [{ rowIndex: 1, columnIndex: 3 }, { rowIndex: 2, columnIndex: 3 }], id: 'e', operator: '/', target: 2 },
  { cells: [{ rowIndex: 2, columnIndex: 1 }, { rowIndex: 2, columnIndex: 2 }], id: 'f', operator: '*', target: 4 },
  { cells: [{ rowIndex: 3, columnIndex: 0 }, { rowIndex: 3, columnIndex: 1 }], id: 'g', operator: '*', target: 4 },
  { cells: [{ rowIndex: 3, columnIndex: 2 }, { rowIndex: 3, columnIndex: 3 }], id: 'h', operator: '+', target: 5 },
]

let activeAutoRun = 0

function getCellKey(rowIndex: number, columnIndex: number): string {
  return `${rowIndex}-${columnIndex}`
}

function getOperatorSymbol(operator: KenKenOperator): string {
  if (operator === '*') return '×'
  if (operator === '/') return '÷'
  return operator
}

function getCage(rowIndex: number, columnIndex: number): KenKenCage {
  const cage = cages.find((candidate) => candidate.cells.some(
    (cell) => cell.rowIndex === rowIndex && cell.columnIndex === columnIndex,
  ))

  if (!cage) throw new Error(`Missing cage for row ${rowIndex}, column ${columnIndex}.`)

  return cage
}

function createInitialBoard(): KenKenBoard {
  return Array.from({ length: boardSize }, (_, rowIndex) =>
    Array.from({ length: boardSize }, (_, columnIndex) => {
      const cage = getCage(rowIndex, columnIndex)
      const isLabelCell = cage.cells[0].rowIndex === rowIndex && cage.cells[0].columnIndex === columnIndex

      return {
        cageId: cage.id,
        label: isLabelCell ? `${cage.target}${getOperatorSymbol(cage.operator)}` : null,
        value: null,
      }
    }),
  )
}

function createEmptyGrid(): KenKenGrid {
  return Array.from({ length: boardSize }, () => Array.from({ length: boardSize }, () => null))
}

function cloneGrid(grid: KenKenGrid): KenKenGrid {
  return grid.map((row) => [...row])
}

function isCageComplete(cage: KenKenCage, values: readonly number[]): boolean {
  if (cage.operator === '+') return values.reduce((total, value) => total + value, 0) === cage.target
  if (cage.operator === '-') return Math.abs(values[0] - values[1]) === cage.target
  if (cage.operator === '*') return values.reduce((total, value) => total * value, 1) === cage.target
  if (cage.operator === '/') return Math.max(...values) / Math.min(...values) === cage.target
  return values[0] === cage.target
}

function canCageReachTarget(cage: KenKenCage, grid: KenKenGrid): boolean {
  const values = cage.cells.map((cell) => grid[cell.rowIndex][cell.columnIndex])
  const emptyValueIndexes = values.reduce<number[]>((indexes, value, index) => {
    if (value === null) indexes.push(index)
    return indexes
  }, [])

  function fillMissingValues(index: number): boolean {
    if (index === emptyValueIndexes.length) {
      return isCageComplete(cage, values as number[])
    }

    for (let value = 1; value <= boardSize; value += 1) {
      values[emptyValueIndexes[index]] = value

      if (fillMissingValues(index + 1)) return true
    }

    values[emptyValueIndexes[index]] = null
    return false
  }

  return fillMissingValues(0)
}

function hasUniqueValues(values: readonly number[]): boolean {
  return new Set(values).size === values.length
}

function isGridValid(grid: KenKenGrid): boolean {
  for (let index = 0; index < boardSize; index += 1) {
    const rowValues = grid[index].filter((value): value is number => value !== null)
    const columnValues = grid.map((row) => row[index]).filter((value): value is number => value !== null)

    if (!hasUniqueValues(rowValues) || !hasUniqueValues(columnValues)) return false
  }

  return cages.every((cage) => canCageReachTarget(cage, grid))
}

function getCandidates(grid: KenKenGrid, rowIndex: number, columnIndex: number): number[] {
  const candidates: number[] = []

  for (let value = 1; value <= boardSize; value += 1) {
    const candidateGrid = cloneGrid(grid)
    candidateGrid[rowIndex][columnIndex] = value

    if (isGridValid(candidateGrid)) candidates.push(value)
  }

  return candidates
}

function isSolution(grid: KenKenGrid): grid is KenKenSolution {
  return grid.flat().every((value): value is number => value !== null)
}

function findSolution(grid: KenKenGrid): KenKenSolution | null {
  let bestPosition: KenKenPosition | null = null
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

export const useKenKenStore = defineStore('kenken', {
  state: () => ({
    board: createInitialBoard(),
    isAutoSolving: false,
    logs: [] as KenKenLog[],
    nextLogId: 1,
    recentlyUpdatedCells: [] as string[],
    solution: null as KenKenSolution | null,
    solverMode: 'ready' as KenKenSolverMode,
  }),
  getters: {
    resolvedCells: (state) => state.board.flat().filter((cell) => cell.value !== null).length,
  },
  actions: {
    addLog(message: string, level: KenKenLogLevel = 'info') {
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

      const grid = this.board.map((row) => row.map((cell) => cell.value))
      const solution = findSolution(grid)

      if (solution === null) {
        this.solverMode = 'stuck'
        this.addLog('No solution satisfies all cage constraints.', 'warning')
        return
      }

      this.logs = []
      this.nextLogId = 1
      this.solution = solution
      this.solverMode = 'solving'
      this.addLog('Constraint search found a valid grid for all cages.', 'success')
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
          const cell = this.board[rowIndex][columnIndex]

          if (cell.value !== null) continue

          cell.value = this.solution[rowIndex][columnIndex]
          this.recentlyUpdatedCells.push(getCellKey(rowIndex, columnIndex))
          this.addLog(`R${rowIndex + 1} C${columnIndex + 1} = ${cell.value} satisfies its row, column, and cage.`, 'success')

          if (this.resolvedCells === boardSize * boardSize) {
            this.solverMode = 'solved'
            this.addLog('All cages are satisfied. The KenKen is solved.', 'success')
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
      const finalMode = this.solverMode as KenKenSolverMode

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
