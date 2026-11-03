import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
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

const findGenreLink = (wrapper, label) =>
  wrapper
    .findAll('.genre-link')
    .find((button) => button.find('.genre-label').text() === label)

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
    expect(wrapper.find('.copy-link').classes()).toContain('disabled')
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
    expect(wrapper.find('.copy-link').classes()).not.toContain('disabled')
  })

  it('filters the list of items when a genre link is clicked', async () => {
    const mockItems = buildItems()
    mockFetchResolve(mockItems)

    const wrapper = mount(App)
    await flushPromises()

    const genreButton = findGenreLink(wrapper, 'Gear')
    await genreButton.trigger('click')

    expect(wrapper.findAllComponents({ name: 'GearItemCard' }).length).toBe(2)
    expect(findGenreLink(wrapper, 'Gear').classes()).toContain('active')
    expect(findGenreLink(wrapper, 'Food').classes()).not.toContain('active')
  })

  it('clears the filter when the same genre is clicked again', async () => {
    const mockItems = buildItems()
    mockFetchResolve(mockItems)

    const wrapper = mount(App)
    await flushPromises()

    const genreButton = findGenreLink(wrapper, 'Gear')
    await genreButton.trigger('click')
    await genreButton.trigger('click')

    expect(wrapper.findAllComponents({ name: 'GearItemCard' }).length).toBe(mockItems.length)
    expect(findGenreLink(wrapper, 'Gear').classes()).not.toContain('active')
  })

  it('shows shortened genre labels with the count of all items in each genre', async () => {
    localStorage.clear()
    const jpItems = [
      { title: 'A', genre: '【電】家電にまつわる物', price: 1000, image: 'a.jpg', url: 'https://a.com' },
      { title: 'B', genre: '【食】キッチンにまつわる物', price: 2500, image: 'b.jpg', url: 'https://b.com' },
      { title: 'C', genre: '【電】家電にまつわる物', price: 4200, image: 'c.jpg', url: 'https://c.com' },
    ]
    mockFetchResolve(jpItems)

    const wrapper = mount(App)
    await flushPromises()

    const links = wrapper.findAll('.genre-link')
    expect(links.map((link) => link.find('.genre-label').text())).toEqual([
      '電・家電',
      '食・キッチン',
    ])
    expect(links.map((link) => link.find('.genre-count').text())).toEqual(['2', '1'])

    // Filtering still keys on the original genre string.
    await links[0].trigger('click')
    expect(wrapper.findAllComponents({ name: 'GearItemCard' }).length).toBe(2)
  })

  it('leaves genre labels that do not match the long format unchanged', async () => {
    const mockItems = buildItems()
    mockFetchResolve(mockItems)

    const wrapper = mount(App)
    await flushPromises()

    const links = wrapper.findAll('.genre-link')
    expect(links.map((link) => link.find('.genre-label').text())).toEqual(['Gear', 'Food'])
    expect(links.map((link) => link.find('.genre-count').text())).toEqual(['2', '1'])
  })

  it('places the copy link in the utility row above the footer instead of a footer button', async () => {
    const mockItems = buildItems()
    mockFetchResolve(mockItems)

    const wrapper = mount(App)
    await flushPromises()

    expect(wrapper.find('.genre-filter .copy-link').exists()).toBe(false)
    expect(wrapper.find('.site-footer .btn-copy').exists()).toBe(false)
    expect(wrapper.find('.site-footer .foot-actions').exists()).toBe(false)
    const utilityRow = wrapper.find('.footer-link')
    expect(utilityRow.exists()).toBe(true)
    expect(utilityRow.find('.copy-link').text()).toBe('コピー')
    expect(utilityRow.text()).toContain('トップへ戻る')
  })

  it('scrolls back to the top when the back-to-top link is clicked', async () => {
    const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    const mockItems = buildItems()
    mockFetchResolve(mockItems)

    const wrapper = mount(App)
    await flushPromises()

    const backToTop = wrapper.findAll('.footer-link a')[0]
    expect(backToTop.text()).toBe('トップへ戻る')
    await backToTop.trigger('click')

    expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
    scrollToSpy.mockRestore()
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

    const genreButton = findGenreLink(wrapper, 'Gear')
    await genreButton.trigger('click')

    expect(wrapper.findAllComponents({ name: 'GearItemCard' }).length).toBe(2)
    const clearButton = wrapper.find('.genre-filter .btn-clear-filter')
    expect(clearButton.element.style.display).toBe('')
    expect(clearButton.text()).toBe('フィルタを外す')

    await clearButton.trigger('click')

    expect(wrapper.findAllComponents({ name: 'GearItemCard' }).length).toBe(mockItems.length)
    expect(wrapper.find('.btn-clear-filter').element.style.display).toBe('none')
  })

  it('copies filtered items to clipboard (excluding image and url) when the copy link is clicked', async () => {
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

    const copyLink = wrapper.find('.copy-link')
    await copyLink.trigger('click')

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

    const genreButton = findGenreLink(wrapper, 'Gear')
    await genreButton.trigger('click')

    const copyLink = wrapper.find('.footer-link .copy-link')
    await copyLink.trigger('click')

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

    const copyLink = wrapper.find('.copy-link')
    await copyLink.trigger('click')

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
    // The hero contains only the label and the heading, like the blog.
    expect(wrapper.find('.hero .items-stats').exists()).toBe(false)
  })

  it('shows the same footer links as the blog', async () => {
    const mockItems = buildItems()
    mockFetchResolve(mockItems)

    const wrapper = mount(App)
    await flushPromises()

    const links = wrapper.findAll('.site-footer .foot-links a')
    expect(links.map((link) => link.attributes('href'))).toEqual([
      'https://freddiefujiwara.com/',
      'https://freddiefujiwara.com/blog/',
      'https://freddiefujiwara.com/list-of-stuff/',
      'https://www.instagram.com/freddiefujiwara',
      'https://www.facebook.com/freddiefujiwara',
      'https://www.google.com/maps/contrib/105456242747265663411/reviews',
      'https://review.travel.rakuten.co.jp/reviewer/fumikazufujiwara',
      'https://tabelog.com/rvwr/zegenvs/',
      'https://retty.me/user/50281/',
      'https://x.com/freddiefujiwara',
      'https://github.com/freddiefujiwara',
      'https://linkedin.com/in/freddiefujiwara',
    ])
    expect(links.map((link) => link.text())).toEqual([
      'トップ ↗',
      'ブログ ↗',
      '持ち物 ↗',
      'Instagram ↗',
      'Facebook ↗',
      'Googleマップの口コミ ↗',
      '楽天トラベルの口コミ ↗',
      '食べログの口コミ ↗',
      'Rettyの口コミ ↗',
      'X ↗',
      'GitHub ↗',
      'LinkedIn ↗',
    ])
    // Same-site links stay in the same tab so visitors can move
    // around the site; only links that leave the site open in a
    // new tab.
    for (const link of links.slice(0, 3)) {
      expect(link.attributes('target')).toBeUndefined()
    }
    for (const link of links.slice(3)) {
      expect(link.attributes('target')).toBe('_blank')
      expect(link.attributes('rel')).toBe('noopener')
    }
    // The footer itself holds only the links and the copyright line, like the blog.
    expect(wrapper.find('.site-footer .foot-actions').exists()).toBe(false)
    expect(wrapper.find('.site-footer .btn-copy').exists()).toBe(false)
  })

  it('keeps every header nav link in the same tab (same site)', async () => {
    localStorage.clear()
    vi.spyOn(global, 'fetch').mockImplementation(() => new Promise(() => {}))

    const wrapper = mount(App)
    await flushPromises()

    const links = wrapper.findAll('.site-nav a')
    expect(links.length).toBeGreaterThan(0)
    for (const link of links) {
      expect(link.attributes('target')).toBeUndefined()
    }
  })

  it('hides the item count while loading', () => {
    localStorage.clear()
    vi.spyOn(global, 'fetch').mockImplementation(() => new Promise(() => {}))

    const wrapper = mount(App)

    expect(wrapper.find('.items-stats').element.style.display).toBe('none')
  })

  it('hides the item count when the data fetch fails', async () => {
    localStorage.clear()
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockFetchReject(new Error('API Error'))

    const wrapper = mount(App)
    await flushPromises()

    expect(wrapper.find('.items-stats').element.style.display).toBe('none')

    consoleSpy.mockRestore()
  })

  it('shows the total item count above the filter after a successful fetch', async () => {
    const mockItems = buildItems()
    mockFetchResolve(mockItems)

    const wrapper = mount(App)
    await flushPromises()

    const stats = wrapper.find('.page > .items-stats')
    expect(stats.exists()).toBe(true)
    expect(stats.element.style.display).toBe('')
    expect(stats.text()).toBe('全3点')
  })

  it('keeps the total item count while a genre filter is active', async () => {
    const mockItems = buildItems()
    mockFetchResolve(mockItems)

    const wrapper = mount(App)
    await flushPromises()

    const genreButton = findGenreLink(wrapper, 'Gear')
    await genreButton.trigger('click')

    expect(wrapper.findAllComponents({ name: 'GearItemCard' }).length).toBe(2)
    expect(wrapper.find('.items-stats').text()).toBe('全3点')
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

    const copyLink = wrapper.find('.copy-link')
    await copyLink.trigger('click')

    expect(consoleSpy).toHaveBeenCalledWith('Failed to copy:', expect.any(Error))
    consoleSpy.mockRestore()
  })
})

