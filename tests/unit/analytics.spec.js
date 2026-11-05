import { describe, it, expect, vi, afterEach } from 'vitest'
import { trackPageView, GA_MEASUREMENT_ID } from '../../src/analytics'

describe('analytics (GA4 page-view tracking)', () => {
  afterEach(() => {
    delete window.gtag
    vi.unstubAllEnvs()
  })

  it('uses the freddiefujiwara.com measurement ID', () => {
    expect(GA_MEASUREMENT_ID).toBe('G-W2C6FNCW86')
  })

  it('sends a page_view event with the given path', () => {
    window.gtag = vi.fn()
    trackPageView('/list-of-stuff/living')
    expect(window.gtag).toHaveBeenCalledTimes(1)
    expect(window.gtag).toHaveBeenCalledWith('event', 'page_view', {
      page_path: '/list-of-stuff/living',
      page_title: document.title,
    })
  })

  it('does nothing when gtag is not loaded', () => {
    expect(() => trackPageView('/x')).not.toThrow()
  })

  it('does not send a page_view on staging builds', () => {
    vi.stubEnv('VITE_STAGING', '1')
    window.gtag = vi.fn()
    trackPageView('/list-of-stuff/living')
    expect(window.gtag).not.toHaveBeenCalled()
  })
})

describe('index.html gtag snippet', () => {
  it('loads gtag with the measurement ID and defers page views to the app', async () => {
    const { readFileSync } = await import('node:fs')
    const { fileURLToPath } = await import('node:url')
    const { dirname, join } = await import('node:path')
    const html = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), '../../index.html'),
      'utf8',
    )
    expect(html).toContain('googletagmanager.com/gtag/js?id=G-W2C6FNCW86')
    expect(html).toContain("gtag('config', 'G-W2C6FNCW86', { send_page_view: false })")
  })
})
