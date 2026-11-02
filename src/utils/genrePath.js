// ジャンルとURLパス（スラッグ）の対応付け。
// ジャンル文字列の【】内の一字をキーに、共有用のパスを持たせる。
export const GENRE_SLUGS = {
  電: 'electronics',
  食: 'kitchen',
  住: 'living',
  衣: 'clothing',
  携: 'mobile',
  健: 'health',
}

const GENRE_MARK_PATTERN = /^【(.)】/

const basePrefix = (base) => (base.endsWith('/') ? base : `${base}/`)

// ジャンル文字列からスラッグを返す。対応表にないジャンルは null（パスを持たない）。
export function slugForGenre(genre) {
  const match = GENRE_MARK_PATTERN.exec(genre)
  if (!match) return null
  return GENRE_SLUGS[match[1]] ?? null
}

// スラッグからジャンル文字列を探す。見つからなければ ''（フィルタなし）。
export function genreForSlug(genres, slug) {
  if (!slug) return ''
  return genres.find((genre) => slugForGenre(genre) === slug) ?? ''
}

// パス名からスラッグを取り出す。ルートやベース外は ''。
export function slugFromPath(pathname, base = '/') {
  const prefix = basePrefix(base)
  if (!pathname.startsWith(prefix)) return ''
  return pathname.slice(prefix.length).replace(/\/$/, '')
}

// ジャンルに対応するパスを返す。パスを持たないジャンルと未選択はベースそのもの。
export function pathForGenre(genre, base = '/') {
  const prefix = basePrefix(base)
  const slug = slugForGenre(genre)
  return slug ? `${prefix}${slug}` : prefix
}

// ジャンルの固定表示順（GENRE_SLUGS の定義順）。
const GENRE_ORDER = Object.values(GENRE_SLUGS)

// ジャンル一覧を固定表示順に並べ替えた新しい配列を返す。
// 対応表にあるジャンルは定義順に、対応表にないジャンルは元の出現順のまま末尾に置く。
// 入力の並びが変わっても、同じジャンルの集合からは常に同じ並びが得られる。
export function sortGenres(genres) {
  const rank = (genre) => {
    const index = GENRE_ORDER.indexOf(slugForGenre(genre))
    return index === -1 ? GENRE_ORDER.length : index
  }
  return [...genres].sort((a, b) => rank(a) - rank(b))
}
