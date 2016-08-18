<style lang="stylus">
  
  @font-face
    font-family: Raleway
    font-style: normal
    src: url(assets/Raleway-ExtraLight.ttf)
    
  font-styling()
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", "Helvetica", "Arial", sans-serif
    font-size: 18px
    line-height: 18px
    color: white
    
  html, body
    width: 100%
    height: 100%
    margin: 0
    padding: 0
    background: #546E7A
    display: flex
    align-items: center
    justify-content: center
    overflow-x: hidden
    overflow-y: auto
    font-styling()
    
  .header
    width: 100%
    margin-bottom: 40px
    font-family: "Raleway"
    font-size: 56px
    text-align: center
    
  #schedule
    display: flex
    
    .dayContainer
      width: 180px
      margin-right: 10px
      flex-grow: 1
      display: flex
      flex-direction: column
      justify-content: space-between
      
      .dayHeader
        width: 100%
        padding: 6px 6px 8px 6px
        box-sizing: border-box
        align-self: flex-start
        text-align: center
        font-size: 18px
        
      .day
        width: 100%
        align-self: flex-end
        
        .blockContainer
          width: 100%
          float: left
          
          .beforeBlock
            width: 100%
            margin: calc(5px * 0.5 * 1.2) 0
            float: left
            
          .block
            width: 180px
            padding: 6px
            border-radius: 4px
            float: left
            box-sizing: border-box
            background: darkgray
            
            .blockHeader
              width: 100%
              height: 20px
              float: left
              display: flex
              flex-direction: row
              line-height: 20px
              
              .blockNum
                margin: 0
                flex-shrink: 1
                margin-right: 5px
                font-weight: bold
                
              .blockName
                flex-grow: 1
                font-weight: 300
                
                .lunch
                  text-decoration: underline
                  cursor: pointer
                  
              .blockInput
                width: 100%
                height: 20px
                margin: 0
                padding: 0
                flex-grow: 1
                border: none
                outline: none
                background: transparent
                font-styling()
                font-weight: 300
                line-height: 20px
                
              :focus
                border-bottom: 2px solid white
                
            .classTimes
              width: 100%
              margin-top: 2px
              float: left
              font-size: 12px
                
    :last-of-type
      margin-right: 0
      
    .countdown
      width: 100%
      margin: 2px 0
      float: left
      line-height: 24px
      font-size: 24px
      font-weight: 300
      
</style>
<template>
  <div id="container">
    <div class="header">BearTime</div>
    <div id="schedule">
      <div class="dayContainer" v-for="(day, i) in shared.week">
        <header class="dayHeader">{{ displayDate | dateText(i) }}</header>
        <div class="day">
          <div class="blockContainer" v-for="(block, j) in _schedule[day]">
            <div class="beforeBlock" v-if="j !== 0">
              <div class="countdown" v-if="block._id === _countdown._id && _countdown.before">
                {{ _countdown.text }}
              </div>
            </div>
            <div class="block" :style="{ minHeight: String(block.duration * shared.sizing) + 'px',
              background: shared.colors[block.number - 1] }">
              <header class="blockHeader">
                <span class="blockNum" v-if="block.number">{{ block.number }}</span>
                <span class="blockName" v-if="block.name && !block.lunch">{{ block.name }}</span>
                <span class="blockName" v-if="block.name && block.lunch">
                  <span class="lunch" @click="toggleLunch(day, block.lunch)"
                    title="Toggle Lunch">{{ block.lunch | lunchText }}</span> {{ block.name }}
                </span>
                <input class="blockInput" v-if="!block.name" v-model="shared.classes[block.number]"
                  :autofocus="i === 0 && block.number === 1 && !shared.classes[block.number]" />
              </header>
              <template v-if="!_countdown.before">
                <div class="countdown" v-if="block._id === _countdown._id">
                  {{ _countdown.text }}
                </div>
                <div class="classTimes" v-else v-if="block.duration >= 45">
                  {{ block.start }}-{{ block.end }}
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  
  import Vue from 'vue'
  import _merge from 'lodash/merge'
  import beartime from 'beartime-core'
  import moment from 'moment'
  
  // Map lunch number to the text version
  Vue.filter('lunchText', lunch => {
    return (lunch === 1) ? 'First' : 'Second'
  })
  // Return header text with day and date, corresponding to displayDate
  Vue.filter('dateText', (displayDate, i) => {
    return moment(displayDate).day(i + 1).format('dddd, M/D')
  })
  
  export default {
    data() {
      return {
        // Add all methods and data from beartime-core! Yay :D
        shared: beartime,
        // Check if client is crawler so it doesn't see a countdown in the title!
        isCrawler: /bot|googlebot|crawler|spider|robot|crawling/i.test(navigator.userAgent),
        // Set current time (as a UNIX timestamp to trigger countdown updates)
        // Moment date objects won't work!
        now: moment().valueOf(),
        // Set default date to determine week to display
        displayDate: moment().valueOf()
      }
    },
    watch: {
      // Update title of page with current time (a full old BearTime replacement!)
      '_countdown.text'() {
        if (this.isCrawler) return
        let text = this._countdown.text
        document.title = (text) ? `${text} \u2022 BearTime` : 'BearTime'
      },
      // Update prefs in localStorage when bindings change
      'shared.lunches': {
        handler() {
          this.updatePrefs('lunches')
        },
        deep: true
      },
      'shared.classes': {
        handler() {
          this.updatePrefs('classes')
        },
        deep: true
      }
    },
    mounted() {
      // Load saved class names and first/second lunch preferences for each day
      this.restorePrefs('lunches')
      this.restorePrefs('classes')
    },
    methods: {
      toggleLunch(day, oldLunch) {
        let newLunch = (oldLunch === 1) ? 2 : 1
        this.shared.lunches[day] = newLunch
      },
      updateTime() {
        // Set timer to update at the very next second
        setTimeout(() => {
          this.now = moment().valueOf()
        }, 1000 - moment().millisecond())
      },
      restorePrefs(key) {
        _merge(this.shared[key], JSON.parse(localStorage.getItem(key)) || {})
      },
      updatePrefs(key) {
        localStorage.setItem(key, JSON.stringify(this.shared[key]))
      }
    },
    computed: {
      _schedule() {
        // Generate schedules for each day based on Moment dates relative to the displayDate
        // Loop through Monday-Friday, setting each daily schedule in the weekly schedule
        let schedule = {}
        for (let i = 1; i < 6; i++) {
          let date = moment(this.displayDate).day(i)
          let day = date.format('dddd')
          schedule[day] = this.shared.getSchedule(date, this.shared.lunches)
        }
        return schedule
      },
      _countdown() {
        // Queue subsequent countdown update
        this.updateTime()
        // If today is the displayDate and a schedule exists for today,
        // update and show countdown (i.e., don't update if it's Saturday)
        let displayDate = moment(this.displayDate)
        let now = moment(this.now)
        let schedule = this._schedule[now.format('dddd')]
        return (displayDate.isSame(now, 'day') && schedule) ?
          this.shared.getCountdown(this.now, schedule) : { show: false }
      }
    }
  }
  
</script>
