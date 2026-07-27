export type NonogramAxis = 'row' | 'column'
export type NonogramCellState = 'unknown' | 'filled' | 'empty'
export type NonogramResolvedCellState = Exclude<NonogramCellState, 'unknown'>
export type NonogramSolverMode = 'ready' | 'solving' | 'solved' | 'stuck'
export type NonogramLogLevel = 'info' | 'success' | 'warning'

export interface NonogramCell {
  state: NonogramCellState
}

export interface NonogramLog {
  id: number
  level: NonogramLogLevel
  message: string
}

export type NonogramBoard = NonogramCell[][]
