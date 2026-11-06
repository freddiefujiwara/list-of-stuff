<template>
  <div>
    <nav class="site-nav">
      <a class="brand" href="https://freddiefujiwara.com/">藤原史和｜川口を歩くQAエンジニア</a>
      <ul>
        <li><a href="https://freddiefujiwara.com/" @click="trackNavClick('top')">トップ</a></li>
        <li><a href="https://freddiefujiwara.com/#about" @click="trackNavClick('about')">プロフィール</a></li>
        <li><a href="https://freddiefujiwara.com/#activity" @click="trackNavClick('activity')">活動・発信</a></li>
        <li><a href="https://freddiefujiwara.com/#contact" @click="trackNavClick('contact')">情報交換</a></li>
        <li><a href="https://freddiefujiwara.com/blog/" @click="trackNavClick('blog')">ブログ</a></li>
        <li>
          <a href="https://freddiefujiwara.com/list-of-stuff/" class="active" aria-current="page" @click="trackNavClick('list')">持ち物</a>
        </li>
      </ul>
    </nav>

    <header class="hero">
      <a class="hero-inner" :href="base" @click.prevent="handleClearGenre">
        <p class="hero-place">KAWAGUCHI — LIST OF STUFF</p>
        <h1>
          <span class="h1-name">藤原史和</span><span class="h1-sep" aria-hidden="true">｜</span
          ><span class="h1-role">川口を歩くQAエンジニア</span>
        </h1>
      </a>
    </header>

    <main class="page">
      <p v-show="!loading && !error" class="items-stats">全{{ totalCount }}点</p>

      <div class="genre-filter">
        <button
          v-for="genre in genres"
          :key="genre"
          type="button"
          class="genre-link"
          :class="{ active: activeGenre === genre }"
          @click="handleToggleGenre(genre)"
        >
          <span class="genre-label">{{ formatGenreLabel(genre) }}</span
          ><span class="genre-count">{{ genreCounts[genre] }}</span>
        </button>
        <button v-show="activeGenre" type="button" class="btn-clear-filter" @click="handleClearGenre">
          フィルタを外す
        </button>
      </div>

      <section class="content">
        <p v-if="loading" class="helper">読み込み中です…</p>
        <p v-else-if="error" class="helper error">{{ error }}</p>
        <div v-else class="grid">
          <Item
            v-for="(item, index) in visibleItems"
            :key="item.title"
            :comment="item.comment"
            :eager="index < 8"
            :genre="item.genre"
            :image="item.image"
            :price="item.price"
            :title="item.title"
            :unit="item.unit"
            :url="item.url"
            @filter="handleToggleGenre"
          />
        </div>
        <div v-show="hasMore" :ref="setSentinel" class="load-more-sentinel" aria-hidden="true"></div>
      </section>

      <div class="footer-link">
        <a href="#" @click.prevent="scrollToTop">トップへ戻る</a>
        &nbsp;|&nbsp;
        <a
          href="#"
          class="copy-link"
          :class="{ disabled: loading }"
          @click.prevent="copyToClipboard"
          >{{ showCopyMessage ? 'コピー完了' : 'コピー' }}</a
        >
      </div>

      <footer class="site-footer">
        <div class="foot-links">
          <a href="https://freddiefujiwara.com/">トップ <span class="arr">↗</span></a>
          <a href="https://freddiefujiwara.com/blog/">ブログ <span class="arr">↗</span></a>
          <a href="https://freddiefujiwara.com/list-of-stuff/">持ち物 <span class="arr">↗</span></a>
          <a href="https://www.instagram.com/freddiefujiwara" target="_blank" rel="noopener">Instagram <span class="arr">↗</span></a>
          <a href="https://www.facebook.com/freddiefujiwara" target="_blank" rel="noopener">Facebook <span class="arr">↗</span></a>
          <a href="https://www.google.com/maps/contrib/105456242747265663411/reviews" target="_blank" rel="noopener">Googleマップの口コミ <span class="arr">↗</span></a>
          <a href="https://review.travel.rakuten.co.jp/reviewer/fumikazufujiwara" target="_blank" rel="noopener">楽天トラベルの口コミ <span class="arr">↗</span></a>
          <a href="https://tabelog.com/rvwr/zegenvs/" target="_blank" rel="noopener">食べログの口コミ <span class="arr">↗</span></a>
          <a href="https://retty.me/user/50281/" target="_blank" rel="noopener">Rettyの口コミ <span class="arr">↗</span></a>
          <a href="https://x.com/freddiefujiwara" target="_blank" rel="noopener">X <span class="arr">↗</span></a>
          <a href="https://github.com/freddiefujiwara" target="_blank" rel="noopener">GitHub <span class="arr">↗</span></a>
          <a href="https://linkedin.com/in/freddiefujiwara" target="_blank" rel="noopener">LinkedIn <span class="arr">↗</span></a>
          <a href="https://youtrust.jp/users/freddiefujiwara" target="_blank" rel="noopener">YOUTRUST <span class="arr">↗</span></a>
          <a href="https://fril.jp/shop/freddiefujiwara" target="_blank" rel="noopener">ラクマ <span class="arr">↗</span></a>
        </div>
        <p class="copy">© {{ year }} 藤原史和（Fumikazu Fujiwara）— freddiefujiwara.com</p>
      </footer>
    </main>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import Item from '@/components/Item.vue'
