<template>
  <div id="schedule">
    <div v-for="day in week" class="day">
      <!-- TODO: How should I filter out lunches? -->
      <Block v-for="block in createSchedule(day)" :block="block"></Block>
    </div>
  </div>
</template>
<script>
  
  import Block from './Block.vue'
  import schedule from './assets/schedule.json'
  import moment from 'moment'
  import _ from 'lodash'
  
  export default {
    components: { Block },
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
      }
    },
    methods: {
      createSchedule(day) {
        // TODO: Add the ability to set lunch for each day
        // TODO: Replace with custom schedule if it exists
        return schedule[day.format('dddd')].filter(row => {
          if (!row.lunch || row.lunch === 1) return row
        })
      },
      getCurrentBlock() {
        let now = moment()
        _.forEach(this.schedule, (row, i) => {
          let remaining, diff
          // For testing purposes, set date to this Monday
          let blockStartTime = moment(row.start, 'h:ma')
          let blockEndTime = moment(row.end, 'h:ma')
          // Countdown until the end of the current block
          if (now.isSameOrAfter(blockStartTime) && now.isBefore(blockEndTime)) {
            remaining = blockEndTime.diff(now)
            diff = moment.utc(remaining)
            this.beforeBlock = false
          }
          // Countdown until school begins
          else if (i === 0 && now.isBefore(blockStartTime)) {
            remaining = blockStartTime.diff(now)
            // Only if school starts in under an hour
            if (moment.duration(remaining, 'ms').asHours() <= 1) {
              diff = moment.utc(remaining)
            }
            this.beforeBlock = true
          }
          // Countdown until the next block (passing time)
          else if (now.isBefore(blockStartTime)) {
            remaining = blockStartTime.diff(now)
            diff = moment.utc(remaining)
            this.beforeBlock = true
          }
          // School is out for the day!
          else if (i === (this.state.schedule.length - 1) && now.isAfter(blockEndTime)) {
            this.message = 'School is out for the day :D'
          }
          if (!_.isUndefined(diff)) {
            this.countdown = (moment.duration(remaining, 'ms').asHours() >= 1) ? diff.format('h:mm:ss') : diff.format('m:ss')
            this.currentBlockIndex = i
            setTimeout(this.getCurrentBlock, 500)
            return
          }
        })
      }
    }
  }
  
</script>
<style lang="stylus">
  
  html, body
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    font-family: "Segoe UI", "San Francisco", "Helvetica Neue", "Helvetica", "Arial", sans-serif
    
  .day
    width: 200px
    margin-right: 10px
    float: left;
    
  .day:last-of-type
    margin-right: 0
  
</style>
