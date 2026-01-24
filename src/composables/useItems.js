import { computed, onMounted, ref } from 'vue'
import { filterByGenre, shuffleItems } from '@/utils/items'

export function useItems(apiUrl) {
  const allItems = ref([])
  const activeGenre = ref('')
  const loading = ref(true)
  const error = ref('')

  const genres = computed(() => {
    return Array.from(new Set(allItems.value.map((item) => item.genre).filter(Boolean)))
  })

  const filteredItems = computed(() => {
    return filterByGenre(allItems.value, activeGenre.value)
  })

  const toggleGenre = (genre) => {
    activeGenre.value = activeGenre.value === genre ? '' : genre
  }

  const loadItems = async () => {
    try {
      const response = await fetch(apiUrl)
      const data = await response.json()
      allItems.value = shuffleItems(data)
    } catch (err) {
      error.value = 'データの取得に失敗しました。'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  onMounted(loadItems)

  return {
    activeGenre,
    error,
    filteredItems,
    genres,
    loading,
    toggleGenre,
  }
}
