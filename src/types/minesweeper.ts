export type MinesweeperCellState = 'hidden' | 'revealed' | 'flagged'
export type MinesweeperSolverMode = 'ready' | 'solving' | 'solved' | 'stuck'
export type MinesweeperLogLevel = 'info' | 'success' | 'warning'

export interface MinesweeperCell {
  clue: number | null
  state: MinesweeperCellState
}

export interface MinesweeperLog {
  id: number
  level: MinesweeperLogLevel
  message: string
}

export type MinesweeperBoard = MinesweeperCell[][]
