export type NurikabeCellState = 'unknown' | 'island' | 'water'
export type NurikabeSolverMode = 'ready' | 'solving' | 'solved' | 'stuck'
export type NurikabeLogLevel = 'info' | 'success' | 'warning'

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

export interface NurikabeLog {
  id: number
  level: NurikabeLogLevel
  message: string
}

export interface NurikabeMove {
  cells: NurikabePosition[]
  message: string
  state: Exclude<NurikabeCellState, 'unknown'>
}

export type NurikabeBoard = NurikabeCell[][]
