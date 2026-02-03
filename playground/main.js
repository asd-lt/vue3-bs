import { createApp } from 'vue'
import App from './App.vue'

// Import Bootstrap CSS and JS for the playground
import 'bootstrap/scss/bootstrap.scss'

// Import our library (aliased in vite.config.js)
import Vue3Bs from 'vue3-bs'

const app = createApp(App)
app.use(Vue3Bs)
app.mount('#app')
