export type SudokuCellValue = number | null
export type SudokuGrid = SudokuCellValue[][]
export type SudokuCandidate = number[]
export type SudokuCandidateGrid = SudokuCandidate[][]
export type SolverMode = 'editing' | 'solving' | 'solved' | 'stuck'
export type SolverStep = 'checkCandidates' | 'fillSingles'
export type SolverLogLevel = 'info' | 'success' | 'warning'

export interface SolverLog {
  id: number
  level: SolverLogLevel
  message: string
}
