import { createRouter, createWebHistory } from 'vue-router'
import MazePage from '../pages/MazePage.vue'
import MinesweeperPage from '../pages/MinesweeperPage.vue'
import MainPage from '../pages/MainPage.vue'
import NonogramPage from '../pages/NonogramPage.vue'
import KenKenPage from '../pages/KenKenPage.vue'
import FutoshikiPage from '../pages/FutoshikiPage.vue'
import NurikabePage from '../pages/NurikabePage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/sudoku' },
    { component: MainPage, path: '/sudoku' },
    { component: MinesweeperPage, path: '/minesweeper' },
    { component: MazePage, path: '/maze' },
    { component: NonogramPage, path: '/nonogram' },
    { component: KenKenPage, path: '/kenken' },
    { component: FutoshikiPage, path: '/futoshiki' },
    { component: NurikabePage, path: '/nurikabe' },
  ],
})

export default router
