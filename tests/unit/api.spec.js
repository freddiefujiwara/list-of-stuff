import { describe, expect, it, vi } from 'vitest'
import { callApi } from '../../src/api.js'

describe('callApi', () => {
  it('posts the ID token and body as text/plain JSON', async () => {
    const fetchImpl = vi.fn(async () => ({ json: async () => ({ ok: true }) }))
    const res = await callApi('https://example/exec', 'tok', { action: 'list_items' }, fetchImpl)
    expect(res).toEqual({ ok: true })
    const [url, opts] = fetchImpl.mock.calls[0]
    expect(url).toBe('https://example/exec')
    expect(opts.method).toBe('POST')
    expect(opts.headers['Content-Type']).toBe('text/plain;charset=utf-8')
    expect(JSON.parse(opts.body)).toEqual({ idToken: 'tok', action: 'list_items' })
  })

  it('omits the idToken field value when null (share calls)', async () => {
    const fetchImpl = vi.fn(async () => ({ json: async () => ({ ok: true }) }))
    await callApi('https://example/exec', null, { action: 'list_items', share_token: 's' }, fetchImpl)
    expect(JSON.parse(fetchImpl.mock.calls[0][1].body)).toEqual({
      idToken: null,
      action: 'list_items',
      share_token: 's',
    })
  })
})
