import type { PlayGame, PlayGameSlug, PlaySection } from '../types/play-game'

export const singleplayerGames: PlayGame[] = [
  {
    description: 'Fill the grid at your own pace and use the number pad to finish a classic puzzle.',
    path: '/play/sudoku',
    players: '1 player',
    section: 'singleplayer',
    slug: 'sudoku',
    symbol: '9×9',
    title: 'Sudoku',
  },
  {
    description: 'Play a quick game of chess against a lightweight computer opponent.',
    path: '/play/chess',
    players: '1 player',
    section: 'singleplayer',
    slug: 'chess',
    symbol: '♞',
    title: 'Chess',
  },
  {
    description: 'Turn row and column clues into a tiny pixel picture, one deliberate mark at a time.',
    path: '/play/nonogram',
    players: '1 player',
    section: 'singleplayer',
    slug: 'nonogram',
    symbol: '▦',
    title: 'Nonogram',
  },
]

export const multiplayerGames: PlayGame[] = [
  {
    description: 'One player has no secret word. Spot the Imposter through the discussion.',
    path: '/party/imposter',
    players: '3–12 players',
    section: 'multiplayer',
    slug: 'imposter',
    symbol: '◉',
    title: 'Imposter',
  },
  {
    description: 'Act it out before the timer runs down and keep score for both teams.',
    path: '/party/charades',
    players: '2+ players',
    section: 'multiplayer',
    slug: 'charades',
    symbol: '✦',
    title: 'Charades',
  },
  {
    description: 'Read a statement, share your stories, and pass to the next conversation starter.',
    path: '/party/never-have-i-ever',
    players: '2+ players',
    section: 'multiplayer',
    slug: 'never-have-i-ever',
    symbol: '…',
    title: 'Never Have I Ever',
  },
  {
    description: 'Choose your Kiss, Marry, and Kill picks from a playful fictional trio.',
    path: '/party/kiss-marry-kill',
    players: '2+ players',
    section: 'multiplayer',
    slug: 'kiss-marry-kill',
    symbol: '♥',
    title: 'Kiss, Marry, Kill',
  },
  {
    description: 'Discover your hidden identity and let the group help you figure it out.',
    path: '/party/who-am-i',
    players: '2–10 players',
    section: 'multiplayer',
    slug: 'who-am-i',
    symbol: '?',
    title: 'Who Am I?',
  },
  {
    description: 'Pick an option, reveal the group result, and see where everyone lands.',
    path: '/party/would-you-rather',
    players: '2+ players',
    section: 'multiplayer',
    slug: 'would-you-rather',
    symbol: '↔',
    title: 'Would You Rather',
  },
]

export const playGames = [...singleplayerGames, ...multiplayerGames]

export function getPlayGameBySlug(slug: PlayGameSlug): PlayGame {
  const game = playGames.find((candidate) => candidate.slug === slug)

  if (!game) throw new Error(`Unknown playable game slug: ${slug}`)

  return game
}

export function getPlayGamesForSection(section: PlaySection): PlayGame[] {
  return section === 'singleplayer' ? singleplayerGames : multiplayerGames
}
