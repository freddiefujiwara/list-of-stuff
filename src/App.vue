<script setup>
import { computed, onMounted, ref } from 'vue'
import { FALLBACK_IMAGE_URL, GOOGLE_CLIENT_ID, SHEETS } from './constants/app.js'
import { useAdmin } from './composables/useAdmin.js'
import { emptyItem, formFromItem, itemMeta, shareLinkView, sheetLabel } from './utils/admin.js'
import { THEME_KEY, applyTheme, nextTheme, resolveTheme } from './theme.js'
import {
  formatShareExpiry,
  formatShareRemaining,
  shareSecondsLeft,
} from './share.js'

const admin = useAdmin()
const {
  phase,
  email,
  isShareSession,
  shareExpiresAt,
  currentSheet,
  items,
  listStatus,
  gateError,
} = admin

const tab = ref('list')
const themeButton = ref(null)
const theme = ref(resolveTheme(localStorage.getItem(THEME_KEY)))

const applyCurrentTheme = () => {
  applyTheme(document.documentElement, themeButton.value, theme.value)
}

const toggleTheme = () => {
  theme.value = nextTheme(theme.value)
  localStorage.setItem(THEME_KEY, theme.value)
  applyCurrentTheme()
}

const shareBanner = computed(() => {
  if (!isShareSession.value || !shareExpiresAt.value) {
    return ''
  }
  const remaining = formatShareRemaining(shareSecondsLeft(shareExpiresAt.value, Date.now()))
  return `一時アクセスリンクで利用中（${formatShareExpiry(shareExpiresAt.value)} まで有効、${remaining}）`
})

// --- Item form (登録 tab doubles as the edit form) ---
const form = ref(emptyItem())
const editingRow = ref(null)
const formStatus = ref('')
const saving = ref(false)

const openCreate = () => {
  editingRow.value = null
  form.value = emptyItem()
  formStatus.value = ''
  tab.value = 'form'
}

const openEdit = (item) => {
  editingRow.value = item.row
  form.value = formFromItem(item)
  formStatus.value = ''
  tab.value = 'form'
}

const cancelEdit = () => {
  editingRow.value = null
  form.value = emptyItem()
  formStatus.value = ''
  tab.value = 'list'
}

const submit = async () => {
  saving.value = true
  formStatus.value = ''
  try {
    const res =
      editingRow.value === null
        ? await admin.createItem({ ...form.value })
        : await admin.updateItem(editingRow.value, { ...form.value })
    if (res.ok) {
      editingRow.value = null
      form.value = emptyItem()
      tab.value = 'list'
    } else {
      formStatus.value = res.error || '保存に失敗しました'
    }
  } catch {
    formStatus.value = '保存に失敗しました'
  } finally {
    saving.value = false
  }
}

const remove = async (item) => {
  if (!window.confirm(`「${item.title}」を削除しますか？`)) {
    return
  }
  await admin.deleteItem(item.row)
}

const onThumbError = (event) => {
  const img = event.target
  if (img.src !== FALLBACK_IMAGE_URL) {
    img.src = FALLBACK_IMAGE_URL
  }
}

// --- Share link management (owner only, same as the alarm site) ---
const issuedShare = ref(null)
const shareError = ref('')

const shareView = computed(() =>
  shareLinkView(
    issuedShare.value,
    `${window.location.origin}${import.meta.env.BASE_URL}`,
    Date.now(),
  ),
)
const shareUrl = computed(() => shareView.value.url)
const shareRemaining = computed(() => shareView.value.remaining)
const shareExpires = computed(() => shareView.value.expires)

const issue = async () => {
  shareError.value = ''
  try {
    const res = await admin.issueShare()
    if (res.ok) {
      issuedShare.value = res
    } else {
      shareError.value = res.error || '発行に失敗しました'
    }
  } catch {
    shareError.value = '発行に失敗しました'
  }
}

