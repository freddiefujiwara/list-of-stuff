import './style.css'
import { createApp } from 'vue'
import App from './App.vue'
import { isStagingBuild, showStagingBanner } from './staging-banner.js'

createApp(App).mount('#app')
if (isStagingBuild()) {
  showStagingBanner()
}
