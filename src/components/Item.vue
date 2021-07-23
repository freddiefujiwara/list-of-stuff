<template>
  <div class="card mb-4 box-shadow">
    <a style="text-decoration: none;color: #333;" v-bind:href="url" target="_blank">
      <p class="card-text">{{ title }}</p>
      <img class="card-img-top" v-bind:src="image" v-bind:alt="title">
    </a>
    <div class="card-body">
      <p class="card-text">{{ comment }}</p>
      <div class="d-flex justify-content-between align--center">
        <div class="btn-group">
          <button type="button" class="btn btn-sm btn-outline-secondary" @click="filter(genre)">
            {{ genre }}
          </button>
          <button type="button" class="btn btn-sm btn-outline-secondary" @click="clear">
            Clear filter
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
    image: String,
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
