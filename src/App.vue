<template>
  <main class="page">
    <header class="hero">
      <p class="eyebrow">Minimal gear list</p>
      <h1>使ってる持ち物ほぼほぼすべて</h1>
      <p class="lead">
        シンプルで使い切れるものだけを集めました。気になるジャンルをタップすると同じカテゴリで絞り込みます。
      </p>
      <div class="hero-actions">
        <div class="chips">
          <button
            v-for="genre in genres"
            :key="genre"
            type="button"
            class="button chip"
            :class="{ active: activeGenre === genre }"
            @click="filterByGenre(genre)"
          >
            {{ genre }}
          </button>
          <button
            v-if="activeGenre"
            type="button"
            class="button ghost"
            @click="clearFilter"
          >
            フィルターを解除 ({{ activeGenre }})
          </button>
        </div>
      </div>
    </header>

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
          @filter="filterByGenre"
        />
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import Item from '@/components/Item.vue'
import itemUtils from '@/utils/items'

const api = '<API>'
const allItems = ref([])
const activeGenre = ref('')
const loading = ref(true)
const error = ref('')

const { shuffleItems } = itemUtils

const filteredItems = computed(() => {
  if (!activeGenre.value) return allItems.value
  return allItems.value.filter((item) => item.genre === activeGenre.value)
})

const genres = computed(() => {
  const set = new Set()
  allItems.value.forEach((item) => {
    if (item?.genre) set.add(item.genre)
  })
  return Array.from(set)
})

const filterByGenre = (genre) => {
  activeGenre.value = genre
}

const clearFilter = () => {
  activeGenre.value = ''
}

onMounted(async () => {
  try {
    const response = await fetch(api)
    const data = await response.json()
    allItems.value = shuffleItems(data)
  } catch (err) {
    error.value = 'データの取得に失敗しました。'
    console.error(err)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
:global(body) {
  margin: 0;
  font-family: 'Inter', 'Noto Sans JP', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #0f172a;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 60%, #e2e8f0 100%);
}

.page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 16px 64px;
}

.hero {
  display: grid;
  gap: 12px;
  padding: 32px;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 12px 40px rgba(15, 23, 42, 0.08);
}

.eyebrow {
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 12px;
  color: #64748b;
  margin: 0;
}

h1 {
  margin: 0;
  font-size: 28px;
  letter-spacing: -0.02em;
}

.lead {
  margin: 0;
  color: #475569;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.button {
  border: none;
  border-radius: 12px;
  padding: 12px 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.button.ghost {
  background: #e2e8f0;
  color: #0f172a;
}

.button.ghost:hover {
  background: #cbd5e1;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.button.chip {
  background: #e0f2fe;
  color: #0ea5e9;
  padding: 10px 14px;
}

.button.chip.active {
  background: #0ea5e9;
  color: #f8fafc;
}

.content {
  margin-top: 24px;
}

.helper {
  text-align: center;
  color: #475569;
  padding: 24px;
}

.helper.error {
  color: #e11d48;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}
</style>