describe('App.vue genre URL routing', () => {
  const jpItems = () => [
    { title: 'A', genre: '【電】家電にまつわる物', price: 1000, image: 'a.jpg', url: 'https://a.com' },
    { title: 'B', genre: '【食】キッチンにまつわる物', price: 2500, image: 'b.jpg', url: 'https://b.com' },
    { title: 'C', genre: '【電】家電にまつわる物', price: 4200, image: 'c.jpg', url: 'https://c.com' },
  ]

  beforeEach(() => {
    vi.spyOn(global, 'fetch').mockRestore()
    localStorage.clear()
    window.history.pushState(null, '', '/')
  })

  afterEach(() => {
    window.history.pushState(null, '', '/')
  })

  it('applies the genre filter from the URL slug on load', async () => {
    window.history.pushState(null, '', '/electronics')
    mockFetchResolve(jpItems())

    const wrapper = mount(App)
    await flushPromises()

    expect(wrapper.findAllComponents({ name: 'GearItemCard' }).length).toBe(2)
    expect(findGenreLink(wrapper, '電・家電').classes()).toContain('active')
    expect(findGenreLink(wrapper, '食・キッチン').classes()).not.toContain('active')
    wrapper.unmount()
  })

  it('ignores an unknown slug on load', async () => {
    window.history.pushState(null, '', '/unknown')
    mockFetchResolve(jpItems())

    const wrapper = mount(App)
    await flushPromises()

    expect(wrapper.findAllComponents({ name: 'GearItemCard' }).length).toBe(3)
    expect(wrapper.find('.genre-link.active').exists()).toBe(false)
    wrapper.unmount()
  })

  it('ignores a slug whose genre is not in the loaded data', async () => {
    window.history.pushState(null, '', '/electronics')
    mockFetchResolve([
      { title: 'B', genre: '【食】キッチンにまつわる物', price: 2500, image: 'b.jpg', url: 'https://b.com' },
    ])

    const wrapper = mount(App)
    await flushPromises()

    expect(wrapper.findAllComponents({ name: 'GearItemCard' }).length).toBe(1)
    expect(wrapper.find('.genre-link.active').exists()).toBe(false)
    wrapper.unmount()
  })

  it('shows no items and no filter when the loaded data is empty', async () => {
    window.history.pushState(null, '', '/electronics')
    mockFetchResolve([])

    const wrapper = mount(App)
    await flushPromises()

    expect(wrapper.findAllComponents({ name: 'GearItemCard' }).length).toBe(0)
    expect(wrapper.find('.items-stats').text()).toBe('全0点')
    wrapper.unmount()
  })

  it('pushes the genre path when a genre link is clicked and the base path when toggled off', async () => {
    mockFetchResolve(jpItems())

    const wrapper = mount(App)
    await flushPromises()

    const genreButton = findGenreLink(wrapper, '電・家電')
    await genreButton.trigger('click')

    expect(window.location.pathname).toBe('/electronics')
    expect(wrapper.findAllComponents({ name: 'GearItemCard' }).length).toBe(2)

    await genreButton.trigger('click')

    expect(window.location.pathname).toBe('/')
    expect(wrapper.findAllComponents({ name: 'GearItemCard' }).length).toBe(3)
    wrapper.unmount()
  })

  it('returns the URL to the base path when the clear filter button is clicked', async () => {
    mockFetchResolve(jpItems())

    const wrapper = mount(App)
    await flushPromises()

    await findGenreLink(wrapper, '電・家電').trigger('click')
    expect(window.location.pathname).toBe('/electronics')

    await wrapper.find('.btn-clear-filter').trigger('click')

    expect(window.location.pathname).toBe('/')
    expect(wrapper.findAllComponents({ name: 'GearItemCard' }).length).toBe(3)
    wrapper.unmount()
  })

  it('renders the hero inner as a link to the base path', async () => {
    mockFetchResolve(jpItems())

    const wrapper = mount(App)
    await flushPromises()

    const heroLink = wrapper.find('a.hero-inner')
    expect(heroLink.exists()).toBe(true)
    expect(heroLink.attributes('href')).toBe('/')
    expect(heroLink.find('.hero-place').text()).toBe('KAWAGUCHI — LIST OF STUFF')
    expect(heroLink.find('.h1-name').text()).toBe('藤原史和')
    wrapper.unmount()
  })

  it('clears the filter and returns the URL to the base path when the hero is clicked', async () => {
    mockFetchResolve(jpItems())

    const wrapper = mount(App)
    await flushPromises()

    await findGenreLink(wrapper, '電・家電').trigger('click')
    expect(window.location.pathname).toBe('/electronics')
    expect(wrapper.findAllComponents({ name: 'GearItemCard' }).length).toBe(2)

    await wrapper.find('a.hero-inner').trigger('click')

    expect(window.location.pathname).toBe('/')
    expect(wrapper.findAllComponents({ name: 'GearItemCard' }).length).toBe(3)
    expect(wrapper.find('.genre-link.active').exists()).toBe(false)
    wrapper.unmount()
  })

  it('keeps the unfiltered state when the hero is clicked with no filter active', async () => {
    mockFetchResolve(jpItems())

    const wrapper = mount(App)
    await flushPromises()

    await wrapper.find('a.hero-inner').trigger('click')

    expect(window.location.pathname).toBe('/')
    expect(wrapper.findAllComponents({ name: 'GearItemCard' }).length).toBe(3)
    expect(wrapper.find('.genre-link.active').exists()).toBe(false)
    wrapper.unmount()
  })

  it('leaves the URL unchanged for genres that have no path', async () => {
    mockFetchResolve(buildItems())

    const wrapper = mount(App)
    await flushPromises()

    await findGenreLink(wrapper, 'Gear').trigger('click')

    expect(window.location.pathname).toBe('/')
    expect(wrapper.findAllComponents({ name: 'GearItemCard' }).length).toBe(2)
    wrapper.unmount()
  })

  it('follows the URL on popstate in both directions', async () => {
    mockFetchResolve(jpItems())

    const wrapper = mount(App)
    await flushPromises()
    expect(wrapper.findAllComponents({ name: 'GearItemCard' }).length).toBe(3)

    window.history.pushState(null, '', '/kitchen')
    window.dispatchEvent(new Event('popstate'))
    await wrapper.vm.$nextTick()

    expect(wrapper.findAllComponents({ name: 'GearItemCard' }).length).toBe(1)
    expect(findGenreLink(wrapper, '食・キッチン').classes()).toContain('active')

    // A repeated popstate for the already-active genre keeps the filter.
    window.dispatchEvent(new Event('popstate'))
    await wrapper.vm.$nextTick()
    expect(wrapper.findAllComponents({ name: 'GearItemCard' }).length).toBe(1)

    window.history.pushState(null, '', '/')
    window.dispatchEvent(new Event('popstate'))
    await wrapper.vm.$nextTick()

    expect(wrapper.findAllComponents({ name: 'GearItemCard' }).length).toBe(3)
    expect(wrapper.find('.genre-link.active').exists()).toBe(false)
    wrapper.unmount()
  })

  it('removes the popstate listener when unmounted', async () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener')
    mockFetchResolve(jpItems())

    const wrapper = mount(App)
    await flushPromises()
    wrapper.unmount()

    expect(removeSpy).toHaveBeenCalledWith('popstate', expect.any(Function))
    removeSpy.mockRestore()
  })
})

