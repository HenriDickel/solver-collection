import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import LegalPage from '../pages/LegalPage.vue'
import CollectionPage from '../pages/CollectionPage.vue'
import SolverPage from '../contexts/solvers/pages/SolverPage.vue'
import SingleplayerGamePage from '../contexts/singleplayer/pages/SingleplayerGamePage.vue'
import MultiplayerGamePage from '../contexts/multiplayer/pages/MultiplayerGamePage.vue'
import { games } from '../contexts/solvers/data/games'
import { singleplayerGames } from '../contexts/singleplayer/data/games'
import { multiplayerGames } from '../contexts/multiplayer/data/games'

const gameRoutes = games.map((game) => ({
  component: SolverPage,
  path: game.path,
  props: { slug: game.slug },
}))

const singleplayerGameRoutes = singleplayerGames.map((game) => ({
  component: SingleplayerGamePage,
  path: game.path,
  props: { slug: game.slug },
}))

const multiplayerGameRoutes = multiplayerGames.map((game) => ({
  component: MultiplayerGamePage,
  path: game.path,
  props: { slug: game.slug },
}))

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { component: HomePage, path: '/' },
    { component: CollectionPage, path: '/solvers', props: { section: 'solvers' } },
    { component: CollectionPage, path: '/singleplayer', props: { section: 'singleplayer' } },
    { component: CollectionPage, path: '/multiplayer', props: { section: 'multiplayer' } },
    ...gameRoutes,
    ...singleplayerGameRoutes,
    ...multiplayerGameRoutes,
    { component: LegalPage, path: '/privacy', props: { page: 'privacy' } },
    { component: LegalPage, path: '/legal-notice', props: { page: 'imprint' } },
    { component: LegalPage, path: '/accessibility', props: { page: 'accessibility' } },
  ],
})

export default router
