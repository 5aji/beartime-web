<style lang="sass">
  
  html, body
    width: 100%
    height: 100%
    margin: 0
    padding: 0
    overflow-x: hidden
    overflow-y: hidden
    background: #2c383e
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif
    font-weight: 300
    font-size: 18px
    color: white
    // Fixes bug where spamming the advance/previous button highlighted all content
    user-select: none
    
  body
    overflow-x: hidden
    overflow-y: auto
    
  .container
    width: 100%
    padding: 15px
    box-sizing: border-box
    display: flex
    flex-flow: column
    justify-content: flex-start
    align-items: center
    
  .header
    height: 48px
    padding: 5px 0 10px 0
    flex-shrink: 1
    display: flex
    flex-direction: row
    justify-content: center
    align-items: center
    
  .title
    margin: 0 20px
    font-weight: 200
    font-size: 48px
    line-height: 48px
    text-align: center
    cursor: pointer
    
  .button
    width: 36px
    height: 36px
    cursor: pointer
    
  .week
    width: 100%
    max-width: 1550px
    display: flex
    flex-direction: row
    justify-content: center
    
  .fade-enter-active, .fade-leave-active
    transition: opacity 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)
    
  .fade-enter, .fade-leave-active
    opacity: 0
    
</style>
<template>
  <transition name="fade" mode="out-in" appear>
    <div class="container" v-if="!loading">
      <header class="header">
        <div class="button "@click="goPrevious()"
          :title="showWeek ? 'Previous week' : 'Previous day'">
          <svg fill="white" width="36" height="36" viewBox="0 0 24 24">
            <path d="M0 0h24v24H0z" fill="none" />
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
        </div>
        <h1 class="title" @click="goToday()"
          :title="showWeek ? 'View this week' : 'View today'">
          BearTime
        </h1>
        <div class="button "@click="goNext()"
          :title="showWeek ? 'Advance week' : 'Advance day'">
          <svg fill="white" width="36" height="36" viewBox="0 0 24 24">
            <path d="M0 0h24v24H0z" fill="none" />
            <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
          </svg>
        </div>
      </header>
      <div class="week">
        <Day v-for="date in week" :date="date" :key="date"></Day>
      </div>
    </div>
  </transition>
</template>
<script>
  
  import moment from 'moment'
  import 'moment-duration-format'
  
  import Day from '@/components/Day.vue'
  import {mapActions, mapState} from 'vuex'
  
  export default {
    components: {Day},
    methods: mapActions(['goPrevious', 'goToday', 'goNext']),
    computed: {
      ...mapState(['loading', 'isCrawler', 'showWeek', 'week'])
    }
  }
  
</script>
