import { describe, expect, it } from 'vitest'
import { API_URL, GOOGLE_CLIENT_ID, SHEETS } from '../../src/constants/app.js'

describe('constants', () => {
  it('keeps the API placeholder the CI injects', () => {
    expect(API_URL).toBe('<API>')
  })

  it('uses the shared Google client ID', () => {
    expect(GOOGLE_CLIENT_ID).toContain('.apps.googleusercontent.com')
  })

  it('lists only the hand-edited sheets', () => {
    expect(SHEETS.map((s) => s.key)).toEqual(['workman', 'variety', 'others'])
  })
})
