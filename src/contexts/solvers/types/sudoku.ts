export type SudokuCellValue = number | null
export type SudokuGrid = SudokuCellValue[][]
export type SudokuCandidate = number[]
export type SudokuCandidateGrid = SudokuCandidate[][]
export type SolverStep = 'checkCandidates' | 'fillSingles'
