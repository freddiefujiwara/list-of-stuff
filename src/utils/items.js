export function shuffleItems(list) {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function filterByGenre(items, genre) {
  if (!genre) return items
  return items.filter((item) => item.genre === genre)
}

export function formatGenreLabel(genre) {
  const match = /^【(.)】(.+)にまつわる物$/.exec(genre)
  if (!match) return genre
  return `${match[1]}・${match[2]}`
}

export function formatYen(price) {
  if (typeof price !== 'number' || Number.isNaN(price)) return '0円'
  return `${price.toLocaleString('ja-JP')}円`
}

// Rakuten's image servers resize on the fly via an _ex=WxH query, so a
// card thumbnail (a few hundred px wide) does not need the full-size
// product photo (often 1000px or more). URLs on other hosts, and URLs
// that already carry a query string, are returned unchanged.
export function rakutenThumbnailUrl(url, size = 400) {
  if (typeof url !== 'string') return url
  if (!/^https:\/\/(?:tshop|shop)\.r10s\.jp\//.test(url) || url.includes('?')) return url
  return `${url}?_ex=${size}x${size}`
}
