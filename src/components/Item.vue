<template>
  <article class="card">
    <a :href="url" class="media" target="_blank" rel="noopener">
      <img
        :src="resolvedImage"
        :alt="title"
        loading="lazy"
        decoding="async"
        fetchpriority="low"
        @error="handleImageError"
      />
    </a>
    <div class="card-body">
      <div class="meta">
        <button type="button" class="chip" @click="emitFilter">
          {{ genre }}
        </button>
        <span class="price">{{ priceLabel }}</span>
      </div>
      <a :href="url" class="title" target="_blank" rel="noopener">{{ title }}</a>
      <p class="comment">{{ comment }}</p>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { FALLBACK_IMAGE_URL } from '@/constants/app'
import { formatYen } from '@/utils/items'
defineOptions({ name: 'GearItemCard' })

const props = defineProps({
  comment: String,
  genre: String,
  image: {
    type: String,
    default: FALLBACK_IMAGE_URL,
  },
  price: {
    type: Number,
    default: 0,
  },
  title: {
    type: String,
    default: '',
  },
  unit: Number,
  url: {
    type: String,
    default: '',
  },
})

const resolvedImage = computed(() => {
  const candidate = typeof props.image === 'string' ? props.image.trim() : ''
  return candidate ? candidate : FALLBACK_IMAGE_URL
})
const priceLabel = computed(() => formatYen(props.price))
const emit = defineEmits(['filter'])

const emitFilter = () => {
  emit('filter', props.genre)
}

const handleImageError = (event) => {
  if (!event || !event.target) return
  // prevent infinite loop if the fallback also fails
  if (event.target.dataset.errored) return
  event.target.dataset.errored = 'true'
  event.target.src = FALLBACK_IMAGE_URL
}
</script>

<style scoped>
.card {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(34, 29, 22, 0.06);
  overflow: hidden;
  display: grid;
  gap: 12px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  grid-template-rows: auto 1fr;
  height: 100%;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 36px rgba(34, 29, 22, 0.12);
}

.media {
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.media img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  display: block;
}

.card-body {
  padding: 0 16px 16px;
  display: grid;
  gap: 8px;
}

.meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chip {
  border: none;
  background: var(--accent-soft);
  color: var(--accent-strong);
  padding: 6px 12px;
  border-radius: 999px;
  font: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  touch-action: manipulation;
  transition: all 0.2s;
}

.chip:hover {
  background: var(--accent);
  color: #ffffff;
}

.price {
  font-weight: 700;
  color: var(--ink);
}

.title {
  font-size: 16px;
  font-weight: 700;
  color: var(--ink);
  text-decoration: none;
}

.title:hover {
  color: var(--accent);
  text-decoration: underline;
  text-underline-offset: 4px;
}

.comment {
  margin: 0;
  color: var(--ink-2);
  line-height: 1.7;
}
</style>
