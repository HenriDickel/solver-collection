export type KenKenOperator = '+' | '-' | '*' | '/' | '='
export type KenKenSolverMode = 'ready' | 'solving' | 'solved' | 'stuck'
export type KenKenLogLevel = 'info' | 'success' | 'warning'

export interface KenKenPosition {
  columnIndex: number
  rowIndex: number
}

export interface KenKenCage {
  cells: KenKenPosition[]
  id: string
  operator: KenKenOperator
  target: number
}

export interface KenKenCell {
  cageId: string
  label: string | null
  value: number | null
}

export interface KenKenLog {
  id: number
  level: KenKenLogLevel
  message: string
}

export type KenKenBoard = KenKenCell[][]
export type KenKenGrid = Array<Array<number | null>>
export type KenKenSolution = number[][]
