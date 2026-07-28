import type { SingleplayerGame, SingleplayerGameSlug } from '../../shared/types/play-game'

export const singleplayerGames: SingleplayerGame[] = [
  {
    description: 'Fill the grid at your own pace and use the number pad to finish a classic puzzle.',
    path: '/play/sudoku',
    players: '1 player',
    section: 'singleplayer',
    slug: 'sudoku',
    title: 'Sudoku',
  },
  {
    description: 'Clear a minefield at your own pace, with a first move that is always safe.',
    path: '/play/minesweeper',
    players: '1 player',
    section: 'singleplayer',
    slug: 'minesweeper',
    title: 'Minesweeper',
  },
  {
    description: 'Play "Kill the King" chess.',
    path: '/play/chess',
    players: '1 player',
    section: 'singleplayer',
    slug: 'chess',
    title: 'Chess',
  },
  {
    description: 'Turn row and column clues into a tiny pixel picture, one deliberate mark at a time.',
    path: '/play/nonogram',
    players: '1 player',
    section: 'singleplayer',
    slug: 'nonogram',
    title: 'Nonogram',
  },
]

export function getSingleplayerGameBySlug(slug: SingleplayerGameSlug): SingleplayerGame {
  const game = singleplayerGames.find((candidate) => candidate.slug === slug)

  if (!game) throw new Error(`Unknown singleplayer game slug: ${slug}`)

  return game
}
