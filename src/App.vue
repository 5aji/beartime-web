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
              <div class="countdown" v-if="j === _countdown.index &&
                day === _countdown.day && _countdown.before">
                {{ _countdown.text }}
              </div>
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
  
  export default {
    data() {
      // Create a Moment instance for each day of the current week
      // On Sunday at 12am, the schedule for the next week will be shown
      // TODO: Update this on Sunday at 12am, otherwise it's just static...
      let week = []
      for (let i = 1; i < 6; i++) {
        week.push(moment().day(i))
      }
      return {
        week,
        // TODO: Fix this!
        beforeBlock: false,
        countdown: '10:02',
        currentBlockIndex: 0
        // Define default lunches and classes schema so updates are faster/cached
        lunches: { 'Monday': 1, 'Tuesday': 1, 'Wednesday': 1, 'Thursday': 1, 'Friday': 1 },
        classes: { 1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 7: '' },
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
      createSchedule(day) {
        // TODO: Add the ability to set lunch for each day
        // TODO: Replace with custom schedule if it exists
        return schedule[day.format('dddd')].filter(row => {
          if (!row.lunch || row.lunch === 1) return row
        })
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
      },
      getCurrentBlock() {
        let now = moment()
        _.forEach(this.schedule, (row, i) => {
          let remaining, diff
          // For testing purposes, set date to this Monday
          let blockStartTime = moment(row.start, 'h:ma')
          let blockEndTime = moment(row.end, 'h:ma')
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
