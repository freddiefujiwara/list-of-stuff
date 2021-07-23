<template>
  <section class="jumbotron text-center">
    <div class="container">
      <h1 class="jumbotron-heading">使ってる持ち物ほぼほぼすべて</h1>
      <a href="./">
        <img  class="card-img-top" src="https://room.r10s.jp/d/strg/ctrl/22/5835a77aaef28c009248b49b817968804c9e9603.03.9.22.3.png" id="port_photo_path" />
      </a>
    </div>
  </section>
  <div class="album py-5 bg-light">
    <button type="button" class="btn btn-sm btn-outline-secondary" @click="clear">
      Clear filter
    </button>
    <div class="container">
      <div class="row" id="row">
        <div class="col-md-4"
             v-for="(item) in items"
             :key=item.title
             >
             <Item
               :comment="item.comment"
               :genre  ="item.genre"
               :image  ="item.image"
               :price  ="item.price"
               :title  ="item.title"
               :unit   ="item.unit"
               :url    ="item.url"
               @filter="filter"
               />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import axios from 'axios'
import arrayShuffle from 'array-shuffle'
import Item from './components/Item.vue'
const api = "<API>"
let items;

export default {
  name: 'App',
  components: {
    Item
  },
  data () {
    return {
      items : null
    }
  },
  methods: {
    filter(genre) {
      this.items = items.filter(item => item.genre === genre)
    },
    clear(){
      this.items = items;
    }
  },
  async mounted () {
    items =
      arrayShuffle((await axios.get(api)).data)
    this.items = items;
  }
}
</script>
