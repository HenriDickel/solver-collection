import { createRouter, createWebHistory } from 'vue-router'
import MinesweeperPage from '../pages/MinesweeperPage.vue'
import MainPage from '../pages/MainPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/sudoku' },
    { component: MainPage, path: '/sudoku' },
    { component: MinesweeperPage, path: '/minesweeper' },
  ],
})

export default router
