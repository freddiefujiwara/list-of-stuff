import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../../src/App.vue'

const toBase64Url = (obj) =>
  Buffer.from(JSON.stringify(obj))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

const credential = (payload) => `${toBase64Url({ alg: 'RS256' })}.${toBase64Url(payload)}.sig`

const ITEMS_BY_SHEET = {
  workman: [
    { row: 2, title: 'Workman A', image: 'https://img.example/a.jpg', url: 'https://example.com/a', price: 1500, unit: 2, genre: '衣料', comment: 'メモ' },
  ],
  variety: [],
  others: [
    { row: 2, title: 'Other C', image: '', url: '', price: '', unit: '', genre: '', comment: '' },
  ],
}

let calls
let handler
let gisCallback
let wrapper

const defaultHandler = (body) => {
  if (body.action === 'list_items') {
    return {
      ok: true,
      sheet: body.sheet,
      items: ITEMS_BY_SHEET[body.sheet] || [],
      ...(body.share_token ? { _share: { expires_at: '2026-12-07T00:00:00.000Z' } } : {}),
    }
  }
  if (body.action === 'issue_share')
    return { ok: true, share_token: 'sharetoken123', issued_at: '2026-11-07T00:00:00.000Z', expires_at: '2026-12-07T00:00:00.000Z', ttl_seconds: 2592000 }
  if (body.action === 'revoke_share') return { ok: true, revoked: true }
  return { ok: true, row: body.row || 4 }
}

const mountApp = async (hash = '') => {
  window.location.hash = hash
  wrapper = mount(App, { attachTo: document.body })
  await flushPromises()
  window.dispatchEvent(new Event('load'))
  await flushPromises()
  return wrapper
}

const signIn = async () => {
  gisCallback({ credential: credential({ email: 'owner@example.com' }) })
  await flushPromises()
}

beforeEach(() => {
  calls = []
  handler = defaultHandler
  gisCallback = null
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url, opts) => {
      const body = JSON.parse(opts.body)
      calls.push(body)
      return { json: async () => handler(body) }
    }),
  )
  window.google = {
    accounts: {
      id: {
        initialize: vi.fn((opts) => {
          gisCallback = opts.callback
        }),
        renderButton: vi.fn(),
        disableAutoSelect: vi.fn(),
      },
    },
  }
  localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
})

afterEach(() => {
  wrapper?.unmount()
  wrapper = null
  document.body.innerHTML = ''
  window.location.hash = ''
  vi.unstubAllGlobals()
  delete window.google
})

describe('App gate and sign-in', () => {
  it('shows the Google gate and initializes GIS', async () => {
    const w = await mountApp()
    expect(w.text()).toContain('Googleログインが必要です')
    expect(window.google.accounts.id.initialize).toHaveBeenCalledWith(
      expect.objectContaining({ client_id: expect.stringContaining('apps.googleusercontent.com') }),
    )
    expect(window.google.accounts.id.renderButton).toHaveBeenCalled()
  })

  it('does not crash when the GIS script is unavailable', async () => {
    delete window.google
    const w = await mountApp()
    expect(w.text()).toContain('Googleログインが必要です')
  })

  it('signs in and lists the items of the first sheet', async () => {
    const w = await mountApp()
    await signIn()
    expect(w.text()).toContain('owner@example.com')
    expect(w.text()).toContain('Workman A')
    expect(w.text()).toContain('¥1,500 ×2 / 衣料 / メモ')
    expect(w.text()).toContain('1件')
    expect(w.text()).toContain('共有')
  })
})

