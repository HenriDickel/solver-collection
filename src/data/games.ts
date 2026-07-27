import type { GameSlug, SolverGame } from '../types/game'

export const games: SolverGame[] = [
  {
    category: 'Math Logic',
    description: 'Track candidates and place certain digits one step at a time.',
    path: '/sudoku',
    slug: 'sudoku',
    symbol: 'S',
    title: 'Sudoku',
  },
  {
    category: 'Game Logic',
    description: 'Flag mines and reveal safe cells from the clues on the board.',
    path: '/minesweeper',
    slug: 'minesweeper',
    symbol: 'M',
    title: 'Minesweeper',
  },
  {
    category: 'Math Logic',
    description: 'Watch breadth-first search discover the shortest route to the exit.',
    path: '/maze',
    slug: 'maze',
    symbol: 'BFS',
    title: 'Maze',
  },
  {
    category: 'Game Logic',
    description: 'Use row and column clues to reveal a hidden pixel picture.',
    path: '/nonogram',
    slug: 'nonogram',
    symbol: '▦',
    title: 'Nonogram',
  },
  {
    category: 'Game Logic',
    description: 'Balance rows, columns, and arithmetic cages in one compact grid.',
    path: '/kenken',
    slug: 'kenken',
    symbol: '×÷',
    title: 'KenKen',
  },
  {
    category: 'Game Logic',
    description: 'Resolve a Latin square while respecting every comparison sign.',
    path: '/futoshiki',
    slug: 'futoshiki',
    symbol: '<>',
    title: 'Futoshiki',
  },
  {
    category: 'Game Logic',
    description: 'Grow numbered islands while keeping one continuous sea.',
    path: '/nurikabe',
    slug: 'nurikabe',
    symbol: '◼',
    title: 'Nurikabe',
  },
]

export function getGameBySlug(slug: GameSlug): SolverGame {
  const game = games.find((candidate) => candidate.slug === slug)

  if (!game) throw new Error(`Unknown game slug: ${slug}`)

  return game
}
