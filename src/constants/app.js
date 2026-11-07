export const API_URL = import.meta.env.VITE_ITEMS_API || '<API>'
export const GOOGLE_CLIENT_ID =
  '728154182351-5ribj1diqcp8jpfo3rnqk9rei1aka98t.apps.googleusercontent.com'
export const FALLBACK_IMAGE_URL = 'https://tshop.r10s.jp/rukusu/cabinet/images/junbi.jpg'

// The hand-edited item sheets the admin manages. The room sheet is
// rewritten by the Rakuten ROOM sync and the subscriptions sheet stays
// sheet-edited, so neither appears here. Labels are the names the
// owner uses for each sheet.
export const SHEETS = [
  { key: 'workman', label: 'ワークマン' },
  { key: 'variety', label: 'ダイソー・100均' },
  { key: 'others', label: 'その他' },
]
