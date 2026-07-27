export type MazeCellKind = 'wall' | 'path' | 'start' | 'goal'
export type MazeCellState = 'unvisited' | 'frontier' | 'visited' | 'route'

export interface MazeCell {
  kind: MazeCellKind
  state: MazeCellState
}

export interface MazePosition {
  columnIndex: number
  distance: number
  rowIndex: number
}

export type MazeBoard = MazeCell[][]
