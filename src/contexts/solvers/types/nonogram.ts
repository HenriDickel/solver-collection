export type NonogramAxis = 'row' | 'column'
export type NonogramCellState = 'unknown' | 'filled' | 'empty'
export type NonogramResolvedCellState = Exclude<NonogramCellState, 'unknown'>

export interface NonogramCell {
  state: NonogramCellState
}

export type NonogramBoard = NonogramCell[][]