describe('App list interactions', () => {
  it('switches sheets and reloads', async () => {
    const w = await mountApp()
    await signIn()
    const pills = w.findAll('.builder-tab')
    await pills[2].trigger('click')
    await flushPromises()
    expect(w.text()).toContain('Other C')
    expect(calls[calls.length - 1]).toMatchObject({ action: 'list_items', sheet: 'others' })
    await w.findAll('button').find((b) => b.text() === '再読み込み').trigger('click')
    await flushPromises()
    expect(calls.filter((c) => c.action === 'list_items' && c.sheet === 'others')).toHaveLength(2)
  })

  it('swaps a broken thumbnail to the fallback image', async () => {
    const w = await mountApp()
    await signIn()
    const img = w.find('img.item-thumb')
    await img.trigger('error')
    expect(img.element.src).toContain('junbi.jpg')
    await img.trigger('error')
    expect(img.element.src).toContain('junbi.jpg')
  })

  it('deletes an item after confirmation', async () => {
    vi.stubGlobal('confirm', vi.fn(() => true))
    const w = await mountApp()
    await signIn()
    await w.findAll('button').find((b) => b.attributes('aria-label') === '削除').trigger('click')
    await flushPromises()
    expect(calls.find((c) => c.action === 'delete_item')).toMatchObject({ sheet: 'workman', row: 2 })
  })

  it('keeps the item when deletion is cancelled', async () => {
    vi.stubGlobal('confirm', vi.fn(() => false))
    const w = await mountApp()
    await signIn()
    await w.findAll('button').find((b) => b.attributes('aria-label') === '削除').trigger('click')
    await flushPromises()
    expect(calls.find((c) => c.action === 'delete_item')).toBeUndefined()
  })
})

describe('App form', () => {
  it('creates an item from the 登録 tab', async () => {
    const w = await mountApp()
    await signIn()
    await w.findAll('.main-tab')[1].trigger('click')
    await w.find('#f-title').setValue('新しい商品')
    await w.find('#f-image').setValue('https://img.example/new.jpg')
    await w.find('#f-url').setValue('https://example.com/new')
    await w.findAll('input[type="number"]')[0].setValue(2980)
    await w.findAll('input[type="number"]')[1].setValue(2)
    await w.find('#f-genre').setValue('衣料')
    await w.find('#f-comment').setValue('買い替え')
    await w.findAll('button').find((b) => b.text() === '登録する').trigger('click')
    await flushPromises()
    expect(calls.find((c) => c.action === 'create_item')).toMatchObject({
      sheet: 'workman',
      item: {
        title: '新しい商品',
        image: 'https://img.example/new.jpg',
        url: 'https://example.com/new',
        price: 2980,
        unit: 2,
        genre: '衣料',
        comment: '買い替え',
      },
    })
    expect(w.text()).toContain('登録中のアイテム')
  })

  it('creates into the sheet chosen on the form pills', async () => {
    const w = await mountApp()
    await signIn()
    await w.findAll('.main-tab')[1].trigger('click')
    const formPills = w.findAll('section .builder-tab')
    await formPills[2].trigger('click')
    await flushPromises()
    await w.find('#f-title').setValue('その他の商品')
    await w.findAll('button').find((b) => b.text() === '登録する').trigger('click')
    await flushPromises()
    expect(calls.find((c) => c.action === 'create_item')).toMatchObject({ sheet: 'others' })
    await w.findAll('.main-tab')[0].trigger('click')
    expect(w.text()).toContain('登録中のアイテム')
  })

  it('edits an item and returns to the list', async () => {
    const w = await mountApp()
    await signIn()
    await w.findAll('button').find((b) => b.attributes('aria-label') === '編集').trigger('click')
    expect(w.find('#f-title').element.value).toBe('Workman A')
    expect(w.text()).toContain('ワークマンのアイテムを編集中')
    await w.find('#f-title').setValue('Workman A2')
    await w.findAll('button').find((b) => b.text() === '更新する').trigger('click')
    await flushPromises()
    expect(calls.find((c) => c.action === 'update_item')).toMatchObject({
      sheet: 'workman',
      row: 2,
      item: { title: 'Workman A2' },
    })
    expect(w.text()).toContain('登録中のアイテム')
  })

  it('cancels an edit without saving', async () => {
    const w = await mountApp()
    await signIn()
    await w.findAll('button').find((b) => b.attributes('aria-label') === '編集').trigger('click')
    await w.findAll('button').find((b) => b.text() === '編集をやめる').trigger('click')
    expect(w.text()).toContain('登録中のアイテム')
    expect(calls.find((c) => c.action === 'update_item')).toBeUndefined()
  })

  it('shows the server error when saving fails', async () => {
    handler = (body) =>
      body.action === 'create_item' ? { ok: false, error: 'sheet is not editable: room' } : defaultHandler(body)
    const w = await mountApp()
    await signIn()
    await w.findAll('.main-tab')[1].trigger('click')
    await w.find('#f-title').setValue('X')
    await w.findAll('button').find((b) => b.text() === '登録する').trigger('click')
    await flushPromises()
    expect(w.text()).toContain('sheet is not editable: room')
  })

  it('shows the generic save error when the server gives no reason', async () => {
    handler = (body) =>
      body.action === 'create_item' ? { ok: false } : defaultHandler(body)
    const w = await mountApp()
    await signIn()
    await w.findAll('.main-tab')[1].trigger('click')
    await w.find('#f-title').setValue('X')
    await w.findAll('button').find((b) => b.text() === '登録する').trigger('click')
    await flushPromises()
    expect(w.text()).toContain('保存に失敗しました')
  })

  it('shows a generic error when saving throws', async () => {
    const w = await mountApp()
    await signIn()
    await w.findAll('.main-tab')[1].trigger('click')
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('offline') }))
    await w.findAll('button').find((b) => b.text() === '登録する').trigger('click')
    await flushPromises()
    expect(w.text()).toContain('保存に失敗しました')
  })
})

