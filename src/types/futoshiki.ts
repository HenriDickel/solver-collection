export type FutoshikiRelation = '<' | '>'
export type FutoshikiSolverMode = 'ready' | 'solving' | 'solved' | 'stuck'
export type FutoshikiLogLevel = 'info' | 'success' | 'warning'

export interface FutoshikiPosition {
  columnIndex: number
  rowIndex: number
}

export interface FutoshikiInequality {
  first: FutoshikiPosition
  relation: FutoshikiRelation
  second: FutoshikiPosition
}

export interface FutoshikiLog {
  id: number
  level: FutoshikiLogLevel
  message: string
}

export type FutoshikiGrid = Array<Array<number | null>>
export type FutoshikiSolution = number[][]
