import Vue from 'vue'
import moment from 'moment'
import 'moment-duration-format'

const mutations = {
  UPDATE(state, payload) {
    if (!payload.queue) {
      // Clear any existing update queue
      clearTimeout(state.queue)
    } else {
      // Update queue (a setTimeout ID) if it was sent
      state.queue = payload.queue
    }
    // Update all metadata about countdown: text, remaining time,
    // before/after class, etc.
    state.data = payload.data || {}
  }
}

const actions = {
  refresh({commit, dispatch, rootState}) {
    // e.g., make sure there's school today
    const today = rootState.schedules[moment().format('YYYY-MM-DD')]
    if (Array.isArray(today)) {
      // Find the current block to countdown
      for (const block of today) {
        const start = moment(block.start, 'h:ma')
        const end = moment(block.end, 'h:ma')
        // As the previous blocks have been checked, if now is before the
        // start time, we have a match!
        if (moment().isBefore(end)) {
          const before = moment().isBefore(start)
          // Countdown until the next block (passing time/before school),
          // or until the end of the block
          const num = block.number
          const text = num ? (rootState.classes[num] || `Block ${num}`) : block.name
          commit({
            type: 'UPDATE',
            data: {
              end: before ? start.valueOf() : end.valueOf(),
              id: block.id,
              before, text
            }
          })
          // Begin update queue and exit loop
          dispatch('decrement')
          break
        }
      }
    } else {
      // Refresh the countdown every minute if it's after school/the weekend
      const queue = setTimeout(() => {
        dispatch('refresh')
      }, 60000)
      commit('UPDATE', {queue})
      // When a countdown for the day ends, return tab title to "BearTime"
      document.title = 'BearTime'
    }
  },
  decrement({state, commit, dispatch}) {
    // If a countdown is already in progress, simply decrement it
    const remaining = state.data.end - Date.now()
    // If block or passing time is over, refresh the countdown
    if (remaining > 0) {
      // Queue subsequent countdown just a hair after the next second
      const queue = setTimeout(() => {
        dispatch('decrement')
      }, 1005 - moment().milliseconds())
      // Calculate specific duration, e.g., 14:02
      const time = moment.duration(remaining, 'ms').format('h:mm:ss')
      // Update countdown timer!
      // Merge the existing countdown data with the updated countdown
      commit('UPDATE', {
        data: {...state.data, time},
        queue
      })
      // Update title of page with current time (a full old BearTime replacement!)
      // Determine whether the time remaining is before or during the current block
      const modifier = state.data.before ? 'until' : 'in'
      // Put it all together for the title bar text!
      document.title = `${time} ${modifier} ${state.data.text} \u2022 BearTime`
    } else {
      dispatch('refresh')
    }
  }
}

export default {
  namespaced: true,
  state: {
    data: {}
  },
  mutations,
  actions
}
