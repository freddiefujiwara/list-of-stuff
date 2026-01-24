import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import { useItems } from '../../src/composables/useItems'
import { API_URL } from '../../src/constants/app'

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

  it('sets an error when the request fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockFetchReject(new Error('API Error'))

    const wrapper = mount(TestHarness)
    await flushPromises()

    expect(wrapper.vm.loading).toBe(false)
    expect(wrapper.vm.error).toBe('データの取得に失敗しました。')

    consoleSpy.mockRestore()
  })
})