const revoke = async () => {
  shareError.value = ''
  try {
    const res = await admin.revokeShare()
    if (res.ok) {
      issuedShare.value = null
    } else {
      shareError.value = res.error || '無効化に失敗しました'
    }
  } catch {
    shareError.value = '無効化に失敗しました'
  }
}

const copyShareUrl = async () => {
  try {
    await navigator.clipboard.writeText(shareUrl.value)
  } catch {
    shareError.value = 'コピーに失敗しました'
  }
}

const initGoogleSignIn = () => {
  if (!window.google?.accounts?.id) {
    return
  }
  window.google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: (response) => admin.onCredential(response.credential),
  })
  window.google.accounts.id.renderButton(document.getElementById('signin'), {
    theme: 'outline',
    size: 'large',
    text: 'signin_with',
  })
}

onMounted(async () => {
  applyCurrentTheme()
  if (await admin.initFromHash(window.location.hash)) {
    return
  }
  window.addEventListener('load', initGoogleSignIn, { once: true })
})

const onLogout = () => {
  issuedShare.value = null
  if (window.google?.accounts?.id) {
    window.google.accounts.id.disableAutoSelect()
  }
  admin.logout()
}
</script>

<template>
  <div class="layout">
    <header class="header">
      <h1>持ち物管理</h1>
      <div class="header-actions">
        <div class="header-buttons">
          <button ref="themeButton" class="theme-toggle" type="button" @click="toggleTheme">
            ライト
          </button>
          <button
            v-if="phase === 'ready' && !isShareSession"
            class="theme-toggle"
            type="button"
            @click="onLogout"
          >
            ログアウト
          </button>
        </div>
      </div>
    </header>
    <main>
      <nav v-if="phase === 'ready'" class="main-tabs" aria-label="画面切り替え">
        <button
          type="button"
          class="main-tab"
          :class="{ active: tab === 'list' }"
          :aria-selected="tab === 'list'"
          @click="tab = 'list'"
        >
          一覧
        </button>
        <button
          type="button"
          class="main-tab"
          :class="{ active: tab === 'form' }"
          :aria-selected="tab === 'form'"
          @click="openCreate"
        >
          登録
        </button>
        <button
          v-if="!isShareSession"
          type="button"
          class="main-tab"
          :class="{ active: tab === 'share' }"
          :aria-selected="tab === 'share'"
          @click="tab = 'share'"
        >
          共有
        </button>
      </nav>
      <div id="status"></div>

      <section v-if="phase === 'gate'" class="table-wrap auth-gate">
        <h2 class="section-title">Googleログインが必要です</h2>
        <p class="meta">許可されたアカウントでサインインしてください。</p>
        <div id="signin" class="google-login-button"></div>
        <p class="error">{{ gateError }}</p>
      </section>

      <section v-if="phase === 'share-expired'" class="table-wrap">
        <h2 class="section-title">リンクの有効期限が切れています</h2>
        <p class="meta">
          この一時アクセスリンクは失効しています。発行者に新しいリンクを依頼してください。
        </p>
      </section>

      <section v-if="phase === 'ready' && tab === 'list'" class="table-wrap">
        <div class="section-head">
          <h2 class="section-title">登録中のアイテム</h2>
          <button class="theme-toggle" type="button" @click="admin.loadItems()">再読み込み</button>
        </div>
        <p v-if="shareBanner" class="meta">{{ shareBanner }}</p>
        <p v-if="email" class="meta">{{ email }}</p>
        <div class="builder-tabs" role="tablist" aria-label="シート">
          <button
            v-for="sheet in SHEETS"
            :key="sheet.key"
            type="button"
            class="builder-tab"
            :class="{ active: currentSheet === sheet.key }"
            role="tab"
            :aria-selected="currentSheet === sheet.key"
            @click="admin.selectSheet(sheet.key)"
          >
            {{ sheet.label }}
          </button>
        </div>
        <div>
          <div v-for="item in items" :key="item.row" class="alarm-row">
            <div class="item-main">
              <img
                class="item-thumb"
                :src="item.image || FALLBACK_IMAGE_URL"
                alt=""
                loading="lazy"
                @error="onThumbError"
              />
              <div>
                <div class="item-title">{{ item.title }}</div>
                <div class="alarm-commands">{{ itemMeta(item) }}</div>
                <div v-if="item.url" class="alarm-commands">{{ item.url }}</div>
              </div>
            </div>
            <div class="row-actions">
              <button
                type="button"
                class="icon-btn"
                title="編集"
                aria-label="編集"
                @click="openEdit(item)"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
              </button>
              <button
                type="button"
                class="icon-btn"
                title="削除"
                aria-label="削除"
                @click="remove(item)"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
          </div>
        </div>
        <p class="meta">{{ listStatus }}</p>
      </section>

      <section v-if="phase === 'ready' && tab === 'form'" class="table-wrap">
        <h2 class="section-title">{{ editingRow === null ? '新しいアイテム' : 'アイテムを編集' }}</h2>
        <div v-if="editingRow === null" class="builder-tabs" role="tablist" aria-label="シート">
          <button
            v-for="sheet in SHEETS"
            :key="sheet.key"
            type="button"
            class="builder-tab"
            :class="{ active: currentSheet === sheet.key }"
            role="tab"
            :aria-selected="currentSheet === sheet.key"
            @click="admin.selectSheet(sheet.key)"
          >
            {{ sheet.label }}
          </button>
        </div>
        <p v-else class="meta">{{ sheetLabel(currentSheet) }}のアイテムを編集中</p>

        <label class="form-label" for="f-title">商品名</label>
        <input id="f-title" v-model="form.title" type="text" />
        <label class="form-label" for="f-image">画像URL</label>
        <input id="f-image" v-model="form.image" type="url" />
        <label class="form-label" for="f-url">商品URL</label>
        <input id="f-url" v-model="form.url" type="url" />
        <div class="field-row">
          <label>価格 <input v-model="form.price" type="number" min="0" /></label>
          <label>個数 <input v-model="form.unit" type="number" min="1" /></label>
        </div>
        <label class="form-label" for="f-genre">ジャンル</label>
        <input id="f-genre" v-model="form.genre" type="text" />
        <label class="form-label" for="f-comment">コメント</label>
        <textarea id="f-comment" v-model="form.comment" rows="3"></textarea>

        <div class="composer-row">
          <span class="meta">{{ formStatus }}</span>
          <span class="row-actions">
            <button v-if="editingRow !== null" class="theme-toggle" type="button" @click="cancelEdit">
              編集をやめる
            </button>
            <button class="post-button" type="button" :disabled="saving" @click="submit">
              {{ editingRow === null ? '登録する' : '更新する' }}
            </button>
          </span>
        </div>
      </section>

      <section v-if="phase === 'ready' && tab === 'share' && !isShareSession" class="table-wrap">
        <h2 class="section-title">一時アクセスリンク</h2>
        <p class="meta">
          ログイン不要で1か月間このページを使えるURLを発行します。新しいURLを発行すると、前のURLは無効になります。この画面を閉じると発行したURLは再表示できません。
        </p>
        <p class="error">{{ shareError }}</p>
        <div v-if="!issuedShare">
          <p>
            <button class="theme-toggle" type="button" @click="issue">
              1か月間有効なURLを発行
            </button>
          </p>
        </div>
        <div v-else>
          <p>
            <strong>{{ shareRemaining }}</strong>
            <span class="meta">（{{ shareExpires }} まで有効）</span>
          </p>
          <p>
            <input class="share-url-input" type="text" readonly aria-label="一時アクセスURL" :value="shareUrl" />
            <button class="theme-toggle" type="button" @click="copyShareUrl">URLをコピー</button>
          </p>
          <p>
            <button class="theme-toggle" type="button" @click="issue">新しいURLを発行し直す</button>
            <button class="theme-toggle" type="button" @click="revoke">今すぐ無効化する</button>
          </p>
        </div>
      </section>
    </main>
  </div>
</template>