describe('App.vue incremental rendering', () => {
  const buildManyItems = (count, genre = 'Gear') =>
    Array.from({ length: count }, (_, i) => ({
      title: `${genre} Item ${i}`,
      genre,
      price: 100,
      image: `item-${genre}-${i}.jpg`,
      url: 'https://example.com',
    }))


  const sentinelHidden = (wrapper) =>
    (wrapper.find('.load-more-sentinel').attributes('style') ?? '').includes('display: none')

  let ioCallback
  let ioInstances

  const stubIntersectionObserver = () => {
    ioCallback = null
    ioInstances = []
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(callback) {
          ioCallback = callback
          this.observe = vi.fn()
          this.unobserve = vi.fn()
          this.disconnect = vi.fn()
          ioInstances.push(this)
        }
      },
    )
  }

  beforeEach(() => {
    vi.spyOn(global, 'fetch').mockRestore()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('renders the first page and grows when the sentinel intersects', async () => {
    stubIntersectionObserver()
    mockFetchResolve(buildManyItems(70))

    const wrapper = mount(App)
    await flushPromises()

    expect(wrapper.findAllComponents({ name: 'GearItemCard' }).length).toBe(60)
    expect(sentinelHidden(wrapper)).toBe(false)
    expect(ioInstances[0].observe).toHaveBeenCalled()

    ioCallback([{ isIntersecting: false }])
    await flushPromises()
    expect(wrapper.findAllComponents({ name: 'GearItemCard' }).length).toBe(60)

    ioCallback([{ isIntersecting: true }])
    await flushPromises()
    expect(wrapper.findAllComponents({ name: 'GearItemCard' }).length).toBe(70)
    expect(sentinelHidden(wrapper)).toBe(true)

    wrapper.unmount()
    expect(ioInstances[0].disconnect).toHaveBeenCalled()
  })

  it('keeps one observation while the filter hides and shows the sentinel', async () => {
    stubIntersectionObserver()
    mockFetchResolve([...buildManyItems(70, 'Gear'), ...buildManyItems(3, 'Food')])

    const wrapper = mount(App)
    await flushPromises()
    const instance = ioInstances[0]
    expect(instance.observe).toHaveBeenCalledTimes(1)

    await findGenreLink(wrapper, 'Food').trigger('click')
    await flushPromises()
    expect(wrapper.findAllComponents({ name: 'GearItemCard' }).length).toBe(3)
    expect(sentinelHidden(wrapper)).toBe(true)

    await findGenreLink(wrapper, 'Food').trigger('click')
    await flushPromises()
    expect(sentinelHidden(wrapper)).toBe(false)
    expect(instance.observe).toHaveBeenCalledTimes(1)
  })

  it('hides the sentinel when all items fit on the first page', async () => {
    stubIntersectionObserver()
    mockFetchResolve(buildItems())

    const wrapper = mount(App)
    await flushPromises()

    expect(sentinelHidden(wrapper)).toBe(true)
  })

  it('observes the sentinel at mount when cached items render immediately', async () => {
    stubIntersectionObserver()
    const items = buildManyItems(70)
    localStorage.setItem('list-of-stuff:items:v1', JSON.stringify(items))
    mockFetchResolve(items)

    const wrapper = mount(App)
    await flushPromises()

    expect(wrapper.findAllComponents({ name: 'GearItemCard' }).length).toBe(60)
    expect(ioInstances[0].observe).toHaveBeenCalled()
  })

  it('renders the first page when IntersectionObserver is unavailable', async () => {
    mockFetchResolve([...buildManyItems(70, 'Gear'), ...buildManyItems(3, 'Food')])

    const wrapper = mount(App)
    await flushPromises()

    expect(wrapper.findAllComponents({ name: 'GearItemCard' }).length).toBe(60)
    expect(sentinelHidden(wrapper)).toBe(false)

    await findGenreLink(wrapper, 'Food').trigger('click')
    await flushPromises()
    expect(wrapper.findAllComponents({ name: 'GearItemCard' }).length).toBe(3)
    expect(sentinelHidden(wrapper)).toBe(true)
  })
})
