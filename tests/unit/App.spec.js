import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import App from '../../src/App.vue'

// Mock the item utils with named exports
vi.mock('@/utils/items', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    shuffleItems: vi.fn((items) => items),
  }
})

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

describe('App.vue', async () => {
  // Asynchronously import the mocked module to get a handle on the spy
  const { shuffleItems: mockShuffleItems } = await import('@/utils/items')

  beforeEach(() => {
    vi.spyOn(global, 'fetch').mockRestore()
    mockShuffleItems.mockClear()
  })

  it('displays a loading message initially', () => {
    vi.spyOn(global, 'fetch').mockImplementation(() => new Promise(() => {}))

    const wrapper = mount(App)

    expect(wrapper.text()).toContain('読み込み中です…')
  })

  it('displays an error message if the data fetch fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockFetchReject(new Error('API Error'))

    const wrapper = mount(App)
    await flushPromises()

    expect(wrapper.text()).toContain('データの取得に失敗しました。')

    consoleSpy.mockRestore()
  })

  it('displays a list of items after a successful data fetch', async () => {
    const mockItems = buildItems()
    mockFetchResolve(mockItems)

    const wrapper = mount(App)
    await flushPromises()

    expect(mockShuffleItems).toHaveBeenCalledWith(mockItems)
    expect(wrapper.findAllComponents({ name: 'GearItemCard' }).length).toBe(mockItems.length)
  })

  it('filters the list of items when a genre is clicked', async () => {
    const mockItems = buildItems()
    mockFetchResolve(mockItems)

    const wrapper = mount(App)
    await flushPromises()

    const genreButton = wrapper.findAll('.chip').find((button) => button.text() === 'Gear')
    await genreButton.trigger('click')

    expect(wrapper.findAllComponents({ name: 'GearItemCard' }).length).toBe(2)
  })

  it('clears the filter when the same genre is clicked again', async () => {
    const mockItems = buildItems()
    mockFetchResolve(mockItems)

    const wrapper = mount(App)
    await flushPromises()

    const genreButton = wrapper.findAll('.chip').find((button) => button.text() === 'Gear')
    await genreButton.trigger('click')
    await genreButton.trigger('click')

    expect(wrapper.findAllComponents({ name: 'GearItemCard' }).length).toBe(mockItems.length)
  })

  it('copies filtered items to clipboard when copy button is clicked', async () => {
    const mockItems = buildItems()
    mockFetchResolve(mockItems)
    const writeTextSpy = vi.fn().mockResolvedValue()
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextSpy,
      },
    })

    const wrapper = mount(App)
    await flushPromises()

    const copyButton = wrapper.find('.btn-copy')
    await copyButton.trigger('click')

    expect(writeTextSpy).toHaveBeenCalledWith(JSON.stringify(mockItems, null, 2))
    expect(wrapper.text()).toContain('コピー完了')
  })

  it('shows copy completion message temporarily', async () => {
    vi.useFakeTimers()
    const mockItems = buildItems()
    mockFetchResolve(mockItems)
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(),
      },
    })

    const wrapper = mount(App)
    await flushPromises()

    const copyButton = wrapper.find('.btn-copy')
    await copyButton.trigger('click')

    expect(wrapper.text()).toContain('コピー完了')

    vi.advanceTimersByTime(2000)
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).not.toContain('コピー完了')
    expect(wrapper.text()).toContain('コピー')
    vi.useRealTimers()
  })

  it('logs error when clipboard copy fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const mockItems = buildItems()
    mockFetchResolve(mockItems)
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockRejectedValue(new Error('Copy failed')),
      },
    })

    const wrapper = mount(App)
    await flushPromises()

    const copyButton = wrapper.find('.btn-copy')
    await copyButton.trigger('click')

    expect(consoleSpy).toHaveBeenCalledWith('Failed to copy:', expect.any(Error))
    consoleSpy.mockRestore()
  })
})
