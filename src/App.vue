<style lang="stylus">
  
  html, body
    width: 100%
    height: 100%
    margin: 0
    padding: 0
  
  #schedule
    display: flex
    flex-direction: row
    align-items: flex-end
    
    .day
      width: 180px
      margin-right: 10px
      float: left
      
    .day:last-of-type
      margin-right: 0
      
    .countdown
      margin: 1px 0 2px 0
      float: left
      font-size: 24px
      font-weight: 300
      line-height: 24px
      
</style>
<template>
  <div id="schedule">
    <div v-for="day in week" class="day">
      <!-- TODO: How should I filter out lunches? -->
      <Block v-for="block in createSchedule(day)" :block="block"></Block>
        <header class="dayHeader">{{ now | dateText(day, i) }}</header>
              <div class="countdown" v-if="j === _countdown.index &&
                day === _countdown.day && _countdown.before">
                {{ _countdown.text }}
              </div>
                <span class="blockName" v-if="block.name && block.lunch">
                  <span class="lunch" @click="toggleLunch(day, block.lunch)"
                    title="Toggle Lunch">{{ block.lunch | lunchText }}</span> {{ block.name }}
                </span>
              <div class="countdown" v-if="j === _countdown.index &&
                day === _countdown.day && !_countdown.before">
                {{ _countdown.text }}
              </div>
    </div>
  </div>
</template>
<script>
  
  import schedule from './schedule.json'
  
  import _ from 'lodash'
  
  // Map lunch number to the text version
  Vue.filter('lunchText', (lunch) => {
    return (lunch === 1) ? 'First' : 'Second'
  })
  
  // Update date headers based current time, so they automatically change
  Vue.filter('dateText', (now, day, i) => {
    return `${day}, ${moment(now).day(i + 1).format('M/D')}`
  })
  
  export default {
    data() {
      return {
        // Define default lunches and classes schema so updates are faster/cached
        lunches: { 'Monday': 1, 'Tuesday': 1, 'Wednesday': 1, 'Thursday': 1, 'Friday': 1 },
        classes: { 1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 7: '' },
        isCrawler: /bot|googlebot|crawler|spider|robot|crawling/i.test(navigator.userAgent),
    watch: {
      // Update title of page with current time (a full old BearTime replacement!)
      '_countdown.text'() {
        if (this.isCrawler) return
        let text = this._countdown.text
        document.title = (text) ? `${text} \u2022 BearTime` : 'BearTime'
      },
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
      // Restore preferences
      this.restorePrefs('lunches')
      this.restorePrefs('classes')
    },
    methods: {
      toggleLunch(day, oldLunch) {
        let newLunch = (oldLunch === 1) ? 2 : 1
        this.lunches[day] = newLunch
      },
      updateTime() {
        // Set timer for subsequent update
        setTimeout(() => {
          this.now = moment().valueOf()
        }, 1000 - moment().millisecond())
      },
      restorePrefs(key) {
        _.merge(this[key], JSON.parse(localStorage.getItem(key)) || {})
      },
      updatePrefs(key) {
        localStorage.setItem(key, JSON.stringify(this[key]))
      }
    },
    computed: {
      _schedule() {
        // Create a new object for parsed scheduled so it doesn't mutate original
        let schedule = {}
        for (let day in this.schedule) {
          // Remove all blocks where the lunch isn't same the as set preference
          schedule[day] = this.schedule[day].filter(block => {
            // Keep block if lunch property doesn't exist or if lunch corresponds with the pref
            // Otherwise, return false and remove it
            return !block.lunch || (block.lunch === this.lunches[day])
          })
        }
        return schedule
      },
      _countdown() {
        let now = moment(this.now)
        let day = now.format('dddd')
        let schedule = this._schedule[day]
        // If it's Saturday or Sunday, don't show countdown timer
        if (_.isUndefined(schedule)) return { show: false }
        let countdown = {}
        let index = 0
        // Loop through all blocks, determining which is currently occuring
        // Then calculate the remaining duration
        for (let block of schedule) {
          let remaining, before
          let startTime = moment(block.start, 'h:ma')
          let endTime = moment(block.end, 'h:ma')
          // Countdown until the end of the current block
          if (now.isSameOrAfter(startTime) && now.isBefore(endTime)) {
            remaining = moment.duration(endTime.diff(now), 'ms')
            before = false
          }
          // Countdown until school begins if school starts in under 1 hour
          else if (index === 0 && now.isBefore(startTime.subtract(1, 'hour'))) {
            remaining = moment.duration(startTime.diff(now), 'ms')
            before = true
          }
          // Countdown until the next block (passing time)
          else if (now.isBefore(startTime)) {
            remaining = moment.duration(startTime.diff(now), 'ms')
            before = true
          }
          // Otherwise, simply check the next block
          else if (index < schedule.length - 1) {
            index++
            continue
          }
          // After we've checked every block to no avail, hide the countdown
          else {
            countdown = { show: false }
            break
          }
          // Create and return the countdown text
          countdown = {
            show: true,
            text: remaining.format('h:mm:ss'),
            index, before, day
          }
          break
        }
        this.updateTime()
        return countdown
      }
    }
  }
  
</script>
