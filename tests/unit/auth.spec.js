import { describe, expect, it } from 'vitest'
import { decodeJwtPayload } from '../../src/auth.js'

const toBase64Url = (obj) =>
  Buffer.from(JSON.stringify(obj))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

describe('decodeJwtPayload', () => {
  it('decodes the payload of a Google ID token', () => {
    const token = `${toBase64Url({ alg: 'RS256' })}.${toBase64Url({ email: 'owner@example.com', sub: '1' })}.sig`
    expect(decodeJwtPayload(token)).toEqual({ email: 'owner@example.com', sub: '1' })
  })

  it('decodes non-ASCII payloads', () => {
    const token = `h.${toBase64Url({ name: '藤原史和' })}.s`
    expect(decodeJwtPayload(token).name).toBe('藤原史和')
  })
})
