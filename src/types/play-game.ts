export type PlaySection = 'singleplayer' | 'multiplayer'

export type PlayGameSlug =
  | 'sudoku'
  | 'chess'
  | 'nonogram'
  | 'imposter'
  | 'charades'
  | 'never-have-i-ever'
  | 'kiss-marry-kill'
  | 'who-am-i'
  | 'would-you-rather'

export interface PlayGame {
  description: string
  path: string
  players: string
  section: PlaySection
  slug: PlayGameSlug
  symbol: string
  title: string
}
