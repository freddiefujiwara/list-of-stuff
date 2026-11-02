import { computed, onMounted, ref } from 'vue'
import { filterByGenre, shuffleItems } from '@/utils/items'
import { sortGenres } from '@/utils/genrePath'
import { ITEMS_CACHE_KEY } from '@/constants/app'

const readCachedItems = () => {
  try {
    const raw = localStorage.getItem(ITEMS_CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

const writeCachedItems = (items) => {
  try {
    localStorage.setItem(ITEMS_CACHE_KEY, JSON.stringify(items))
  } catch {
    // キャッシュ保存に失敗しても表示には影響させない
  }
}

export function useItems(apiUrl) {
  const allItems = ref([])
  const activeGenre = ref('')
  const loading = ref(true)
  const error = ref('')

  const genres = computed(() => {
    // タブの並びはアイテムの出現順に左右されないよう、固定順に並べ替える
    return sortGenres(Array.from(new Set(allItems.value.map((item) => item.genre).filter(Boolean))))
  })

  const genreCounts = computed(() => {
    return Object.fromEntries(
      genres.value.map((genre) => [
        genre,
        allItems.value.filter((item) => item.genre === genre).length,
      ])
    )
  })

  const filteredItems = computed(() => {
    return filterByGenre(allItems.value, activeGenre.value)
  })

  const totalCount = computed(() => allItems.value.length)

  const toggleGenre = (genre) => {
    activeGenre.value = activeGenre.value === genre ? '' : genre
  }

  const clearGenre = () => {
    activeGenre.value = ''
  }

  const loadItems = async () => {
    const cachedItems = readCachedItems()
    if (cachedItems) {
      allItems.value = shuffleItems(cachedItems)
      loading.value = false
    }
    try {
      const response = await fetch(apiUrl)
      const data = await response.json()
      allItems.value = shuffleItems(data)
      writeCachedItems(data)
    } catch (err) {
      if (!cachedItems) {
        error.value = 'データの取得に失敗しました。'
      }
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  onMounted(loadItems)

  return {
    activeGenre,
    clearGenre,
    error,
    filteredItems,
    genreCounts,
    genres,
    loading,
    toggleGenre,
    totalCount,
  }
}
