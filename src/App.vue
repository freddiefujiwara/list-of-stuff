<template>
  <div>
    <nav class="site-nav">
      <a class="brand" href="https://freddiefujiwara.com/">藤原史和｜川口を歩くQAエンジニア</a>
      <ul>
        <li><a href="https://freddiefujiwara.com/#about">プロフィール</a></li>
        <li><a href="https://freddiefujiwara.com/#activity">活動・発信</a></li>
        <li><a href="https://freddiefujiwara.com/#contact">情報交換</a></li>
        <li><a href="https://freddiefujiwara.com/blog/">ブログ</a></li>
        <li>
          <a href="https://freddiefujiwara.com/list-of-stuff/" class="active" aria-current="page">持ち物</a>
        </li>
      </ul>
    </nav>

    <header class="hero">
      <div class="hero-inner">
        <p class="hero-place">KAWAGUCHI — LIST OF STUFF</p>
        <h1>
          <span class="h1-name">藤原史和</span><span class="h1-sep" aria-hidden="true">｜</span
          ><span class="h1-role">川口を歩くQAエンジニア</span>
        </h1>
        <p v-show="!loading && !error" class="hero-stats">全{{ totalCount }}点</p>
      </div>
    </header>

    <main class="page">
      <div class="chips">
        <button
          v-for="genre in genres"
          :key="genre"
          type="button"
          class="chip"
          :class="{ active: activeGenre === genre }"
          @click="toggleGenre(genre)"
        >
          {{ genre }}
        </button>
        <button
          v-show="activeGenre"
          type="button"
          class="btn-clear-filter"
          @click="clearGenre"
        >
          フィルタを外す
        </button>
      </div>

      <section class="content">
        <p v-if="loading" class="helper">読み込み中です…</p>
        <p v-else-if="error" class="helper error">{{ error }}</p>
        <div v-else class="grid">
          <Item
            v-for="item in filteredItems"
            :key="item.title"
            :comment="item.comment"
            :genre="item.genre"
            :image="item.image"
            :price="item.price"
            :title="item.title"
            :unit="item.unit"
            :url="item.url"
            @filter="toggleGenre"
          />
        </div>
      </section>

      <footer class="site-footer">
        <div class="foot-links">
          <a href="https://freddiefujiwara.com/" target="_blank" rel="noopener">トップ <span class="arr">↗</span></a>
          <a href="https://freddiefujiwara.com/blog/" target="_blank" rel="noopener">ブログ <span class="arr">↗</span></a>
        </div>
        <div class="foot-actions">
          <button type="button" class="btn-copy" :disabled="loading" @click="copyToClipboard">
            {{ showCopyMessage ? 'コピー完了' : 'コピー' }}
          </button>
        </div>
        <p class="copy">© {{ year }} 藤原史和（Fumikazu Fujiwara）— freddiefujiwara.com</p>
      </footer>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Item from '@/components/Item.vue'
import { API_URL } from '@/constants/app'
import { useItems } from '@/composables/useItems'

const { activeGenre, clearGenre, error, filteredItems, genres, loading, toggleGenre, totalCount } =
  useItems(API_URL)

const year = new Date().getFullYear()

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
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 clamp(16px, 4vw, 40px);
  height: 56px;
  background: color-mix(in srgb, var(--bg) 86%, transparent);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--line);
}

.site-nav .brand {
  font-family: 'Shippori Mincho B1', 'Hiragino Mincho ProN', 'Yu Mincho', serif;
  font-weight: 700;
  font-size: 15px;
  color: var(--ink);
  letter-spacing: 0.04em;
  white-space: nowrap;
  text-decoration: none;
}

.site-nav ul {
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
    justify-content: center;
  }

  .site-nav .brand {
    display: none;
  }

  .site-nav ul {
    width: 100%;
    justify-content: space-between;
    gap: 8px;
  }

  .site-nav ul a {
    font-size: 13px;
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

.hero-stats {
  margin: 12px 0 0;
  font-size: 0.95rem;
  color: rgba(253, 251, 247, 0.85);
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip,
.btn-clear-filter {
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 8px 14px;
  background: var(--surface);
  color: var(--ink);
  font: inherit;
  cursor: pointer;
  transition: all 0.2s;
}

.chip:hover,
.btn-clear-filter:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.chip.active {
  background: var(--accent);
  border-color: var(--accent);
  color: #ffffff;
}

.chip.active:hover {
  background: var(--accent-strong);
  border-color: var(--accent-strong);
  color: #ffffff;
}

.btn-copy {
  border: 1px solid var(--accent);
  border-radius: 999px;
  padding: 8px 14px;
  background: transparent;
  color: var(--accent);
  cursor: pointer;
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-copy:hover:not(:disabled) {
  background: var(--accent);
  color: #ffffff;
}

.btn-copy:disabled {
  border-color: var(--line);
  color: var(--ink-3);
  cursor: not-allowed;
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

.site-footer .foot-actions {
  margin-bottom: 14px;
}

.site-footer .copy {
  color: var(--ink-2);
  font-size: 0.85rem;
  margin: 0;
}
</style>
