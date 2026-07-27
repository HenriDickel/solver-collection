import type { MultiplayerGame, MultiplayerGameSlug } from '../../shared/types/play-game'

export const multiplayerGames: MultiplayerGame[] = [
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

export function getMultiplayerGameBySlug(slug: MultiplayerGameSlug): MultiplayerGame {
  const game = multiplayerGames.find((candidate) => candidate.slug === slug)

  if (!game) throw new Error(`Unknown multiplayer game slug: ${slug}`)

  return game
}