describe('App share tab', () => {
  it('issues, copies, reissues and revokes a share link', async () => {
    const writeText = vi.fn(async () => {})
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
    const w = await mountApp()
    await signIn()
    await w.findAll('.main-tab')[2].trigger('click')
    await w.findAll('button').find((b) => b.text() === '1か月間有効なURLを発行').trigger('click')
    await flushPromises()
    const input = w.find('.share-url-input')
    expect(input.element.value).toContain('#share=sharetoken123')
    expect(w.text()).toContain('残り約')
    await w.findAll('button').find((b) => b.text() === 'URLをコピー').trigger('click')
    await flushPromises()
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('#share=sharetoken123'))
    await w.findAll('button').find((b) => b.text() === '新しいURLを発行し直す').trigger('click')
    await flushPromises()
    expect(calls.filter((c) => c.action === 'issue_share')).toHaveLength(2)
    await w.findAll('button').find((b) => b.text() === '今すぐ無効化する').trigger('click')
    await flushPromises()
    expect(w.find('.share-url-input').exists()).toBe(false)
  })

  it('shows an error when issuing fails and when copying fails', async () => {
    handler = (body) =>
      body.action === 'issue_share' ? { ok: false, error: 'forbidden' } : defaultHandler(body)
    const w = await mountApp()
    await signIn()
    await w.findAll('.main-tab')[2].trigger('click')
    await w.findAll('button').find((b) => b.text() === '1か月間有効なURLを発行').trigger('click')
    await flushPromises()
    expect(w.text()).toContain('forbidden')

    handler = defaultHandler
    await w.findAll('button').find((b) => b.text() === '1か月間有効なURLを発行').trigger('click')
    await flushPromises()
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn(async () => { throw new Error('denied') }) },
      configurable: true,
    })
    await w.findAll('button').find((b) => b.text() === 'URLをコピー').trigger('click')
    await flushPromises()
    expect(w.text()).toContain('コピーに失敗しました')
  })

  it('shows generic errors when issue and revoke give no reason', async () => {
    handler = (body) =>
      body.action === 'issue_share' || body.action === 'revoke_share'
        ? { ok: false }
        : defaultHandler(body)
    const w = await mountApp()
    await signIn()
    await w.findAll('.main-tab')[2].trigger('click')
    await w.findAll('button').find((b) => b.text() === '1か月間有効なURLを発行').trigger('click')
    await flushPromises()
    expect(w.text()).toContain('発行に失敗しました')
    handler = (body) =>
      body.action === 'revoke_share' ? { ok: false } : defaultHandler(body)
    await w.findAll('button').find((b) => b.text() === '1か月間有効なURLを発行').trigger('click')
    await flushPromises()
    await w.findAll('button').find((b) => b.text() === '今すぐ無効化する').trigger('click')
    await flushPromises()
    expect(w.text()).toContain('無効化に失敗しました')
  })

  it('shows generic errors when issue and revoke throw', async () => {
    const w = await mountApp()
    await signIn()
    await w.findAll('.main-tab')[2].trigger('click')
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('offline') }))
    await w.findAll('button').find((b) => b.text() === '1か月間有効なURLを発行').trigger('click')
    await flushPromises()
    expect(w.text()).toContain('発行に失敗しました')
  })

  it('shows a throw error when revoking throws', async () => {
    const w = await mountApp()
    await signIn()
    await w.findAll('.main-tab')[2].trigger('click')
    await w.findAll('button').find((b) => b.text() === '1か月間有効なURLを発行').trigger('click')
    await flushPromises()
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('offline') }))
    await w.findAll('button').find((b) => b.text() === '今すぐ無効化する').trigger('click')
    await flushPromises()
    expect(w.text()).toContain('無効化に失敗しました')
  })

  it('shows an error when revoking fails', async () => {
    handler = (body) =>
      body.action === 'revoke_share' ? { ok: false, error: 'nope' } : defaultHandler(body)
    const w = await mountApp()
    await signIn()
    await w.findAll('.main-tab')[2].trigger('click')
    await w.findAll('button').find((b) => b.text() === '1か月間有効なURLを発行').trigger('click')
    await flushPromises()
    await w.findAll('button').find((b) => b.text() === '今すぐ無効化する').trigger('click')
    await flushPromises()
    expect(w.text()).toContain('nope')
    expect(w.find('.share-url-input').exists()).toBe(true)
  })
})

