import { createApp } from 'vue'
import App from './App.vue'
import { showStagingBanner } from './staging-banner.js'

createApp(App)
  .mount('#app')
showStagingBanner()
