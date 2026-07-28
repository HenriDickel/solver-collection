import { defineStore } from 'pinia'
import type {
  KenKenBoard,
  KenKenCage,
  KenKenCell,
  KenKenGrid,
  KenKenOperator,
  KenKenPosition,
  KenKenSolution,
} from '../types/kenken'
import type { SolverLog, SolverLogLevel, SolverMode } from '../types/solver'
import { ExamplePool } from '../utils/example-pool'
import { getGridCellKey } from '../utils/grid'
import { shuffle } from '../utils/random'
import { createSolverRunController, waitForSolverStep } from '../utils/solver-run'

const boardSize = 4
const autoStepDelay = 220
const maxAutoSteps = 30
const baseSolution: KenKenSolution = [
  [1, 2, 3, 4],
  [2, 3, 4, 1],
  [3, 4, 1, 2],
  [4, 1, 2, 3],
]
const cageTemplates: Array<Omit<KenKenCage, 'target'>> = [
  { cells: [{ rowIndex: 0, columnIndex: 0 }, { rowIndex: 0, columnIndex: 1 }], id: 'a', operator: '+' },
  { cells: [{ rowIndex: 0, columnIndex: 2 }, { rowIndex: 0, columnIndex: 3 }], id: 'b', operator: '*' },
  { cells: [{ rowIndex: 1, columnIndex: 0 }, { rowIndex: 2, columnIndex: 0 }], id: 'c', operator: '*' },
  { cells: [{ rowIndex: 1, columnIndex: 1 }, { rowIndex: 1, columnIndex: 2 }], id: 'd', operator: '*' },
  { cells: [{ rowIndex: 1, columnIndex: 3 }, { rowIndex: 2, columnIndex: 3 }], id: 'e', operator: '-' },
  { cells: [{ rowIndex: 2, columnIndex: 1 }, { rowIndex: 2, columnIndex: 2 }], id: 'f', operator: '*' },
  { cells: [{ rowIndex: 3, columnIndex: 0 }, { rowIndex: 3, columnIndex: 1 }], id: 'g', operator: '*' },
  { cells: [{ rowIndex: 3, columnIndex: 2 }, { rowIndex: 3, columnIndex: 3 }], id: 'h', operator: '+' },
]

const autoRunController = createSolverRunController()

function getOperatorSymbol(operator: KenKenOperator): string {
  if (operator === '*') return '×'
  return operator
}

function getCageLabel(cage: KenKenCage): string {
  return `${cage.target}${getOperatorSymbol(cage.operator)}`
}

function getCage(rowIndex: number, columnIndex: number, cages: readonly KenKenCage[]): KenKenCage {
  const cage = cages.find((candidate) => candidate.cells.some(
    (cell) => cell.rowIndex === rowIndex && cell.columnIndex === columnIndex,
  ))

  if (!cage) throw new Error(`Missing cage for row ${rowIndex}, column ${columnIndex}.`)

  return cage
}

function createBoard(cages: readonly KenKenCage[]): KenKenBoard {
  return Array.from({ length: boardSize }, (_, rowIndex) =>
    Array.from({ length: boardSize }, (_, columnIndex) => {
      const cage = getCage(rowIndex, columnIndex, cages)
      const isLabelCell = cage.cells[0].rowIndex === rowIndex && cage.cells[0].columnIndex === columnIndex

      return {
        cageId: cage.id,
        label: isLabelCell ? getCageLabel(cage) : null,
        value: null,
      }
    }),
  )
}

function getCageTarget(cage: Omit<KenKenCage, 'target'>, solution: KenKenSolution): number {
  const values = cage.cells.map((cell) => solution[cell.rowIndex][cell.columnIndex])

  if (cage.operator === '+') return values.reduce((total, value) => total + value, 0)
  if (cage.operator === '-') return Math.abs(values[0] - values[1])
  if (cage.operator === '*') return values.reduce((total, value) => total * value, 1)
  return values[0]
}

