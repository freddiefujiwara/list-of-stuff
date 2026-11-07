import { describe, expect, it } from 'vitest'
import {
  buildShareUrl,
  formatShareExpiry,
  formatShareRemaining,
  parseShareToken,
  shareSecondsLeft,
} from '../../src/share.js'

describe('share helpers', () => {
  it('parses the token out of a location hash', () => {
    expect(parseShareToken('#share=abc123')).toBe('abc123')
    expect(parseShareToken('#x=1&share=t%20k')).toBe('t k')
    expect(parseShareToken('#other=1')).toBe('')
    expect(parseShareToken('share=plain')).toBe('plain')
    expect(parseShareToken('')).toBe('')
    expect(parseShareToken(null)).toBe('')
  })

  it('builds a share URL on the app base', () => {
    expect(buildShareUrl('https://example.com/app/', 'a b')).toBe(
      'https://example.com/app/#share=a%20b',
    )
  })

  it('computes whole seconds left and handles bad dates', () => {
    const now = Date.parse('2026-11-07T00:00:00Z')
    expect(shareSecondsLeft('2026-11-07T00:01:30Z', now)).toBe(90)
    expect(shareSecondsLeft('2026-11-06T00:00:00Z', now)).toBe(0)
    expect(shareSecondsLeft('not-a-date', now)).toBeNull()
  })

  it('formats the expiry label and remaining time', () => {
    expect(formatShareExpiry('2026-12-02T07:53:00+09:00')).toMatch(/^20261202 \d{2}:\d{2}$/)
    expect(formatShareExpiry('invalid')).toBe('')
    expect(formatShareRemaining(null)).toBe('')
    expect(formatShareRemaining(0)).toBe('期限切れ')
    expect(formatShareRemaining(30)).toBe('残り約1分未満')
    expect(formatShareRemaining(600)).toBe('残り約10分')
    expect(formatShareRemaining(7200)).toBe('残り約2時間')
    expect(formatShareRemaining(86400 * 30)).toBe('残り約30日')
  })
})
