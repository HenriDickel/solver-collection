import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './assets/main.css'
import App from './App.vue'
import router from './router'
import { initializeTheme } from './utils/theme'

initializeTheme()
createApp(App).use(createPinia()).use(router).mount('#app')
