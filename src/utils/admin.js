import { SHEETS } from '../constants/app.js'
import {
  buildShareUrl,
  formatShareExpiry,
  formatShareRemaining,
  shareSecondsLeft,
} from '../share.js'

// A blank item form (create mode). Unit starts at 1, matching the
// sheet's convention for newly bought items.
export function emptyItem() {
  return {
    title: '',
    image: '',
    url: '',
    price: '',
    unit: 1,
    genre: '',
    comment: '',
  }
}

// The display label for a sheet key.
export function sheetLabel(key) {
  return SHEETS.find((sheet) => sheet.key === key)?.label ?? key
}

// "¥2,029" for a numeric price; "" for blank or non-numeric cells.
export function formatPrice(value) {
  if (value === null || value === undefined || String(value).trim() === '') {
    return ''
  }
  const digits = String(value).replace(/[^\d.-]/g, '')
  if (digits === '') {
    return ''
  }
  const n = Number(digits)
  if (!Number.isFinite(n)) {
    return ''
  }
  return `¥${Math.round(n).toLocaleString('en-US')}`
}

// The meta line under an item title: price (with unit when > 1),
// genre and comment, joined the way the sheet reads.
export function itemMeta(item) {
  const parts = []
  const price = formatPrice(item.price)
  if (price) {
    const unit = Number(item.unit)
    parts.push(Number.isFinite(unit) && unit > 1 ? `${price} ×${unit}` : price)
  }
  if (item.genre) {
    parts.push(String(item.genre))
  }
  if (item.comment) {
    parts.push(String(item.comment))
  }
  return parts.join(' / ')
}

// Copy a listed item into the edit form (price/unit become plain
// input values; blank stays blank).
export function formFromItem(item) {
  return {
    title: item.title ?? '',
    image: item.image ?? '',
    url: item.url ?? '',
    price: item.price ?? '',
    unit: item.unit ?? '',
    genre: item.genre ?? '',
    comment: item.comment ?? '',
  }
}

// The issued-share display values (URL, remaining time, expiry
// label); all blank before a link is issued.
export function shareLinkView(issued, baseUrl, nowMs) {
  if (!issued) {
    return { url: '', remaining: '', expires: '' }
  }
  return {
    url: buildShareUrl(baseUrl, issued.share_token),
    remaining: formatShareRemaining(shareSecondsLeft(issued.expires_at, nowMs)),
    expires: formatShareExpiry(issued.expires_at),
  }
}
