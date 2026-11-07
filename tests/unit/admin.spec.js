import { describe, expect, it } from 'vitest'
import {
  emptyItem,
  formFromItem,
  formatPrice,
  itemMeta,
  shareLinkView,
  sheetLabel,
} from '../../src/utils/admin.js'

describe('admin utils', () => {
  it('emptyItem starts blank with one unit', () => {
    expect(emptyItem()).toEqual({
      title: '',
      image: '',
      url: '',
      price: '',
      unit: 1,
      genre: '',
      comment: '',
    })
  })

  it('sheetLabel maps keys to display labels', () => {
    expect(sheetLabel('workman')).toBe('ワークマン')
    expect(sheetLabel('variety')).toBe('ダイソー・100均')
    expect(sheetLabel('others')).toBe('その他')
    expect(sheetLabel('room')).toBe('room')
  })

  it('formatPrice formats numbers and hides blanks', () => {
    expect(formatPrice(2029)).toBe('¥2,029')
    expect(formatPrice('¥4,380')).toBe('¥4,380')
    expect(formatPrice('')).toBe('')
    expect(formatPrice(null)).toBe('')
    expect(formatPrice('abc')).toBe('')
    expect(formatPrice('-')).toBe('')
  })

  it('itemMeta joins price, unit, genre and comment', () => {
    expect(itemMeta({ price: 1500, unit: 2, genre: 'G', comment: 'c' })).toBe('¥1,500 ×2 / G / c')
    expect(itemMeta({ price: 1500, unit: 1, genre: '', comment: '' })).toBe('¥1,500')
    expect(itemMeta({ price: '', unit: '', genre: 'G', comment: '' })).toBe('G')
    expect(itemMeta({ price: '', unit: '', genre: '', comment: '' })).toBe('')
  })

  it('formFromItem of an empty object is all blanks', () => {
    expect(formFromItem({})).toEqual({
      title: '',
      image: '',
      url: '',
      price: '',
      unit: '',
      genre: '',
      comment: '',
    })
  })

  it('shareLinkView is blank before issue and filled after', () => {
    const now = Date.parse('2026-11-07T00:00:00Z')
    expect(shareLinkView(null, 'https://example.com/app/', now)).toEqual({
      url: '',
      remaining: '',
      expires: '',
    })
    const view = shareLinkView(
      { share_token: 'tok', expires_at: '2026-12-07T00:00:00.000Z' },
      'https://example.com/app/',
      now,
    )
    expect(view.url).toBe('https://example.com/app/#share=tok')
    expect(view.remaining).toBe('残り約30日')
    expect(view.expires).toMatch(/^20261207 \d{2}:\d{2}$/)
  })

  it('formFromItem copies fields and fills blanks', () => {
    expect(formFromItem({ title: 'A', price: 100 })).toEqual({
      title: 'A',
      image: '',
      url: '',
      price: 100,
      unit: '',
      genre: '',
      comment: '',
    })
  })
})
