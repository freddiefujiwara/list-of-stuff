import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import App from '../../src/App.vue'

// Mock the item utils, creating the spy inside the factory to avoid hoisting issues
vi.mock('@/utils/items', () => ({
  default: {
    shuffleItems: vi.fn((items) => items),
  },
}))

describe('App.vue', async () => {
  // Asynchronously import the mocked module to get a handle on the spy
  const itemUtils = (await import('@/utils/items')).default
  const mockShuffleItems = itemUtils.shuffleItems

  const mockItems = [
    { title: 'A', genre: 'Gear', price: 1000 },
    { title: 'B', genre: 'Food', price: 2500 },
    { title: 'C', genre: 'Gear', price: 4200 },
  ]

  beforeEach(() => {
    // Reset mocks before each test
    vi.spyOn(global, 'fetch').mockRestore()
    mockShuffleItems.mockClear()
  })

  it('displays a loading message initially', () => {
    vi.spyOn(global, 'fetch').mockImplementation(() => new Promise(() => {})) // Never resolves
    const wrapper = mount(App)
    expect(wrapper.text()).toContain('読み込み中です…')
  })

  it('displays an error message if the data fetch fails', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('API Error'))
    const wrapper = mount(App)
    await flushPromises()
    expect(wrapper.text()).toContain('データの取得に失敗しました。')
  })

  it('displays a list of items after a successful data fetch', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      json: () => Promise.resolve(mockItems),
    })
    const wrapper = mount(App)
    await flushPromises()
    expect(mockShuffleItems).toHaveBeenCalledWith(mockItems)
    expect(wrapper.findAllComponents({ name: 'GearItemCard' }).length).toBe(mockItems.length)
  })

  it('filters the list of items when a genre is clicked', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      json: () => Promise.resolve(mockItems),
    })
    const wrapper = mount(App)
    await flushPromises()

    const genreButton = wrapper.findAll('.chip').find((b) => b.text() === 'Gear')
    await genreButton.trigger('click')

    expect(wrapper.findAllComponents({ name: 'GearItemCard' }).length).toBe(2)
  })

  it('clears the filter when the same genre is clicked again', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      json: () => Promise.resolve(mockItems),
    })
    const wrapper = mount(App)
    await flushPromises()

    const genreButton = wrapper.findAll('.chip').find((b) => b.text() === 'Gear')
    await genreButton.trigger('click') // First click
    await genreButton.trigger('click') // Second click

    expect(wrapper.findAllComponents({ name: 'GearItemCard' }).length).toBe(mockItems.length)
  })
})
