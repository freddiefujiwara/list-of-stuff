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
  { title: 'A', genre: 'Gear', price: 1000, image: 'a.jpg', url: 'https://a.com' },
  { title: 'B', genre: 'Food', price: 2500, image: 'b.jpg', url: 'https://b.com' },
  { title: 'C', genre: 'Gear', price: 4200, image: 'c.jpg', url: 'https://c.com' },
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
    const copyButton = wrapper.find('.btn-copy')
    expect(copyButton.element.disabled).toBe(true)
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
    const copyButton = wrapper.find('.btn-copy')
    expect(copyButton.element.disabled).toBe(false)
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

  it('places the copy button in the footer instead of the chips row', async () => {
    const mockItems = buildItems()
    mockFetchResolve(mockItems)

    const wrapper = mount(App)
    await flushPromises()

    expect(wrapper.find('.chips .btn-copy').exists()).toBe(false)
    expect(wrapper.find('.site-footer .btn-copy').exists()).toBe(true)
  })

  it('does not show the clear filter button when no genre is selected', async () => {
    const mockItems = buildItems()
    mockFetchResolve(mockItems)

    const wrapper = mount(App)
    await flushPromises()

    expect(wrapper.find('.btn-clear-filter').element.style.display).toBe('none')
  })

  it('shows the clear filter button while filtering and clears the filter when clicked', async () => {
    const mockItems = buildItems()
    mockFetchResolve(mockItems)

    const wrapper = mount(App)
    await flushPromises()

    const genreButton = wrapper.findAll('.chip').find((button) => button.text() === 'Gear')
    await genreButton.trigger('click')

    expect(wrapper.findAllComponents({ name: 'GearItemCard' }).length).toBe(2)
    const clearButton = wrapper.find('.chips .btn-clear-filter')
    expect(clearButton.element.style.display).toBe('')
    expect(clearButton.text()).toBe('フィルタを外す')

    await clearButton.trigger('click')

    expect(wrapper.findAllComponents({ name: 'GearItemCard' }).length).toBe(mockItems.length)
    expect(wrapper.find('.btn-clear-filter').element.style.display).toBe('none')
  })

  it('copies filtered items to clipboard (excluding image and url) when copy button is clicked', async () => {
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

    const expectedData = mockItems.map(({ image, url, ...rest }) => rest)
    expect(writeTextSpy).toHaveBeenCalledWith(JSON.stringify(expectedData, null, 2))
    expect(wrapper.text()).toContain('コピー完了')
  })

  it('copies only the filtered items when a genre filter is active', async () => {
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

    const genreButton = wrapper.findAll('.chip').find((button) => button.text() === 'Gear')
    await genreButton.trigger('click')

    const copyButton = wrapper.find('.site-footer .btn-copy')
    await copyButton.trigger('click')

    const expectedData = mockItems
      .filter((item) => item.genre === 'Gear')
      .map(({ image, url, ...rest }) => rest)
    expect(writeTextSpy).toHaveBeenCalledWith(JSON.stringify(expectedData, null, 2))
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

  it('shows the blog-style hero with the place label and the blog heading structure', async () => {
    const mockItems = buildItems()
    mockFetchResolve(mockItems)

    const wrapper = mount(App)
    await flushPromises()

    expect(wrapper.find('.hero-place').text()).toBe('KAWAGUCHI — LIST OF STUFF')
    expect(wrapper.find('.hero h1 .h1-name').text()).toBe('藤原史和')
    expect(wrapper.find('.hero h1 .h1-role').text()).toBe('川口を歩くQAエンジニア')
    const sep = wrapper.find('.hero h1 .h1-sep')
    expect(sep.text()).toBe('｜')
    expect(sep.attributes('aria-hidden')).toBe('true')
    expect(wrapper.find('.hero h1').text()).not.toContain('持ち物リスト')
  })

  it('hides the hero stats while loading', () => {
    localStorage.clear()
    vi.spyOn(global, 'fetch').mockImplementation(() => new Promise(() => {}))

    const wrapper = mount(App)

    expect(wrapper.find('.hero-stats').element.style.display).toBe('none')
  })

  it('hides the hero stats when the data fetch fails', async () => {
    localStorage.clear()
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockFetchReject(new Error('API Error'))

    const wrapper = mount(App)
    await flushPromises()

    expect(wrapper.find('.hero-stats').element.style.display).toBe('none')

    consoleSpy.mockRestore()
  })

  it('shows the total item count in the hero after a successful fetch', async () => {
    const mockItems = buildItems()
    mockFetchResolve(mockItems)

    const wrapper = mount(App)
    await flushPromises()

    expect(wrapper.find('.hero-stats').element.style.display).toBe('')
    expect(wrapper.find('.hero-stats').text()).toBe('全3点')
  })

  it('keeps the hero stats at the total count while a genre filter is active', async () => {
    const mockItems = buildItems()
    mockFetchResolve(mockItems)

    const wrapper = mount(App)
    await flushPromises()

    const genreButton = wrapper.findAll('.chip').find((button) => button.text() === 'Gear')
    await genreButton.trigger('click')

    expect(wrapper.findAllComponents({ name: 'GearItemCard' }).length).toBe(2)
    expect(wrapper.find('.hero-stats').text()).toBe('全3点')
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
