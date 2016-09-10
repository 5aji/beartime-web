<style lang="stylus">
  
  @import 'global'
    
  .today
    width: 220px !important

  .notToday
    -webkit-filter: brightness(60%)
    filter: brightness(60%)
    
  .dayContainer
    width: 180px
    display: flex
    flex-direction: column
    justify-content: space-between
    
    .dayHeader
      width: 100%
      float: left
      text-align: center
      align-self: flex-start
      flex-grow: 1
      
    .day
      width: 100%
      align-self: flex-end
      
      .noSchool
        text-align: center
        font-size: 18px
        
      .list-move
        transition: transform 0.3s cubic-bezier(.55, 0, .1, 1)
        
      .blockContainer
        width: 100%
        margin-top: 6px
        display: flex
        flex-direction: row
        align-items: stretch
        
        .block 
          flex-grow: 1
          border-radius: 4px
          background: darkgray
          transition: all 0.3s
          
          .blockHeader
            width: calc(100% - 12px)
            height: 18px
            margin: 6px 6px 0 6px
            box-sizing: margin-box
            float: left
            flex-grow: 1
            display: flex
            flex-direction: row
            
            .blockNum
              margin: 0
              padding-right: 5px
              flex-shrink: 1
              font-weight: bold
              
            .blockName
              flex-grow: 1
              font-weight: 300
              
              .lunch
                text-decoration: underline
                cursor: pointer
                
            .blockInput
              width: 100%
              margin: 0
              padding: 0
              flex-grow: 1
              border: none
              outline: none
              background: transparent
              font-weight: 300
              font-styling()
              
            :focus
              margin: 0 0 -2px 0
              border-bottom: 2px solid white
              
        .classTimes
          width: calc(100% - 12px)
          float: left
          margin: 2px 6px 0 6px 
          font-size: 11px
          
      .countdown
        flex-basis: 80px
        flex-shrink: 0
        display: flex
        justify-content: center
        flex-direction: column
        align-items: center
        transition: all 0.3s
        
        .before
          text-transform: uppercase
          font-size: 12px
    
</style>
<template>
  <div class="dayContainer" :class="{ today: isToday, notToday: !isToday }">
    <header class="dayHeader">{{ dateText }}</header>
    <div class="day">
      <div class="noSchool" v-if="_schedule.length === 0">No School</div>
      <transition-group name="list" tag="div">
        <div class="blockContainer" v-for="block in _schedule" :key="block._id"
          :style="{height: String(block.duration * 1.2) + 'px'}">
          <div class="block" :style="{background: colors[block.number - 1]}">
            <header class="blockHeader" v-if="block.duration >= 20">
              <span class="blockNum" v-if="block.number">{{ block.number }}</span>
              <span class="blockName" v-if="block.name && !block.lunch">{{ block.name }}</span>
              <span class="blockName" v-if="block.name && block.lunch">
                <span class="lunch" @click="toggleLunch(date, block.lunch)"
                  title="Toggle Lunch">{{ block.lunch === 1 ? 'First' : 'Second' }}</span> Lunch
              </span>
              <input class="blockInput" v-if="!block.name" v-model="classes[block.number]"
                :autofocus="block._id === firstBlock && isDisplayDate && !classes[block.number]" />
            </header>
            <div class="classTimes" v-if="block.duration >= 45">
              {{ block.start }}-{{ block.end }}
            </div>
          </div>
          <transition name="fade" mode="in-out">
            <div class="countdown" v-if="block._id === countdown._id && block.duration >= 20">
              {{ countdown.text }}
              <span v-if="countdown.before" class="before">Passing</span>
            </div>
          </transition>
        </div>
      </transition-group>
    </div>
  </div>
