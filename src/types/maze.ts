export type MazeCellKind = 'wall' | 'path' | 'start' | 'goal'
export type MazeCellState = 'unvisited' | 'frontier' | 'visited' | 'route'
export type MazeSolverMode = 'ready' | 'solving' | 'solved' | 'stuck'
export type MazeLogLevel = 'info' | 'success' | 'warning'

export interface MazeCell {
  kind: MazeCellKind
  state: MazeCellState
}

export interface MazeLog {
  id: number
  level: MazeLogLevel
  message: string
}

export interface MazePosition {
  columnIndex: number
  distance: number
  rowIndex: number
}

export type MazeBoard = MazeCell[][]
