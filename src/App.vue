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
    flex-align: center
    
  .header
    width: 100%
    margin-bottom: 30px
    font-weight: 100
    font-size: 64px
    line-height: 64px
    text-align: center
    -webkit-font-smoothing: antialiased
    
  .p
    width: 100%
    margin-bottom: 30px
    margin-top: 30px
    font-weight: 100
    text-align: center
    -webkit-font-smoothing: antialiased
    
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
          
  #week
    display: flex
    align-items: stretch
    justify-content: center
    flex-direction: row
    
    .day
      margin-right: 6px
      
    :last-of-type
      margin-right: 0
        
</style>
<template>
  <div id="container">
    <transition name="fade" mode="out-in">
      <div v-if="loading" id="loading">
        <div id="spinner"></div>
      </div>
      <div v-else id="schedule">
        <h1 class="header">BearTime</h1>
        <transition-group name="fade" tag="div" id="week" appear>
          <Day v-for="date in week" :date="date" :key="date" class="day"></Day>
        </transition-group>
        <p class="p">Created by Kincaid O'Neil and Saji Champlin</p>
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
        let url = `/api/week/${this.displayDate}`
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
              if (block.lunch) {
                block._id = (block.number) ? classId : lunchId 
              }
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
        let date = moment(this.displayDate)
        let week = []
        for (let i = 1; i < 6; i++) {
          let day = date.day(i).format('YYYY-MM-DD')
          week.push(day)
        }
        return week
      }
    }
  }
  
</script>
