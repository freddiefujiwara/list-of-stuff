import { createApp } from 'vue'
import App from './App.vue'
import { isStagingBuild, showStagingBanner } from './staging-banner.js'
import { initWebVitals } from './web-vitals.js'

createApp(App)
  .mount('#app')
if (isStagingBuild()) {
  showStagingBanner()
}
initWebVitals()
