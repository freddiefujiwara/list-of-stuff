function shuffleItems(list) {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function filterByGenre(items, genre) {
  if (!genre) return items
  return items.filter((item) => item.genre === genre)
}

function formatYen(price) {
  if (typeof price !== 'number' || Number.isNaN(price)) return '0円'
  return `${price.toLocaleString('ja-JP')}円`
}

module.exports = {
  shuffleItems,
  filterByGenre,
  formatYen,
}
