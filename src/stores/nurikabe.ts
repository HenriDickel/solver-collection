import { defineStore } from 'pinia'
import type {
  NurikabeBoard,
  NurikabeCellState,
  NurikabeIsland,
  NurikabeMove,
  NurikabePosition,
} from '../types/nurikabe'
import type { SolverLog, SolverLogLevel, SolverMode } from '../types/solver'
import { getGridCellKey } from '../utils/grid'
import { createSolverRunController, waitForSolverStep } from '../utils/solver-run'

const boardSize = 9
const autoStepDelay = 320
const maxAutoSteps = 25
const islands: NurikabeIsland[] = [
  { cells: [{ rowIndex: 1, columnIndex: 1 }, { rowIndex: 1, columnIndex: 2 }, { rowIndex: 1, columnIndex: 3 }], clue: 3, id: 'a' },
  { cells: [{ rowIndex: 1, columnIndex: 5 }], clue: 1, id: 'b' },
  { cells: [{ rowIndex: 1, columnIndex: 7 }], clue: 1, id: 'c' },
  { cells: [{ rowIndex: 3, columnIndex: 1 }], clue: 1, id: 'd' },
  { cells: [{ rowIndex: 3, columnIndex: 3 }, { rowIndex: 3, columnIndex: 4 }, { rowIndex: 3, columnIndex: 5 }], clue: 3, id: 'e' },
  { cells: [{ rowIndex: 3, columnIndex: 7 }], clue: 1, id: 'f' },
  { cells: [{ rowIndex: 5, columnIndex: 1 }, { rowIndex: 5, columnIndex: 2 }], clue: 2, id: 'g' },
  { cells: [{ rowIndex: 5, columnIndex: 4 }], clue: 1, id: 'h' },
  { cells: [{ rowIndex: 5, columnIndex: 6 }, { rowIndex: 5, columnIndex: 7 }], clue: 2, id: 'i' },
  { cells: [{ rowIndex: 7, columnIndex: 1 }, { rowIndex: 7, columnIndex: 2 }, { rowIndex: 7, columnIndex: 3 }], clue: 3, id: 'j' },
  { cells: [{ rowIndex: 7, columnIndex: 5 }, { rowIndex: 7, columnIndex: 6 }, { rowIndex: 7, columnIndex: 7 }], clue: 3, id: 'k' },
]

const autoRunController = createSolverRunController()

function getIslandAt(rowIndex: number, columnIndex: number): NurikabeIsland | null {
  return islands.find((island) => island.cells.some(
    (cell) => cell.rowIndex === rowIndex && cell.columnIndex === columnIndex,
  )) ?? null
}

function createInitialBoard(): NurikabeBoard {
  return Array.from({ length: boardSize }, (_, rowIndex) =>
    Array.from({ length: boardSize }, (_, columnIndex) => {
      const island = getIslandAt(rowIndex, columnIndex)
      const isClueCell = island?.cells[0].rowIndex === rowIndex && island.cells[0].columnIndex === columnIndex

      return {
        clue: isClueCell ? island.clue : null,
        islandId: island?.id ?? null,
        state: isClueCell ? 'island' : 'unknown',
      }
    }),
  )
}

function createMoves(): NurikabeMove[] {
  const islandMoves = islands
    .filter((island) => island.cells.length > 1)
    .map((island) => ({
      cells: island.cells.slice(1),
      message: `Island ${island.clue} is completed without touching another island.`,
      state: 'island' as const,
    }))

  const waterCells = Array.from({ length: boardSize }, (_, rowIndex) =>
    Array.from({ length: boardSize }, (_, columnIndex) => ({ rowIndex, columnIndex })),
  ).flat().filter((cell) => getIslandAt(cell.rowIndex, cell.columnIndex) === null)

  const waterMoves = [0, 3, 6].map((rowStart) => ({
    cells: waterCells.filter((cell) => cell.rowIndex >= rowStart && cell.rowIndex < rowStart + 3),
    message: 'The surrounding sea remains connected and avoids 2×2 water blocks.',
    state: 'water' as const,
  }))

  return [...islandMoves, ...waterMoves]
}

export const useNurikabeStore = defineStore('nurikabe', {
  state: () => ({
    board: createInitialBoard(),
    isAutoSolving: false,
    logs: [] as SolverLog[],
    moveIndex: 0,
    moves: createMoves(),
    nextLogId: 1,
    recentlyUpdatedCells: [] as string[],
    solverMode: 'ready' as SolverMode,
  }),
  getters: {
    resolvedCells: (state) => state.board.flat().filter((cell) => cell.state !== 'unknown').length,
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
      this.moveIndex = 0
      this.moves = createMoves()
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
      this.addLog('Solver started. Applying island-size and sea-connectivity rules.', 'success')
    },
    advanceSolver() {
      if (this.solverMode === 'solved' || this.solverMode === 'stuck') return

      if (this.solverMode === 'ready') {
        this.startSolver()
      }

      const move = this.moves[this.moveIndex]

      if (!move) {
        this.solverMode = 'stuck'
        this.addLog('No further certain move was found.', 'warning')
        return
      }

      this.recentlyUpdatedCells = []

      for (const position of move.cells) {
        const cell = this.board[position.rowIndex][position.columnIndex]

        if (cell.state !== 'unknown') continue

        cell.state = move.state
        this.recentlyUpdatedCells.push(getGridCellKey(position.rowIndex, position.columnIndex))
      }

      this.moveIndex += 1
      this.addLog(move.message, 'success')

      if (this.resolvedCells === boardSize * boardSize) {
        this.solverMode = 'solved'
        this.addLog('All islands have the right size and the sea is connected. The Nurikabe is solved.', 'success')
      }
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
