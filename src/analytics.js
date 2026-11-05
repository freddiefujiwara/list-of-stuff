// Google Analytics 4 (gtag.js) page-view tracking for the SPA.
// The gtag snippet itself is loaded from index.html with
// send_page_view: false; this module is the single place that
// emits page_view events, driven by genre-path changes.
import { isStagingBuild } from './staging-banner.js';

export const GA_MEASUREMENT_ID = 'G-W2C6FNCW86';

export function trackPageView(pagePath) {
  // Staging traffic must not pollute the production measurement,
  // so staging builds never emit page_view events.
  if (isStagingBuild()) {
    return;
  }
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return;
  }
  window.gtag('event', 'page_view', {
    page_path: pagePath,
    page_title: document.title,
  });
}
