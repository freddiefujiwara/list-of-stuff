<template>
  <main class="page">
    <header class="hero">
      <h1>ミニマリストの持ち物一覧</h1>
      <p class="lead">ジャンルを押すと絞り込み、再度押すと解除します。</p>
      <div class="chips">
        <button
          v-for="genre in genres"
          :key="genre"
          type="button"
          class="chip"
          :class="{ active: activeGenre === genre }"
          @click="filterByGenre(genre)"
        >
          {{ genre }}
        </button>
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
  return Array.from(new Set(allItems.value.map((item) => item.genre).filter(Boolean)))
})

const filterByGenre = (genre) => {
  activeGenre.value = activeGenre.value === genre ? '' : genre
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
  background: #f7f8fa;
  color: #0f172a;
}

.page {
  max-width: 1080px;
  margin: 0 auto;
  padding: 24px 12px 48px;
}

.hero {
  display: grid;
  gap: 10px;
}

h1 {
  margin: 0;
  font-size: 26px;
}

.lead {
  margin: 0;
  color: #475569;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  border: none;
  border-radius: 999px;
  padding: 8px 12px;
  background: #e2e8f0;
  color: #0f172a;
  cursor: pointer;
}

.chip.active {
  background: #0ea5e9;
  color: #f8fafc;
}

.content {
  margin-top: 20px;
}

.helper {
  text-align: center;
  color: #475569;
  padding: 20px;
}

.helper.error {
  color: #e11d48;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
}
</style>
