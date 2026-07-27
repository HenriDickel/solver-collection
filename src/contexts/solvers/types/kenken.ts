export type KenKenOperator = '+' | '-' | '*' | '='

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

export type KenKenBoard = KenKenCell[][]
export type KenKenGrid = Array<Array<number | null>>
export type KenKenSolution = number[][]
