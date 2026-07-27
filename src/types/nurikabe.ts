export type NurikabeCellState = 'unknown' | 'island' | 'water'

export interface NurikabePosition {
  columnIndex: number
  rowIndex: number
}

export interface NurikabeIsland {
  cells: NurikabePosition[]
  clue: number
  id: string
}

export interface NurikabeCell {
  clue: number | null
  islandId: string | null
  state: NurikabeCellState
}

export interface NurikabeMove {
  cells: NurikabePosition[]
  message: string
  state: Exclude<NurikabeCellState, 'unknown'>
}

export type NurikabeBoard = NurikabeCell[][]