import { API_URL } from '@/constants/app'
import { useItems } from '@/composables/useItems'
import { formatGenreLabel } from '@/utils/items'
import { genreForSlug, pathForGenre, slugFromPath } from '@/utils/genrePath'
import { trackPageView, trackNavClick } from '@/analytics'

const {
  activeGenre,
  clearGenre,
  error,
  filteredItems,
  genreCounts,
  genres,
  hasMore,
  loading,
  loadMore,
  toggleGenre,
  totalCount,
  visibleItems,
} = useItems(API_URL)

// ジャンルフィルタとURLパスを同期する（共有用URL）。
// パスを持つジャンルは /list-of-stuff/<slug>、それ以外と未選択はベースに戻す。
const base = import.meta.env.BASE_URL

const syncUrl = () => {
  const path = pathForGenre(activeGenre.value, base)
  if (window.location.pathname !== path) {
    window.history.pushState(null, '', path)
    trackPageView(path)
  }
}

const handleToggleGenre = (genre) => {
  toggleGenre(genre)
  syncUrl()
}

const handleClearGenre = () => {
  clearGenre()
  syncUrl()
}

// URL側のパスをフィルタに反映する（履歴は積まない）。
const applyPathToFilter = () => {
  const genre = genreForSlug(genres.value, slugFromPath(window.location.pathname, base))
  if (genre === activeGenre.value) return
  if (genre) {
    toggleGenre(genre)
  } else {
    clearGenre()
  }
}

// 初回はデータ読み込みでジャンルが揃った時点で、パスのフィルタを一度だけ適用する。
const stopInitialApply = watch(genres, (list) => {
  if (!list.length) return
  applyPathToFilter()
  stopInitialApply()
})

const handlePopState = () => {
  applyPathToFilter()
  trackPageView(window.location.pathname)
}

onMounted(() => {
  trackPageView(window.location.pathname)
  window.addEventListener('popstate', handlePopState)
})

onUnmounted(() => {
  window.removeEventListener('popstate', handlePopState)
})

// Grow the rendered page when the sentinel below the grid approaches
// the viewport, so the initial render stays small. The sentinel is
// always in the DOM (hidden while nothing remains) because a hidden
// element never intersects; its callback ref runs during the initial
// patch, before the mounted hook below starts observing it.
let loadMoreObserver = null
let sentinelEl = null

const setSentinel = (el) => {
  sentinelEl = el
}

onMounted(() => {
  if (typeof IntersectionObserver === 'undefined') return
  loadMoreObserver = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) loadMore()
    },
    { rootMargin: '600px' },
  )
  loadMoreObserver.observe(sentinelEl)
})

onUnmounted(() => {
  loadMoreObserver?.disconnect()
})

const year = new Date().getFullYear()

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const showCopyMessage = ref(false)
const copyToClipboard = async () => {
  try {
    const dataToCopy = filteredItems.value.map(({ image, url, ...rest }) => rest)
    const json = JSON.stringify(dataToCopy, null, 2)
    await navigator.clipboard.writeText(json)
    showCopyMessage.value = true
    setTimeout(() => {
      showCopyMessage.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}
</script>

<style scoped>
:global(:root) {
  --bg: #fbfaf7;
  --surface: #ffffff;
  --ink: #221d16;
  --ink-2: #5d5546;
  --ink-3: #8a8071;
  --line: #e3ddd0;
  --accent: #b23a1f;
  --accent-strong: #8f2a12;
  --accent-soft: #f7e9e2;
  --error: #b91c1c;
  color-scheme: light dark;
}

@media (prefers-color-scheme: dark) {
  :global(:root) {
    --bg: #17140f;
    --surface: #211c15;
    --ink: #f2ecdf;
    --ink-2: #c2b8a4;
    --ink-3: #948a77;
    --line: #3a332a;
    --accent: #ec7a52;
    --accent-strong: #f0936f;
    --accent-soft: #33231b;
    --error: #fca5a5;
  }
}

:global(*) {
  /* 幅計算の基準をブログ／トップと揃える（padding を幅に含める） */
  box-sizing: border-box;
}

:global(html) {
  /* スクロールバーの有無で本文幅が変わらないよう、溝を常時確保する */
  scrollbar-gutter: stable;
}

:global(body) {
  margin: 0;
  font-family: 'Zen Kaku Gothic New', 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', 'Yu Gothic', sans-serif;
  line-height: 1.85;
  background: var(--bg);
  color: var(--ink);
  -webkit-font-smoothing: antialiased;
  -webkit-text-size-adjust: 100%;
  touch-action: manipulation;
}

.site-nav {
  position: sticky;
  top: 0;
  z-index: 50;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 0 clamp(16px, 4vw, 40px);
  height: 56px;
  background: color-mix(in srgb, var(--bg) 86%, transparent);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--line);
}

.site-nav .brand {
  justify-self: start;
  font-family: 'Shippori Mincho B1', 'Hiragino Mincho ProN', 'Yu Mincho', serif;
  font-weight: 700;
  font-size: 15px;
  color: var(--ink);
  letter-spacing: 0.04em;
  white-space: nowrap;
  text-decoration: none;
}

.site-nav ul {
  justify-self: center;
  display: flex;
  gap: clamp(14px, 3vw, 30px);
  list-style: none;
  margin: 0;
  padding: 0;
}

.site-nav ul a {
  color: var(--ink-2);
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: 0.05em;
  padding: 4px 0;
  border-bottom: 2px solid transparent;
  white-space: nowrap;
  text-decoration: none;
}

.site-nav ul a:hover {
  color: var(--ink);
}

.site-nav ul a.active {
  color: var(--accent);
  border-bottom-color: var(--accent);
}

@media (max-width: 560px) {
  .site-nav {
    grid-template-columns: 1fr;
  }

  .site-nav .brand {
    display: none;
  }

  .site-nav ul {
    justify-self: stretch;
    width: 100%;
    justify-content: space-between;
    gap: 6px;
  }

  .site-nav ul a {
    font-size: 12px;
    letter-spacing: 0.02em;
  }
}

.page {
  max-width: 1080px;
  margin: 0 auto;
  padding: 28px 20px 56px;
}

.hero {
  position: relative;
  display: flex;
  align-items: flex-end;
  min-height: 300px;
  color: #fdfbf7;
  overflow: hidden;
  background: #241a12 url('https://freddiefujiwara.com/assets/hero-koinobori.jpg') center 38% / cover
    no-repeat;
}

.hero::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(16, 11, 6, 0.88) 0%,
    rgba(16, 11, 6, 0.45) 45%,
    rgba(16, 11, 6, 0.15) 75%
  );
}

