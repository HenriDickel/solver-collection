# Solver Collection

A Vue, Pinia, and Tailwind CSS collection of visual solvers, singleplayer games, and local multiplayer party games.

## Collections

- **Solvers**: Sudoku, Minesweeper, Maze, Nonogram, KenKen, Futoshiki, and Nurikabe.
- **Singleplayer**: Sudoku, Chess, and Nonogram.
- **Multiplayer**: Imposter, Charades, Never Have I Ever, Kiss Marry Kill, Who Am I?, and Would You Rather.

## Architecture

The code is organized by bounded context so the owning category is obvious from its path:

```text
src/
  contexts/
    solvers/       # solver data, pages, components, stores, types, and utilities
    singleplayer/  # solo game data, pages, and components
    multiplayer/   # local party game data, pages, and components
    shared/        # cross-context types and theme utilities
  pages/           # app-level composition pages such as home, collection, and legal pages
  router/          # route composition across contexts
  assets/          # global styling
```

Contexts can depend on `contexts/shared`, while app-level pages and the router compose the contexts together.

## Getting started

```bash
pnpm install
pnpm dev
```

## Quality checks

```bash
pnpm typecheck
pnpm build
```
