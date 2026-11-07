export const API_URL = import.meta.env.VITE_ITEMS_API || '<API>'
export const GOOGLE_CLIENT_ID =
  '728154182351-5ribj1diqcp8jpfo3rnqk9rei1aka98t.apps.googleusercontent.com'
export const FALLBACK_IMAGE_URL = 'https://tshop.r10s.jp/rukusu/cabinet/images/junbi.jpg'

// The hand-edited sheets the admin manages. The room sheet is
// rewritten by the Rakuten ROOM sync, so it never appears here. The
// subscriptions sheet has a different column shape, marked by its
// kind. Labels are the names the owner uses for each sheet.
export const SHEETS = [
  { key: 'workman', label: 'ワークマン', kind: 'items' },
  { key: 'variety', label: 'ダイソー・100均', kind: 'items' },
  { key: 'others', label: 'その他', kind: 'items' },
  { key: 'subscriptions', label: 'サブスクリプション', kind: 'subscriptions' },
]

// The kind ('items' | 'subscriptions') of a sheet key.
export function sheetKind(key) {
  return SHEETS.find((sheet) => sheet.key === key)?.kind ?? 'items'
}
