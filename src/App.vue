<template>
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
         />
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
