import _merge from 'lodash/merge'
import moment from 'moment'

let today = moment().format('YYYY-MM-DD')
let restorePrefs = (key, defaults) => _merge(defaults, JSON.parse(localStorage.getItem(key)) || {})

export default {
  dimming: false,
  loading: true,
  schedule: {},
  // Restore saved preferences to overwrite default lunches and classes
  lunches: restorePrefs('lunches', { 'Monday': 1, 'Tuesday': 1, 'Wednesday': 1, 'Thursday': 1, 'Friday': 1 }),
  classes: restorePrefs('classes', { 1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 7: '' }),
  // Design constants
  sizing: 1.2,
  colors: ['#3F51B5', '#1976D2', '#039BE5', '#00BCD4', '#009688', '#43A047', '#7CB342'],
  // Check if client is crawler so it doesn't see a countdown in the title!
  isCrawler: /bot|googlebot|crawler|spider|robot|crawling/i.test(navigator.userAgent),
  // Set default dates to determine week to display
  displayDate: today, today,
  // Set default countdown so checking each blocks begins with the first one
  countdown: { i: 0 },
  // Queue for next countdown call (a timeout Promise)
  queue: null
}