function createCages(solution: KenKenSolution): KenKenCage[] {
  return cageTemplates.map((cage) => ({
    ...cage,
    cells: cage.cells.map((cell) => ({ ...cell })),
    target: getCageTarget(cage, solution),
  }))
}

function createRandomSolution(): KenKenSolution {
  const rowIndexes = shuffle([0, 1, 2, 3])
  const columnIndexes = shuffle([0, 1, 2, 3])
  const shuffledDigits = shuffle([1, 2, 3, 4])
  const digitMap = new Map([1, 2, 3, 4].map((value, index) => [value, shuffledDigits[index]]))

  return rowIndexes.map((rowIndex) =>
    columnIndexes.map((columnIndex) => digitMap.get(baseSolution[rowIndex][columnIndex]) ?? 1),
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

function isGridValid(grid: KenKenGrid, cages: readonly KenKenCage[]): boolean {
  for (let index = 0; index < boardSize; index += 1) {
    const rowValues = grid[index].filter((value): value is number => value !== null)
    const columnValues = grid.map((row) => row[index]).filter((value): value is number => value !== null)

    if (!hasUniqueValues(rowValues) || !hasUniqueValues(columnValues)) return false
  }

  return cages.every((cage) => canCageReachTarget(cage, grid))
}

function getCandidates(
  grid: KenKenGrid,
  rowIndex: number,
  columnIndex: number,
  cages: readonly KenKenCage[],
): number[] {
  const candidates: number[] = []

  for (let value = 1; value <= boardSize; value += 1) {
    const candidateGrid = cloneGrid(grid)
    candidateGrid[rowIndex][columnIndex] = value

    if (isGridValid(candidateGrid, cages)) candidates.push(value)
  }

  return candidates
}

function isSolution(grid: KenKenGrid): grid is KenKenSolution {
  return grid.flat().every((value): value is number => value !== null)
}

function findSolution(grid: KenKenGrid, cages: readonly KenKenCage[]): KenKenSolution | null {
  let bestPosition: KenKenPosition | null = null
  let bestCandidates: number[] = []

  for (let rowIndex = 0; rowIndex < boardSize; rowIndex += 1) {
    for (let columnIndex = 0; columnIndex < boardSize; columnIndex += 1) {
      if (grid[rowIndex][columnIndex] !== null) continue

      const candidates = getCandidates(grid, rowIndex, columnIndex, cages)

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
    const solution = findSolution(candidateGrid, cages)

    if (solution) return solution
  }

  return null
}

function createRandomSolvableCages(): KenKenCage[] {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const cages = createCages(createRandomSolution())

    if (findSolution(createEmptyGrid(), cages) !== null) return cages
  }

  return createCages(baseSolution)
}

const kenKenExamplePool = new ExamplePool<KenKenCage[]>(createRandomSolvableCages)

export const useKenKenStore = defineStore('kenken', {
  state: () => ({
    board: [] as KenKenBoard,
    cages: [] as KenKenCage[],
    hasExample: false,
    isAutoSolving: false,
    isExampleLoading: false,
    logs: [] as SolverLog[],
    nextLogId: 1,
    recentlyUpdatedCells: [] as string[],
    solution: null as KenKenSolution | null,
    solverMode: 'ready' as SolverMode,
  }),
  getters: {
    resolvedCells: (state) => state.board.flat().filter((cell) => cell.value !== null).length,
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
      kenKenExamplePool.take((cages) => {
        this.cages = cages
        this.board = createBoard(cages)
        this.hasExample = true
        this.isExampleLoading = false
        this.logs = []
        this.nextLogId = 1
        this.recentlyUpdatedCells = []
        this.solution = null
        this.solverMode = 'ready'
        this.addLog('Random valid KenKen example generated.')
      })
    },
    startSolver() {
      if (!this.hasExample || this.solverMode !== 'ready') return

      const grid = this.board.map((row) => row.map((cell) => cell.value))
      const solution = findSolution(grid, this.cages)

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
      if (!this.hasExample || this.solverMode === 'solved' || this.solverMode === 'stuck') return

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
          this.recentlyUpdatedCells.push(getGridCellKey(rowIndex, columnIndex))
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
