import _merge from 'lodash/merge'
import moment from 'moment'

let today = moment().format('YYYY-MM-DD')

export default {
  loading: true,
  schedule: {},
  // Restore saved preferences to over default lunches and classes
  lunches: _merge({ 'Monday': 1, 'Tuesday': 1, 'Wednesday': 1, 'Thursday': 1, 'Friday': 1 },
    JSON.parse(localStorage.getItem('lunches')) || {}),
  classes: _merge({ 1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 7: '' },
    JSON.parse(localStorage.getItem('classes')) || {}),
  // Design constants
  colors: ['#3F51B5', '#1976D2', '#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A'],
  // Check if client is crawler so it doesn't see a countdown in the title!
  isCrawler: /bot|googlebot|crawler|spider|robot|crawling/i.test(navigator.userAgent),
  // Set default dates to determine week to display
  displayDate: today, today,
  // Set default countdown so checking each blocks begins with the first one
  countdown: { i: 0 },
  // Queue for next countdown call (a timeout Promise)
  queue: null
}
