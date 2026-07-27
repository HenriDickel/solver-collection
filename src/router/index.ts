import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import LegalPage from '../pages/LegalPage.vue'
import SolverPage from '../pages/SolverPage.vue'
import { games } from '../data/games'

const gameRoutes = games.map((game) => ({
  component: SolverPage,
  path: game.path,
  props: { slug: game.slug },
}))

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { component: HomePage, path: '/' },
    ...gameRoutes,
    { component: LegalPage, path: '/privacy', props: { page: 'privacy' } },
    { component: LegalPage, path: '/legal-notice', props: { page: 'imprint' } },
    { component: LegalPage, path: '/accessibility', props: { page: 'accessibility' } },
  ],
})

export default router