</template>
<script>
  
  import _merge from 'lodash/merge'
  import _find from 'lodash/find'
  import moment from 'moment'
  import 'moment-duration-format'
  import store from './store'
  
  export default {
    props: ['date'],
    data: () => store,
    watch: {
      // Reset countdown when lunches are swapped, or the schedule is updated
      '_schedule'() {
        this.resetCountdown()
      }
    },
    mounted() {
      // If the day is the current day, run countdown
      if (this.isToday) this.getCountdown()
    },
    methods: {
      toggleLunch(date) {
        let day = moment(date, 'YYYY-MM-DD').format('dddd')
        this.lunches[day] = (this.lunches[day] === 1) ? 2 : 1
      },
      getCountdown() {
        let now = moment()
        // Update current date
        this.today = now.format('YYYY-MM-DD')
        // If a countdown is already in progress, simply increment it down
        // instead of doing a full refresh
        if (this.countdown.end) {
          let remaining = this.countdown.end - now.valueOf()
          if (remaining >= 0) {
            this.countdown = _merge(this.countdown, {
              text: moment.duration(remaining, 'ms').format('h:mm:ss')
            })
            // Update tab text when countdown updates
            this.updateTitle()
            // Queue next countdown refresh
            this.queueCountdown()
            return
          }
        }
        let displayDate = moment(this.displayDate, 'YYYY-MM-DD')
        // If today is the displayDate and a schedule exists for today,
        // try checking the subsequent block (i.e., don't update if it's Saturday)
        if (displayDate.isSame(now, 'day')) {
          for (let i = this.countdown.i; i < this._schedule.length; i++) {
            let block = this._schedule[i]
            let startTime = moment(block.start, 'h:ma')
            let endTime = moment(block.end, 'h:ma')
            // If countdown is more than an hour before school, check again later
            if (i === 0 && now.isBefore(startTime.clone().subtract(1, 'h'))) {
              this.queueCountdown()
              return
            }
            // Countdown until the next block: passing time or under 1 hour before school
            if (now.isBefore(endTime)) {
              let remaining, before, end
              if (now.isBefore(startTime)) {
                remaining = moment.duration(startTime.diff(now), 'ms')
                end = startTime.valueOf()
                before = true
              } else {
                remaining = moment.duration(endTime.diff(now), 'ms')
                end = endTime.valueOf()
                before = false
              }
              // Return updated countdown text
              let text = remaining.format('h:mm:ss')
              this.countdown = {
                _id: block._id,
                block, text, before, end, i
              }
              // Update tab text when countdown updates
              this.updateTitle()
              // Update countdown a hair after the next second
              this.queueCountdown()
              return
            }
            // Otherwise, check next block
            else continue
          }
        }
        // If the school day is over, reset the countdown--but don't queue it
        // changes to _schedule update it automatically
        this.countdown = { i: 0 }
      },
      // Queue subsequent countdown 20s after the next second
      queueCountdown() {
        this.queue = setTimeout(this.getCountdown, 1000 - moment().millisecond() + 20)
      },
      // Trigger full update of countdown by resetting queue and refreshing immediately
      resetCountdown() {
        clearTimeout(this.queue)
        this.countdown = { i: 0 }
        this.getCountdown()
      },
      // Update title of page with current time (a full old BearTime replacement!)
      // Only gets called after re-computing the countdown
      updateTitle() {
        let title, countdown = this.countdown.text, block = this.countdown.block
        if (countdown && !this.isCrawler) {
          // Determine whether the time remaining is before or during the current block
          let modifier = this.countdown.before ? 'until' : 'in'
          // Get text for current block
          // For example: saved class name, "Block 2", or "Advisory"
          let blockText = block.number ? (this.classes[block.number] || `Block ${block.number}`) : block.name
          // Put it all together for the title bar text!
          title = `${countdown} ${modifier} ${blockText} \u2022 BearTime`
        }
        document.title = title || 'BearTime'
      }
    },
    computed: {
      // Filter schedule based on lunches
      _schedule() {
        let schedule = []
        // Return a new object for parsed scheduled so it doesn't mutate original
        if (!this.loading) {
          let day = moment(this.date, 'YYYY-MM-DD').format('dddd')
          schedule = this.schedule[this.date].filter(block => {
            // Remove all blocks where the lunch isn't same the as set preference
            return !block.lunch || (block.lunch === this.lunches[day])
          })
        }
        return schedule
      },
      firstBlock() {
        for (let block of this._schedule) {
          if (block.number) return block._id
        }
      },
      isDisplayDate() {
        return this.date === this.displayDate
      },
      isToday() {
        return this.date === this.today
      },
      dateText() {
        return moment(this.date, 'YYYY-MM-DD').format('dddd, M/D')
      }
    }
  }
  
</script>
