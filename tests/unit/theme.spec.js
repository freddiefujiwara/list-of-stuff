import { describe, expect, it, vi } from 'vitest'
import { THEME_KEY, applyTheme, nextTheme, resolveTheme } from '../../src/theme.js'

describe('theme', () => {
  it('exposes a per-app storage key', () => {
    expect(THEME_KEY).toBe('list-of-stuff-admin-theme')
  })

  it('resolves only "light" to light, everything else to dark', () => {
    expect(resolveTheme('light')).toBe('light')
    expect(resolveTheme('dark')).toBe('dark')
    expect(resolveTheme(null)).toBe('dark')
  })

  it('toggles between themes', () => {
    expect(nextTheme('light')).toBe('dark')
    expect(nextTheme('dark')).toBe('light')
  })

  it('applies the theme to the root element and button label', () => {
    const root = document.createElement('html')
    const button = document.createElement('button')
    applyTheme(root, button, 'light')
    expect(root.getAttribute('data-theme')).toBe('light')
    expect(button.textContent).toBe('ダーク')
    applyTheme(root, button, 'dark')
    expect(root.hasAttribute('data-theme')).toBe(false)
    expect(button.textContent).toBe('ライト')
  })

})
