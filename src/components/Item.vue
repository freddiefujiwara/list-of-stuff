<template>
  <div class="card mb-4 box-shadow">
    <a style="text-decoration: none;color: #333;" :href="url" target="_blank">
      <p class="card-text">{{ title }}</p>
      <img class="card-img-top" :src="image" :alt="title">
    </a>
    <div class="card-body">
      <p class="card-text">{{ comment }}</p>
      <div class="d-flex justify-content-between align--center">
        <div class="btn-group">
          <button type="button" class="btn btn-sm btn-outline-secondary" @click="filter(genre)">
            {{ genre }}
          </button>
        </div>
        <small class="text-muted">{{ price }}円</small>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'Item',
  props: {
    comment: String,
    genre: String,
    image: {
      type: String,
      default: "https://tshop.r10s.jp/rukusu/cabinet/images/junbi.jpg"
    },
    price: Number,
    title: String,
    unit: Number,
    url: String
  },
  methods: {
    filter(genre) {
      this.$emit('filter',genre)
    }
  }
}
</script>
