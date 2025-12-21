const assert = require('assert')
const { test, describe, beforeEach } = require('node:test')
const { filterByGenre, formatYen, shuffleItems } = require('../../src/utils/items')

describe('item helpers', () => {
  let items

  beforeEach(() => {
    items = [
      { title: 'A', genre: 'Gear', price: 1000 },
      { title: 'B', genre: 'Food', price: 2500 },
      { title: 'C', genre: 'Gear', price: 4200 },
    ]
  })

  test('filterByGenre narrows to matching genre', () => {
    const filtered = filterByGenre(items, 'Gear')
    assert.strictEqual(filtered.length, 2)
    assert.ok(filtered.every((item) => item.genre === 'Gear'))
  })

  test('filterByGenre returns all items when no genre given', () => {
    const filtered = filterByGenre(items, '')
    assert.strictEqual(filtered.length, items.length)
  })

  test('formatYen formats numbers with separators and suffix', () => {
    assert.strictEqual(formatYen(1340), '1,340円')
    assert.strictEqual(formatYen(), '0円')
  })

  test('shuffleItems keeps all items without mutating original', () => {
    const original = [...items]
    const shuffled = shuffleItems(items)
    assert.deepStrictEqual(items, original, 'should not mutate input')
    assert.deepStrictEqual(
      shuffled.map((item) => item.title).sort(),
      original.map((item) => item.title).sort()
    )
  })
})
