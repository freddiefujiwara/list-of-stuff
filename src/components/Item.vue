<template>
  <article class="card">
    <a :href="url" class="media" target="_blank" rel="noopener">
      <img
        :src="image || fallbackImage"
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
        <span class="price">{{ price.toLocaleString() }}円</span>
      </div>
      <a :href="url" class="title" target="_blank" rel="noopener">{{ title }}</a>
      <p class="comment">{{ comment }}</p>
    </div>
  </article>
</template>

<script setup>
defineOptions({ name: 'GearItemCard' })

const props = defineProps({
  comment: String,
  genre: String,
  image: {
    type: String,
    default: 'https://tshop.r10s.jp/rukusu/cabinet/images/junbi.jpg',
  },
  price: Number,
  title: String,
  unit: Number,
  url: String,
})

const fallbackImage = 'https://tshop.r10s.jp/rukusu/cabinet/images/junbi.jpg'
const emit = defineEmits(['filter'])

const emitFilter = () => {
  emit('filter', props.genre)
}

const handleImageError = (event) => {
  if (!event || !event.target) return
  // prevent infinite loop if the fallback also fails
  if (event.target.dataset.errored) return
  event.target.dataset.errored = 'true'
  event.target.src = fallbackImage
}
</script>

<style scoped>
.card {
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
  overflow: hidden;
  display: grid;
  gap: 12px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.12);
}

.media {
  display: flex;
  background: #f8fafc;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  padding: 12px;
  align-items: center;
  justify-content: center;
}

.media img {
  min-width: 0;
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
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
  background: #e0f2fe;
  color: #0ea5e9;
  padding: 6px 12px;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
}

.chip:hover {
  background: #bae6fd;
}

.price {
  font-weight: 700;
  color: #0f172a;
}

.title {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  text-decoration: none;
}

.title:hover {
  text-decoration: underline;
}

.comment {
  margin: 0;
  color: #475569;
  line-height: 1.5;
}
</style>
