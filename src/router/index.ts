import { createRouter, createWebHistory } from 'vue-router'
import MazePage from '../pages/MazePage.vue'
import MinesweeperPage from '../pages/MinesweeperPage.vue'
import MainPage from '../pages/MainPage.vue'
import NonogramPage from '../pages/NonogramPage.vue'
import KenKenPage from '../pages/KenKenPage.vue'
import FutoshikiPage from '../pages/FutoshikiPage.vue'
import NurikabePage from '../pages/NurikabePage.vue'
import HomePage from '../pages/HomePage.vue'
import LegalPage from '../pages/LegalPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { component: HomePage, path: '/' },
    { component: MainPage, path: '/sudoku' },
    { component: MinesweeperPage, path: '/minesweeper' },
    { component: MazePage, path: '/maze' },
    { component: NonogramPage, path: '/nonogram' },
    { component: KenKenPage, path: '/kenken' },
    { component: FutoshikiPage, path: '/futoshiki' },
    { component: NurikabePage, path: '/nurikabe' },
    { component: LegalPage, path: '/datenschutz', props: { page: 'privacy' } },
    { component: LegalPage, path: '/impressum', props: { page: 'imprint' } },
    { component: LegalPage, path: '/barrierefreiheit', props: { page: 'accessibility' } },
  ],
})

export default router
