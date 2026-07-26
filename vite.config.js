import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  // GitHub Pages serves project sites below the repository name.
  base: process.env.BASE_PATH ?? '/',
  plugins: [vue(), tailwindcss()],
})
