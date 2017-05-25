import Vue from 'vue'
import axios from 'axios'
import App from '@/components/App.vue'
import store from '@/store/'
import {mapActions, mapMutations} from 'vuex'

new Vue({
  store,
  el: '#app',
  render: h => h(App),
  async created() {
    this.goToday()
    // Show/hide week on load
    this.changeView()
    // When the window is resized, update media query automatically
    window.addEventListener('resize', this.changeView)
    // Collect special schedules; can't really do anything about an error anyways...
    const {data} = await axios.get('https://beartime-9facf.firebaseio.com/specials.json')
    this.SET_SPECIALS(data)
    this.SET_LOADING(false)
    this.updateWeek()
  },
  methods: {
    ...mapActions(['changeView', 'updateWeek', 'goToday']),
    ...mapMutations(['SET_LOADING', 'SET_SPECIALS'])
  }
})
