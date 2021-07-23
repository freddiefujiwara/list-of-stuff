<template>
  <div class="col-md-4"
       v-for="(item) in items"
       :key=item.title
       >
       <div class="card mb-4 box-shadow">
         <a style="text-decoration: none;color: #333;" v-bind:href="item.url" target="_blank">
           <p class="card-text">{{ item.title }}</p>
           <img class="card-img-top" v-bind:src="item.image" v-bind:alt="item.title">
         </a>
         <div class="card-body">
           <p class="card-text">{{ item.comment }}</p>
           <div class="d-flex justify-content-between align-items-center">
             <div class="btn-group">
               <button type="button" class="btn btn-sm btn-outline-secondary" @click="onClick(item.genre)">
                 {{ item.genre }}
               </button>
             </div>
             <small class="text-muted">{{ item.price }}円</small>
           </div>
         </div>
       </div>
  </div>
</template>

<script>
import axios from 'axios'
import arrayShuffle from 'array-shuffle'
const api = "<API>"
let items;
export default {
  name: 'App',
  data () {
    return {
      items : null
    }
  },
  methods: {
    onClick(genre) {
      console.log(genre)
      this.items = items.filter(item => item.genre === genre)
    }
  },
  async mounted () {
    items =
      arrayShuffle((await axios.get(api)).data)
    this.items = items;
  }
}
</script>