.hero-inner {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 820px;
  margin: 0 auto;
  padding: 96px 20px 36px;
}

a.hero-inner {
  color: inherit;
  text-decoration: none;
  cursor: pointer;
}

.hero-place {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  letter-spacing: 0.22em;
  font-weight: 700;
  margin: 0 0 14px;
}

.hero-place::before {
  content: '';
  width: 34px;
  height: 2px;
  background: #f0764f;
}

.hero h1 {
  margin: 0;
  font-family: 'Shippori Mincho B1', 'Hiragino Mincho ProN', 'Yu Mincho', serif;
  font-weight: 800;
  letter-spacing: 0.03em;
  line-height: 1.35;
}

.hero h1 .h1-sep {
  display: none;
}

.hero h1 .h1-name {
  display: block;
  font-size: clamp(2rem, 6vw, 2.9rem);
}

.hero h1 .h1-role {
  display: block;
  font-size: clamp(1.05rem, 3.4vw, 1.45rem);
  font-weight: 700;
  letter-spacing: 0.06em;
  margin-top: 10px;
}

.items-stats {
  margin: 0 0 10px;
  font-size: 0.85rem;
  color: var(--ink-3);
}

.genre-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 20px;
  align-items: baseline;
}

.genre-link {
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  padding: 4px 0;
  color: var(--ink-2);
  font: inherit;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.05em;
  line-height: 1.5;
  cursor: pointer;
  transition: color 0.2s;
}

.genre-link:hover {
  color: var(--ink);
}

.genre-link.active {
  color: var(--accent);
  font-weight: 700;
  border-bottom-color: var(--accent);
}

.genre-count {
  margin-left: 4px;
  font-size: 11px;
  font-weight: 400;
  letter-spacing: 0;
  color: var(--ink-3);
}

.genre-link.active .genre-count {
  color: var(--accent);
}

.btn-clear-filter {
  margin-left: auto;
  background: none;
  border: none;
  padding: 4px 0;
  color: var(--ink-3);
  font: inherit;
  font-size: 12.5px;
  line-height: 1.5;
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
}

.btn-clear-filter:hover {
  color: var(--accent);
}

.footer-link {
  margin-top: 48px;
  padding-top: 20px;
  border-top: 1px solid var(--line);
  color: var(--ink-2);
  font-size: 0.9rem;
}

.footer-link a {
  color: var(--accent);
  text-decoration: none;
}

.footer-link a:hover {
  text-decoration: underline;
}

.copy-link {
  cursor: pointer;
}

.copy-link.disabled {
  opacity: 0.5;
  cursor: default;
  pointer-events: none;
}

.content {
  margin-top: 20px;
}

.helper {
  text-align: center;
  color: var(--ink-2);
  padding: 20px;
}

.helper.error {
  color: var(--error);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
}

.load-more-sentinel {
  height: 1px;
}

.site-footer {
  margin-top: 56px;
  padding-top: 24px;
  border-top: 1px solid var(--line);
}

.site-footer .foot-links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 22px;
  margin-bottom: 14px;
}

.site-footer .foot-links a {
  color: var(--ink-2);
  text-decoration: none;
  font-size: 0.92rem;
}

.site-footer .foot-links a:hover {
  color: var(--accent);
}

.site-footer .copy {
  color: var(--ink-2);
  font-size: 0.85rem;
  margin: 0;
}
</style>
