import Vue from 'vue'
import Vuex from 'vuex'
import defaultSchedules from '@/store/schedule.json'
import countdown from './modules/countdown.js'
import moment from 'moment'

Vue.use(Vuex)

const restorePrefs = (key, defaults = {}) => ({
  ...defaults, ...JSON.parse(window.localStorage.getItem(key))
})

const state = {
  // Design constants
  sizing: 1.4,
  colors: {
    1: '#3F51B5',
    2: '#1565C0',
    3: '#03A9F4',
    4: '#00ACC1',
    5: '#009688',
    6: '#43A047',
    7: '#7CB342'
  },
  // Check if client is crawler so it doesn't see a countdown in the title!
  isCrawler: /bot|googlebot|crawler|spider|robot|crawling/i.test(window.navigator.userAgent),
  // Display date is always set to a weekday as YYYY-MM-DD
  displayDate: null,
  // Restore saved preferences to overwrite default lunches and classes
  lunches: restorePrefs('lunches', {
    Monday: 1, Tuesday: 1, Wednesday: 1, Thursday: 1, Friday: 1
  }),
  classes: restorePrefs('classes', {
    1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 7: ''
  }),
  showWeek: false,
  loading: true,
  week: [],
  schedules: {},
  specialSchedules: {},
  defaultSchedules,
  countdown: {}
}

const mutations = {
  TOGGLE_LUNCH(state, date) {
    const day = moment(date).format('dddd')
    state.lunches[day] = (state.lunches[day] === 1) ? 2 : 1
    window.localStorage.setItem('lunches', JSON.stringify(state.lunches))
  },
  SET_CLASS(state, data) {
    state.classes[data.number] = data.text
    window.localStorage.setItem('classes', JSON.stringify(state.classes))
  },
  SET_LOADING(state, loading) {
    state.loading = loading
  },
  SET_SPECIALS(state, schedules) {
    state.specialSchedules = schedules
  },
  CHANGE_VIEW(state, payload) {
    state.showWeek = payload.showWeek
  },
  SET_DISPLAY_DATE(state, date) {
    state.displayDate = date.format('YYYY-MM-DD')
  },
  UPDATE_WEEK(state, week) {
    state.week = week
  },
  UPDATE_SCHEDULES(state, schedules) {
    state.schedules = schedules
  }
}

const actions = {
  // Show week if display is large (> 1000px), otherwise show only single day
  changeView({commit, dispatch}) {
    commit({
      type: 'CHANGE_VIEW',
      showWeek: window.matchMedia('(min-width: 1000px)').matches
    })
    dispatch('updateWeek')
  },
  // If in week view, advance week-by-week
  // If in day view, advance day-by-day
  goNext({state, commit, dispatch}) {
    const oldDate = moment(state.displayDate)
    let date
    if (state.showWeek) {
      // Set display date to Monday of next week
      date = oldDate.day(8)
    } else {
      // If it's Friday, add 3 days to current date; otherwise add just 1
      const diff = (oldDate.day() === 5) ? 3 : 1
      date = oldDate.add(diff, 'd')
    }
    commit('SET_DISPLAY_DATE', date)
    dispatch('updateWeek')
  },
  goPrevious({state, commit, dispatch}) {
    const oldDate = moment(state.displayDate)
    let date
    if (state.showWeek) {
      // Set display date to Friday of previous week
      date = oldDate.day(-2)
    } else {
      // If it's Monday, subtract 3 days from current date; otherwise just 1
      const diff = (oldDate.day() === 1) ? 3 : 1
      date = oldDate.subtract(diff, 'd')
    }
    commit('SET_DISPLAY_DATE', date)
    dispatch('updateWeek')
  },
  goToday({state, commit, dispatch}) {
    let date = moment()
    // If Saturday or Sunday, advance to following Monday
    // Otherwise, set to today
    if (date === 5) {
      date = date.day(8)
    } else if (date === 6) {
      date = date.day(1)
    }
    commit('SET_DISPLAY_DATE', date)
    dispatch('updateWeek')
  },
  toggleLunch({commit, dispatch}, date) {
    commit('TOGGLE_LUNCH', date)
    dispatch('updateSchedules', date)
  },
  updateWeek({state, commit, dispatch}) {
    const week = []
    if (state.showWeek) {
      for (let i = 1; i < 6; i++) {
        const date = moment(state.displayDate).day(i).format('YYYY-MM-DD')
        week.push(date)
      }
    } else {
      week.push(state.displayDate)
    }
    commit('UPDATE_WEEK', week)
    dispatch('updateSchedules')
  },
  updateSchedules({state, commit, dispatch}) {
    let schedules = {}
    for (let date of state.week) {
      const day = moment(date).format('dddd')
      let schedule = state.specialSchedules[date] || state.defaultSchedules[day]
      if (Array.isArray(schedule)) {
        // Remove all blocks where the lunch isn't same the as set preference
        schedule = schedule.filter(block => {
          return !block.lunch || (block.lunch === state.lunches[day])
        })
        // Add an offset/passing time to each block *after* eliminating unnecessary lunch blocks
        // Set the offset of the first block relative to an 8am start
        let i = 0, previousBlock = {end: moment('8:00am', 'h:ma')}
        for (let block of schedule) {
          // Add unique IDs to each block, with consistent IDs for
          // togglable lunches and classes
          if (block.lunch) {
            block.id = block.number ? `${date}-class` : `${date}-lunch`
          } else {
            block.id = `${date}-${i}`
          }
          // Set offest duration
          let start = moment(block.start, 'h:ma')
          let end = moment(previousBlock.end, 'h:ma')
          block.offset = moment.duration(start.diff(end)).as('m')
          previousBlock = block
          i++
        }
      }
      schedules[date] = schedule
    }
    commit('UPDATE_SCHEDULES', schedules)
    dispatch('countdown/refresh')
  }
}

const store = new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  state,
  mutations,
  actions,
  modules: {countdown}
})

export default store
