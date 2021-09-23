class Time extends HTMLElement {
  #timer
  #locale
  //#timezone // reserved for later usage... but I have no idea at this moment.
  #targetTime
  #selfModule
  #passed

  #timeDiff (fromTime, toTime) {
    const _r = (v) => {
      if (v < 0) {
        return Math.ceil(v)
      } else {
        return Math.floor(v)
      }
    }

    const _dayDiff = (a, b) => {
      const _MS_PER_DAY = 1000 * 60 * 60 * 24
      const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
      const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
    
      return (utc1 - utc2) / _MS_PER_DAY
    }

    const _monthDiff = (a, b) => {
      return b.getMonth() - a.getMonth() + 
      (12 * (b.getFullYear() - a.getFullYear()))
    }

    let ms = toTime.getTime() - fromTime.getTime()
  
    const second = _r(ms / 1000)
    const minute = _r(ms / (1000 * 60))
    const hour =  _r(ms / (1000 * 60 * 60))
    const day =  _dayDiff(toTime, fromTime)
    const week =  _r(day / 7)
    const month =  _monthDiff(fromTime, toTime)
    const quarter =  _r( month / 3 )
    const year =  _r(month / 12)
  
    const seconds = second
    const minutes = minute
    const hours = hour
    const days = day
    const weeks = week
    const months = month
    const quarters = quarter
    const years = year

    return {
      second, seconds, minute, minutes, hour, hours, day, days,
      week, weeks, month, months, quarter, quarters, year, years
    }
  }

  constructor() {
    super()
    this.#timer = null
    this.#selfModule = MM.getModules().filter(module => (module.name === 'MMM-CustomElementTime'))[0]
    this.#locale = this.#selfModule?.config?.locale || config?.locale || navigator.languages[0] || 'en-US'
    // this.#timezone = this.#selfModule?.config?.timezone || config?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
    this.#targetTime = null
    this.#passed = false
  }
  connectedCallback() {
    this.#display()
  }
  disconnectedCallback() {
    clearTimeout(this.#timer)
    this.#timer = null
  }

  static get observedAttributes() {
    return ['time', 'range', 'refresh'];
  }

  attributeChangedCallback(attrName, oldValue, newValue) {
    if (attrName === 'time') {
      this.#passed = false
      this.#display()
    }
    if (attrName === 'refresh') {
      this.#display()
    }
    if (attrName === 'range') {
      this.#display()
    }
  }

  adoptedCallback() {

  }

  #getDateObject(dateLike) {
    if (dateLike) {
      var d = new Date(dateLike)
      if (d instanceof Date && !isNaN(d.getTime())) return d
    }
    // Log.warn(`${dateLike} is not a valid date-like value.`)
    return false
  }

  set time (dateLike) {
    let date = this.#getDateObject(dateLike)
    if (!date) return
    this.setAttribute('time', date.getTime())
  }

  get time () {
    let time = this.getAttribute('time')
    return (time) ? new Date(time) : new Date()
  }

  set range (dateLike) {
    let date = this.#getDateObject(dateLike)
    if (!date) return
    this.setAttribute('range', date.getTime())
  }

  get range () {
    let time = this.getAttribute('range')
    return (time) ? new Date(time) : new Date()
  }

  #setTargetTime() {
    let attrTime = this.#getDateObject(this.getAttribute('time'))
    this.#targetTime = (attrTime) ? attrTime : new Date()
    if (this.#targetTime.toString() === "Invalid Date") this.#targetTime = new Date()
  }

  #display() {
    clearTimeout(this.#timer)
    this.#timer = null

    this.#setTargetTime()

    let result = []
    let refresh = this.getAttribute('refresh') || 0

    let locale = this.getAttribute('locale') || this.#locale|| null
    try {
      locale = Intl.getCanonicalLocales(locale)?.[0] || 'default'
    } catch (err) {
      Log.warn(`Invalid locale '${locale}' in '${this.outerHTML}'`)
      locale = 'default'
    }

    let options = Object.assign({}, this.dataset)
    for (let [k, v] of Object.entries(options)) {
      if (v === 'true') options[k] = true
      if (v === 'false') options[k] = false
    }
    
    let type = this.getAttribute('type') || 'absolute' // default absolute, relative
    type = (['absolute', 'relative'].includes(type)) ? type : 'absolute'

    let range = this.#getDateObject(this.getAttribute('range'))
    if (range) type = 'absolute'

    if (type === 'absolute') {
      let format = new Intl.DateTimeFormat(locale, options)
      result = (!range) ? format.formatToParts(this.#targetTime) : format.formatRangeToParts(this.#targetTime, range)
    } else if (type === 'relative') {
      const units = [
        "second", "seconds", "minute", "minutes", "hour", "hours", "day", "days",
        "week", "weeks", "month", "months", "quarter", "quarters", "year", "years"
      ]
      let unit = this.getAttribute('unit') || 'auto'
      if (!units.includes(unit)) unit = 'auto'
      let direction = this.getAttribute('direction')
      let diff = (!['fromnow', 'tonow'].includes(direction) || direction === 'fromnow') ? this.#timeDiff(new Date(), this.#targetTime) : this.#timeDiff(this.#targetTime, new Date())

      if (unit === 'auto') {
        const aUnits = new Map()
        aUnits.set('second', 60)
        aUnits.set('minute', 60)
        aUnits.set('hour', 24)
        aUnits.set('day', 7)
        aUnits.set('week', 4)
        if (this.hasAttribute('use-quarter') && this.getAttribute('use-quarter') !== 'none') {
          aUnits.set('month', 3)
          aUnits.set('quarter', 4)
        } else {
          aUnits.set('month', 12)
        }
        aUnits.set('year', Infinity)
        for (const [key, value] of aUnits[Symbol.iterator]()) {
          if (Math.abs(diff[key]) < value) {
            unit = key
            break
          }
        }
      }
      
      result = new Intl.RelativeTimeFormat(locale, options).formatToParts(diff[unit], unit)
    }

    let formatters = (this.getAttribute('formatter')) ? this.getAttribute('formatter').replace(/\s/g, ',').split(',') : []
    for (let formatter of formatters) {
      result = this.#selfModule.formatter(formatter, result)
    }

    result = result.map(({value}) => { return value }).join('')
    if (
      this.hasAttribute('padzero')
      && this.getAttribute('padzero') !== 'none'
      && (!isNaN(result) && +result < 100)  
    ) result = String(result).padStart(2, '0')

    this.innerHTML = result

    const eventDetails = {
      detail: {
        displayed: this.innerHTML, 
        time: this.#targetTime
      }
    }

    var refreshEvent = new CustomEvent('refresh', eventDetails)
    this.dispatchEvent(refreshEvent)
    if (typeof this.onRefresh === 'function') this.onRefresh(refreshEvent)
    if (!this.#passed && this.#targetTime.getTime() <= new Date().getTime()) {
      this.#passed = true
      let passedEvent = new CustomEvent('passed', eventDetails)
      this.dispatchEvent(passedEvent)
      if (typeof this.onPassed === 'function') this.onPassed(passedEvent)
    }

    if (refresh > 100) {
      this.#timer = setTimeout(() => {
        this.#display()
      }, refresh)
    }
  }
}

Module.register("MMM-CustomElementTime", {
  defaults: {
    global: {
      interval: 60 * 1000
    }
  },

  start: function () {
    this.formatters = new Map()
    console.log('define?')
    window.customElements.define('mm-time', Time)
    for (const [name, func] of Object.entries(this.config.customFormatter)) {
      if (typeof func === 'function') this.formatters.set(name, func)
    }
  },

  formatter: function (formatterName, parts) {
    console.log(formatterName, parts)
    if (this.formatters.has(formatterName)) {
      const func = this.formatters.get(formatterName)
      var result = func(parts)
      return result
    }
    return parts
  },

  notificationReceived: function (notification, payload, sender) {
    function handler (event) {
      console.log(1)
    }
    function handler2 (event) {
      console.log(2)
    }
    if (notification === 'DOM_OBJECTS_CREATED') {
      var t = document.getElementById('time1')
      t.addEventListener('refresh', handler)
      t.addEventListener('passed', handler2)
      console.log('event-listened')
    }

  },
})