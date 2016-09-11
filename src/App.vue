<style lang="stylus">
  
  @import 'global'
  
  html, body
    width: 100%
    height: 100%
    margin: 0
    padding: 0
    background: #262626
    font-styling()
    
  #container
    width: 100%
    height: 100%
    display: flex
    flex-direction: column
    justify-content: center
    align-items: center
    
  .fade-enter-active, .fade-leave-active
    transition: all 0.3s
    
  .fade-enter, .fade-leave-active
    opacity: 0
    
  #loading
    width: 100%
    height: 100%
    display: flex
    align-items: center
    justify-content: center
    
    #spinner
      width: 80px
      height: 80px
      box-sizing: border-box
      border-radius: 50%
      border-bottom: 6px solid accentColor
      -webkit-animation: rotate 0.6s infinite linear
      animation: rotate 0.6s infinite linear
      
      @keyframes rotate
        from
          transform: rotate(0deg)
        to
          transform: rotate(360deg)
          
  #schedule
    display: flex
    justify-content: center
    align-items: center
    flex-direction: column
    
    h1
      width: 100%
      margin: 0 0 30px 0
      font-weight: 100
      font-size: 64px
      line-height: 100%
      text-align: center
      
    #week
      display: flex
      flex-direction: row
      justify-content: center
      align-items: space-between
      
    footer
      width: 100%
      margin: 30px 0 0 0
      text-align: center
      
</style>
<template>
  <div id="container">
    <transition name="fade" mode="out-in">
      <div v-if="loading" id="loading">
        <div id="spinner"></div>
      </div>
      <div v-else id="schedule">
        <h1>BearTime</h1>
        <transition-group name="fade" tag="div" id="week" appear>
          <Day v-for="date in week" :date="date" :key="date"></Day>
        </transition-group>
        <footer>Kincaid O'Neil &middot; Saji Champlin</footer>
      </div>
    </transition>
  </div>
</template>
<script>
  
  import Vue from 'vue'
  import VueResource from 'vue-resource'
  Vue.use(VueResource)
  
  import _uniqueId from 'lodash/uniqueId'
  import moment from 'moment'
  
  import store from './store'
  import Day from './Day.vue'
  
  export default {
    components: { Day },
    data: () => store,
    watch: {
      // Update prefs in localStorage when bindings change
      'lunches': {
        handler() {
          this.updatePrefs('lunches')
        },
        deep: true
      },
      'classes': {
        handler() {
          this.updatePrefs('classes')
        },
        deep: true
      }
    },
    mounted() {
      // Load initial schedule
      this.fetchSchedule()
    },
    methods: {
      updatePrefs(key) {
        localStorage.setItem(key, JSON.stringify(this[key]))
      },
      fetchSchedule() {
        this.loading = true
        // Fetch weekly schedule from API to cache
        let url = (this.displayDate === this.today) ? '/api/week' : `/api/week/${ this.displayDate }` 
        Vue.http.get(url, {
          timeout: 10000
        }).then(response => {
          let schedule = response.json()
          // Add a unique key to every block for animations
          // Lunches and A/B classes during lunch have the same ID
          for (let day in schedule) {
            let lunchId = _uniqueId()
            let classId = _uniqueId()
            for (let block of schedule[day]) {
              if (block.lunch) block._id = block.number ? classId : lunchId
              else block._id = _uniqueId()
            }
          }
          this.schedule = schedule
          this.loading = false
        })
      }
    },
    computed: {
      // Generate the week comprised of days YYYY-MM-DD
      week() {
        this.dimming = false
        let date = moment(this.displayDate)
        let week = []
        for (let i = 1; i < 6; i++) {
          let day = date.day(i).format('YYYY-MM-DD')
          week.push(day)
          // If one of the days is today, turn on dimming
          if (day === this.today) this.dimming = true
        }
        return week
      }
    }
  }
  
</script>