describe('App share sessions and chrome', () => {
  it('opens directly from a share link without the share tab or logout', async () => {
    const w = await mountApp('#share=tok123')
    expect(w.text()).toContain('Workman A')
    expect(w.text()).toContain('一時アクセスリンクで利用中')
    expect(w.text()).not.toContain('共有')
    expect(w.text()).not.toContain('ログアウト')
    expect(calls[0]).toMatchObject({ share_token: 'tok123' })
  })

  it('shows the expired screen for a dead share link', async () => {
    handler = () => ({ ok: false, status: 401, error: 'share session expired or invalid' })
    const w = await mountApp('#share=dead')
    expect(w.text()).toContain('リンクの有効期限が切れています')
  })

  it('toggles the theme and persists it', async () => {
    const w = await mountApp()
    const toggle = w.findAll('button').find((b) => b.text() === 'ライト')
    await toggle.trigger('click')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    expect(localStorage.getItem('list-of-stuff-admin-theme')).toBe('light')
    expect(w.findAll('button').find((b) => b.text() === 'ダーク')).toBeTruthy()
  })

  it('logs out back to the gate', async () => {
    const w = await mountApp()
    await signIn()
    await w.findAll('button').find((b) => b.text() === 'ログアウト').trigger('click')
    expect(w.text()).toContain('Googleログインが必要です')
    expect(window.google.accounts.id.disableAutoSelect).toHaveBeenCalled()
  })

  it('logs out even when the GIS script is gone', async () => {
    const w = await mountApp()
    await signIn()
    delete window.google
    await w.findAll('button').find((b) => b.text() === 'ログアウト').trigger('click')
    expect(w.text()).toContain('Googleログインが必要です')
  })
})
