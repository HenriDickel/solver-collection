import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import LegalPage from '../pages/LegalPage.vue'
import CollectionPage from '../pages/CollectionPage.vue'
import PlayPage from '../pages/PlayPage.vue'
import SolverPage from '../pages/SolverPage.vue'
import { games } from '../data/games'
import { multiplayerGames, singleplayerGames } from '../data/play-games'

const gameRoutes = games.map((game) => ({
  component: SolverPage,
  path: game.path,
  props: { slug: game.slug },
}))

const playableGameRoutes = [...singleplayerGames, ...multiplayerGames].map((game) => ({
  component: PlayPage,
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
    ...playableGameRoutes,
    { component: LegalPage, path: '/privacy', props: { page: 'privacy' } },
    { component: LegalPage, path: '/legal-notice', props: { page: 'imprint' } },
    { component: LegalPage, path: '/accessibility', props: { page: 'accessibility' } },
  ],
})

export default router
