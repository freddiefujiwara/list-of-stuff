import { describe, it, expect, beforeEach } from 'vitest'
import { filterByGenre, formatYen, shuffleItems } from '../../src/utils/items'

describe('item helpers', () => {
  let items

  beforeEach(() => {
    items = [
      { title: 'A', genre: 'Gear', price: 1000 },
      { title: 'B', genre: 'Food', price: 2500 },
      { title: 'C', genre: 'Gear', price: 4200 },
    ]
  })

  it('filterByGenre narrows to matching genre', () => {
    const filtered = filterByGenre(items, 'Gear')
    expect(filtered.length).toBe(2)
    expect(filtered.every((item) => item.genre === 'Gear')).toBe(true)
  })

  it('filterByGenre returns all items when no genre given', () => {
    const filtered = filterByGenre(items, '')
    expect(filtered.length).toBe(items.length)
  })

  it('formatYen formats numbers with separators and suffix', () => {
    expect(formatYen(1340)).toBe('1,340円')
    expect(formatYen()).toBe('0円')
  })

  it('shuffleItems keeps all items without mutating original', () => {
    const original = [...items]
    const shuffled = shuffleItems(items)
    expect(items).toEqual(original)
    expect(shuffled.map((item) => item.title).sort()).toEqual(
      original.map((item) => item.title).sort()
    )
  })
})
