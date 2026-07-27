export type MinesweeperCellState = 'hidden' | 'revealed' | 'flagged'

export interface MinesweeperCell {
  clue: number | null
  state: MinesweeperCellState
}

export type MinesweeperBoard = MinesweeperCell[][]
