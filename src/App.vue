<template>
  <div class="col-md-4"
       contenteditable="true"
       v-for="(item) in items"
       :key=item.title
       >
    <div class="card mb-4 box-shadow">
      <a style="text-decoration: none;color: #333;" href="{{ item.url }}" target="_blank">
        <p class="card-text">{{ item.title }}</p>
        <img class="card-img-top" src="{{ item.image }}" alt="Card image cap">
      </a>
      <div class="card-body">
        <p class="card-text">{{ item.comment }}</p>
        <div class="d-flex justify-content-between align-items-center">
          <div class="btn-group">
            <button type="button" class="btn btn-sm btn-outline-secondary" onclick="javascript:location.href=\'https://freddiefujiwara.com/list-of-stuff/?q=',
            ncodeURIComponent({{ item.genre }})
            ">
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
const api = "<API>"
export default {
  name: 'App',
  data () {
    return {
      items : null
    }
  },
  async mounted () {
    this.items =
      (await axios.get(api)).data
  }
}
</script>
