export type FutoshikiRelation = '<' | '>'

export interface FutoshikiPosition {
  columnIndex: number
  rowIndex: number
}

export interface FutoshikiInequality {
  first: FutoshikiPosition
  relation: FutoshikiRelation
  second: FutoshikiPosition
}

export type FutoshikiGrid = Array<Array<number | null>>
export type FutoshikiSolution = number[][]
