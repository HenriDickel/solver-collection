import type { GameSlug, SolverGame } from '../types/game'

export const games: SolverGame[] = [
  {
    category: 'Math Logic',
    description: 'Track candidates and place certain digits one step at a time.',
    path: '/sudoku',
    slug: 'sudoku',
    title: 'Sudoku',
  },
  {
    category: 'Game Logic',
    description: 'Flag mines and reveal safe cells from the clues on the board.',
    path: '/minesweeper',
    slug: 'minesweeper',
    title: 'Minesweeper',
  },
  {
    category: 'Math Logic',
    description: 'Watch breadth-first search discover the shortest route to the exit.',
    path: '/maze',
    slug: 'maze',
    title: 'Maze',
  },
  {
    category: 'Game Logic',
    description: 'Use row and column clues to reveal a hidden pixel picture.',
    path: '/nonogram',
    slug: 'nonogram',
    title: 'Nonogram',
  },
  {
    category: 'Game Logic',
    description: 'Balance rows, columns, and arithmetic cages in one compact grid.',
    path: '/kenken',
    slug: 'kenken',
    title: 'KenKen',
  },
  {
    category: 'Game Logic',
    description: 'Resolve a Latin square while respecting every comparison sign.',
    path: '/futoshiki',
    slug: 'futoshiki',
    title: 'Futoshiki',
  },
  {
    category: 'Game Logic',
    description: 'Grow numbered islands while keeping one continuous sea.',
    path: '/nurikabe',
    slug: 'nurikabe',
    title: 'Nurikabe',
  },
]

export function getGameBySlug(slug: GameSlug): SolverGame {
  const game = games.find((candidate) => candidate.slug === slug)

  if (!game) throw new Error(`Unknown game slug: ${slug}`)

  return game
}
