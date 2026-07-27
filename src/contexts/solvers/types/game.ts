export type GameSlug =
  | 'sudoku'
  | 'minesweeper'
  | 'maze'
  | 'nonogram'
  | 'kenken'
  | 'futoshiki'
  | 'nurikabe'

export interface SolverGame {
  category: string
  description: string
  path: string
  slug: GameSlug
  symbol: string
  title: string
}
