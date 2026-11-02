import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import { useItems } from '../../src/composables/useItems'
import { API_URL, ITEMS_CACHE_KEY } from '../../src/constants/app'

vi.mock('@/utils/items', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    shuffleItems: vi.fn((items) => items),
  }
})

const TestHarness = {
  template: '<div />',
  setup() {
    return useItems(API_URL)
  },
}

const buildItems = () => [
  { title: 'A', genre: 'Gear', price: 1000 },
  { title: 'B', genre: 'Food', price: 2500 },
  { title: 'C', genre: 'Gear', price: 4200 },
]

const buildCachedItems = () => [
  { title: 'Cached A', genre: 'Gear', price: 500 },
  { title: 'Cached B', genre: 'Book', price: 1500 },
]

const mockFetchResolve = (items) => {
  vi.spyOn(global, 'fetch').mockResolvedValue({
    json: () => Promise.resolve(items),
  })
}

const mockFetchReject = (error) => {
  vi.spyOn(global, 'fetch').mockRejectedValue(error)
}

describe('useItems', async () => {
  const { shuffleItems: mockShuffleItems } = await import('@/utils/items')

  beforeEach(() => {
    vi.spyOn(global, 'fetch').mockRestore()
    mockShuffleItems.mockClear()
    localStorage.clear()
  })

  it('starts in a loading state before the request resolves', () => {
    vi.spyOn(global, 'fetch').mockImplementation(() => new Promise(() => {}))

    const wrapper = mount(TestHarness)

    expect(wrapper.vm.loading).toBe(true)
    expect(wrapper.vm.error).toBe('')
    expect(wrapper.vm.filteredItems.length).toBe(0)
    expect(wrapper.vm.genres.length).toBe(0)
  })

  it('loads items and computes genres', async () => {
    const items = buildItems()
    mockFetchResolve(items)

    const wrapper = mount(TestHarness)
    await flushPromises()

    expect(mockShuffleItems).toHaveBeenCalledWith(items)
    expect(wrapper.vm.loading).toBe(false)
    expect(wrapper.vm.error).toBe('')
    expect(wrapper.vm.filteredItems.length).toBe(3)
    expect(wrapper.vm.genres).toEqual(['Gear', 'Food'])
  })

  it('exposes the total item count regardless of the active filter', async () => {
    const items = buildItems()
    mockFetchResolve(items)

    const wrapper = mount(TestHarness)

    expect(wrapper.vm.totalCount).toBe(0)

    await flushPromises()

    expect(wrapper.vm.totalCount).toBe(3)

    wrapper.vm.toggleGenre('Gear')
    await nextTick()

    expect(wrapper.vm.filteredItems.length).toBe(2)
    expect(wrapper.vm.totalCount).toBe(3)
  })

  it('toggles genres and filters items', async () => {
    const items = buildItems()
    mockFetchResolve(items)

    const wrapper = mount(TestHarness)
    await flushPromises()

    wrapper.vm.toggleGenre('Gear')
    await nextTick()

    expect(wrapper.vm.filteredItems.length).toBe(2)

    wrapper.vm.toggleGenre('Gear')
    await nextTick()

    expect(wrapper.vm.filteredItems.length).toBe(3)
  })

  it('clears the active genre filter with clearGenre', async () => {
    const items = buildItems()
    mockFetchResolve(items)

    const wrapper = mount(TestHarness)
    await flushPromises()

    wrapper.vm.toggleGenre('Gear')
    await nextTick()

    expect(wrapper.vm.activeGenre).toBe('Gear')
    expect(wrapper.vm.filteredItems.length).toBe(2)

    wrapper.vm.clearGenre()
    await nextTick()

    expect(wrapper.vm.activeGenre).toBe('')
    expect(wrapper.vm.filteredItems.length).toBe(3)
  })

  it('keeps the filter cleared when clearGenre is called with no active genre', async () => {
    const items = buildItems()
    mockFetchResolve(items)

    const wrapper = mount(TestHarness)
    await flushPromises()

    wrapper.vm.clearGenre()
    await nextTick()

    expect(wrapper.vm.activeGenre).toBe('')
    expect(wrapper.vm.filteredItems.length).toBe(3)
  })

  it('sets an error when the request fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockFetchReject(new Error('API Error'))

    const wrapper = mount(TestHarness)
    await flushPromises()

    expect(wrapper.vm.loading).toBe(false)
    expect(wrapper.vm.error).toBe('データの取得に失敗しました。')

    consoleSpy.mockRestore()
  })

  it('stores the fetched items in the cache after a successful load', async () => {
    const items = buildItems()
    mockFetchResolve(items)

    mount(TestHarness)
    await flushPromises()

    expect(localStorage.getItem(ITEMS_CACHE_KEY)).toBe(JSON.stringify(items))
  })

  it('displays cached items immediately while the request is pending', () => {
    const cachedItems = buildCachedItems()
    localStorage.setItem(ITEMS_CACHE_KEY, JSON.stringify(cachedItems))
    vi.spyOn(global, 'fetch').mockImplementation(() => new Promise(() => {}))

    const wrapper = mount(TestHarness)

    expect(mockShuffleItems).toHaveBeenCalledWith(cachedItems)
    expect(wrapper.vm.loading).toBe(false)
    expect(wrapper.vm.error).toBe('')
    expect(wrapper.vm.filteredItems.length).toBe(2)
    expect(wrapper.vm.genres).toEqual(['Gear', 'Book'])
  })

  it('replaces cached items with fresh data and updates the cache', async () => {
    const cachedItems = buildCachedItems()
    localStorage.setItem(ITEMS_CACHE_KEY, JSON.stringify(cachedItems))
    const items = buildItems()
    mockFetchResolve(items)

    const wrapper = mount(TestHarness)
    await flushPromises()

    expect(wrapper.vm.loading).toBe(false)
    expect(wrapper.vm.error).toBe('')
    expect(wrapper.vm.filteredItems.length).toBe(3)
    expect(wrapper.vm.genres).toEqual(['Gear', 'Food'])
    expect(localStorage.getItem(ITEMS_CACHE_KEY)).toBe(JSON.stringify(items))
  })

  it('keeps cached items without an error when the background refresh fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const cachedItems = buildCachedItems()
    localStorage.setItem(ITEMS_CACHE_KEY, JSON.stringify(cachedItems))
    mockFetchReject(new Error('API Error'))

    const wrapper = mount(TestHarness)
    await flushPromises()

    expect(wrapper.vm.loading).toBe(false)
    expect(wrapper.vm.error).toBe('')
    expect(wrapper.vm.filteredItems.length).toBe(2)

    consoleSpy.mockRestore()
  })

  it('falls back to the network when the cached JSON is corrupted', async () => {
    localStorage.setItem(ITEMS_CACHE_KEY, '{invalid json')
    const items = buildItems()
    mockFetchResolve(items)

    const wrapper = mount(TestHarness)
    await flushPromises()

    expect(wrapper.vm.loading).toBe(false)
    expect(wrapper.vm.error).toBe('')
    expect(wrapper.vm.filteredItems.length).toBe(3)
  })

  it('ignores a cached value that is not an array', async () => {
    localStorage.setItem(ITEMS_CACHE_KEY, JSON.stringify({ title: 'not an array' }))
    const items = buildItems()
    mockFetchResolve(items)

    const wrapper = mount(TestHarness)
    await flushPromises()

    expect(wrapper.vm.loading).toBe(false)
    expect(wrapper.vm.error).toBe('')
    expect(wrapper.vm.filteredItems.length).toBe(3)
    expect(wrapper.vm.genres).toEqual(['Gear', 'Food'])
  })

  it('falls back to the network when reading the cache throws', async () => {
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage unavailable')
    })
    const items = buildItems()
    mockFetchResolve(items)

    const wrapper = mount(TestHarness)
    await flushPromises()

    expect(wrapper.vm.loading).toBe(false)
    expect(wrapper.vm.error).toBe('')
    expect(wrapper.vm.filteredItems.length).toBe(3)

    getItemSpy.mockRestore()
  })

  it('still displays items when writing the cache fails', async () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded')
    })
    const items = buildItems()
    mockFetchResolve(items)

    const wrapper = mount(TestHarness)
    await flushPromises()

    expect(wrapper.vm.loading).toBe(false)
    expect(wrapper.vm.error).toBe('')
    expect(wrapper.vm.filteredItems.length).toBe(3)

    setItemSpy.mockRestore()
  })
})
