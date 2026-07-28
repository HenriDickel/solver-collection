export type PlaySection = 'singleplayer' | 'multiplayer'

export type SingleplayerGameSlug = 'sudoku' | 'minesweeper' | 'chess' | 'nonogram'

export type MultiplayerGameSlug =
  | 'imposter'
  | 'charades'
  | 'never-have-i-ever'
  | 'kiss-marry-kill'
  | 'who-am-i'
  | 'would-you-rather'

export type PlayGameSlug = SingleplayerGameSlug | MultiplayerGameSlug

interface PlayGameBase {
  description: string
  path: string
  players: string
  title: string
}

export interface SingleplayerGame extends PlayGameBase {
  section: 'singleplayer'
  slug: SingleplayerGameSlug
}

export interface MultiplayerGame extends PlayGameBase {
  section: 'multiplayer'
  slug: MultiplayerGameSlug
}

export type PlayGame = SingleplayerGame | MultiplayerGame
