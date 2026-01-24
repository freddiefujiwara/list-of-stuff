import { describe, it, expect } from 'vitest'
import { API_URL, FALLBACK_IMAGE_URL } from '../../src/constants/app'

describe('app constants', () => {
  it('exposes the default API URL when env is not set', () => {
    expect(API_URL).toBe('<API>')
  })

  it('exposes the fallback image URL', () => {
    expect(FALLBACK_IMAGE_URL).toBe('https://tshop.r10s.jp/rukusu/cabinet/images/junbi.jpg')
  })
})
