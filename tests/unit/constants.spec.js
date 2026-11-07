import { describe, expect, it } from 'vitest'
import { API_URL, GOOGLE_CLIENT_ID, SHEETS, sheetKind } from '../../src/constants/app.js'

describe('constants', () => {
  it('keeps the API placeholder the CI injects', () => {
    expect(API_URL).toBe('<API>')
  })

  it('uses the shared Google client ID', () => {
    expect(GOOGLE_CLIENT_ID).toContain('.apps.googleusercontent.com')
  })

  it('lists the hand-edited sheets, never the ROOM-owned room sheet', () => {
    expect(SHEETS.map((s) => s.key)).toEqual(['workman', 'variety', 'others', 'subscriptions'])
    expect(SHEETS.map((s) => s.key)).not.toContain('room')
  })

  it('gives every sheet a short tab label for the one-row tab bar', () => {
    expect(SHEETS.map((s) => s.tabLabel)).toEqual(['ワークマン', 'ダイソー', 'その他', 'サブスク'])
  })

  it('marks the subscriptions sheet with its own kind', () => {
    expect(sheetKind('subscriptions')).toBe('subscriptions')
    expect(sheetKind('workman')).toBe('items')
    expect(sheetKind('unknown-key')).toBe('items')
  })
})
