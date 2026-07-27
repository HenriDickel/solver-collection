import { defineStore } from 'pinia'
import type {
  MazeBoard,
  MazeCell,
  MazeCellKind,
  MazeLog,
  MazeLogLevel,
  MazePosition,
  MazeSolverMode,
} from '../types/maze'

const autoStepDelay = 140
const maxAutoSteps = 200
const mazeLayout = [
  '###############',
  '#S#.........#.#',
  '#.#####.###.#.#',
  '#.......#...#.#',
  '#########.###.#',
  '#...#.....#...#',
  '#.#.#.#####.#.#',
  '#.#...#...#.#.#',
  '#.#####.#.###.#',
  '#.....#.#...#.#',
  '#####.#.###.#.#',
  '#...#...#.#...#',
  '#.#.#####.###.#',
  '#.#..........E#',
  '###############',
]

let activeAutoRun = 0

function getCellKey(rowIndex: number, columnIndex: number): string {
  return `${rowIndex}-${columnIndex}`
}

function getCellKind(value: string): MazeCellKind {
  if (value === '#') return 'wall'
  if (value === 'S') return 'start'
  if (value === 'E') return 'goal'
  return 'path'
}

function createInitialBoard(): MazeBoard {
  return mazeLayout.map((row) =>
    Array.from(row, (value) => ({
      kind: getCellKind(value),
      state: 'unvisited',
    })),
  )
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

export const useMazeStore = defineStore('maze', {
  state: () => ({
    board: createInitialBoard(),
    isAutoSolving: false,
    logs: [] as MazeLog[],
    nextLogId: 1,
    previousCells: {} as Record<string, string | null>,
    queue: [] as MazePosition[],
    queueCursor: 0,
    recentlyUpdatedCells: [] as string[],
    solverMode: 'ready' as MazeSolverMode,
  }),
  getters: {
    exploredCells: (state) => state.board.flat().filter((cell) => cell.kind !== 'wall' && cell.state !== 'unvisited').length,
    walkableCells: (state) => state.board.flat().filter((cell) => cell.kind !== 'wall').length,
  },
  actions: {
    addLog(message: string, level: MazeLogLevel = 'info') {
      this.logs.push({ id: this.nextLogId, level, message })
      this.nextLogId += 1
    },
    getCell(rowIndex: number, columnIndex: number): MazeCell {
      return this.board[rowIndex][columnIndex]
    },
    getWalkableNeighbors(rowIndex: number, columnIndex: number): Array<[number, number]> {
      const neighbors: Array<[number, number]> = []

      for (const [rowOffset, columnOffset] of [[-1, 0], [0, 1], [1, 0], [0, -1]]) {
        const nextRowIndex = rowIndex + rowOffset
        const nextColumnIndex = columnIndex + columnOffset
        const isWithinBoard = nextRowIndex >= 0
          && nextRowIndex < this.board.length
          && nextColumnIndex >= 0
          && nextColumnIndex < this.board[0].length

        if (isWithinBoard && this.getCell(nextRowIndex, nextColumnIndex).kind !== 'wall') {
          neighbors.push([nextRowIndex, nextColumnIndex])
        }
      }

      return neighbors
    },
    resetBoard() {
      activeAutoRun += 1
      this.board = createInitialBoard()
      this.isAutoSolving = false
      this.logs = []
      this.nextLogId = 1
      this.previousCells = {}
      this.queue = []
      this.queueCursor = 0
      this.recentlyUpdatedCells = []
      this.solverMode = 'ready'
      this.addLog('Maze reset. The solver is ready.')
    },
    startSolver() {
      if (this.solverMode !== 'ready') return

      const startRowIndex = 1
      const startColumnIndex = 1
      const startKey = getCellKey(startRowIndex, startColumnIndex)

      this.logs = []
      this.nextLogId = 1
      this.previousCells = { [startKey]: null }
      this.queue = [{ columnIndex: startColumnIndex, distance: 0, rowIndex: startRowIndex }]
      this.queueCursor = 0
      this.recentlyUpdatedCells = [startKey]
      this.getCell(startRowIndex, startColumnIndex).state = 'frontier'
      this.solverMode = 'solving'
      this.addLog('Solver started. Exploring the maze breadth first.', 'success')
    },
    markSolution(goalKey: string): number {
      let currentKey: string | null = goalKey
      let routeLength = 0

      while (currentKey !== null) {
        const [rowIndex, columnIndex] = currentKey.split('-').map(Number)
        const cell = this.getCell(rowIndex, columnIndex)

        if (cell.kind === 'path') {
          cell.state = 'route'
          this.recentlyUpdatedCells.push(currentKey)
        }

        routeLength += 1
        currentKey = this.previousCells[currentKey] ?? null
      }

      return routeLength
    },
    advanceSolver() {
      if (this.solverMode === 'solved' || this.solverMode === 'stuck') return

      if (this.solverMode === 'ready') {
        this.startSolver()
      }

      const currentPosition = this.queue[this.queueCursor]

      if (!currentPosition) {
        this.solverMode = 'stuck'
        this.addLog('No route to the exit was found.', 'warning')
        return
      }

      const currentDistance = currentPosition.distance
      let exploredInStep = 0
      let discoveredInStep = 0

      this.recentlyUpdatedCells = []

      while (
        this.queueCursor < this.queue.length
        && this.queue[this.queueCursor].distance === currentDistance
      ) {
        const position = this.queue[this.queueCursor]
        const cellKey = getCellKey(position.rowIndex, position.columnIndex)
        const cell = this.getCell(position.rowIndex, position.columnIndex)

        this.queueCursor += 1
        cell.state = 'visited'
        this.recentlyUpdatedCells.push(cellKey)
        exploredInStep += 1

        if (cell.kind === 'goal') {
          const routeLength = this.markSolution(cellKey)
          this.solverMode = 'solved'
          this.addLog(`Exit found after ${routeLength - 1} moves.`, 'success')
          return
        }

        for (const [neighborRowIndex, neighborColumnIndex] of this.getWalkableNeighbors(position.rowIndex, position.columnIndex)) {
          const neighbor = this.getCell(neighborRowIndex, neighborColumnIndex)

          if (neighbor.state !== 'unvisited') continue

          const neighborKey = getCellKey(neighborRowIndex, neighborColumnIndex)
          neighbor.state = 'frontier'
          this.previousCells[neighborKey] = cellKey
          this.queue.push({
            columnIndex: neighborColumnIndex,
            distance: currentDistance + 1,
            rowIndex: neighborRowIndex,
          })
          this.recentlyUpdatedCells.push(neighborKey)
          discoveredInStep += 1
        }
      }

      this.addLog(
        `Distance ${currentDistance}: explored ${exploredInStep} cell${exploredInStep === 1 ? '' : 's'} and found ${discoveredInStep} new.`,
        discoveredInStep > 0 ? 'info' : 'warning',
      )

      if (this.queueCursor === this.queue.length) {
        this.solverMode = 'stuck'
        this.addLog('No route to the exit was found.', 'warning')
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
      const finalMode = this.solverMode as MazeSolverMode

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
