class Time extends HTMLElement {
  #timer
  #locale
  //#timezone // reserved for later usage... but I have no idea at this moment.
  #targetTime
  #selfModule
  #passed
  #onUpdated
  #onPassed

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

    this.#onPassed = null
    this.#onUpdated = null
  }

  connectedCallback() {
    this.#display()
  }

  disconnectedCallback() {
    clearTimeout(this.#timer)
    this.#timer = null
    this.#selfModule = null
    this.#onPassed = null
    this.#onUpdated = null
    this.#targetTime = null
  }

  static get observedAttributes() {
    return ['time', 'range', 'refresh', 'decouple', 'relative', 'relative-unit', 'relative-reverse', 'formatter']
  }

  attributeChangedCallback(attrName, oldValue, newValue) {
    if (attrName === 'time') {
      this.#passed = false
    }
    this.#display()
  }

  adoptedCallback() {
    // when this tag is moved. not implemented. Would it be needed?
    return
  }

  #getDateObject(dateLike) {
    if (dateLike) {
      if (!isNaN(dateLike)) dateLike = +dateLike
      var d = new Date(dateLike)
      if (d instanceof Date && !isNaN(d.getTime())) return d
    }
    // Log.warn(`${dateLike} is not a valid date-like value.`)
    return false
  }

  set time (dateLike) {
    let date = this.#getDateObject(dateLike) || new Date(Date.now())
    this.setAttribute('time', date.getTime())
  }

  get time () {
    let time = this.getAttribute('time')
    if (!isNaN(time)) time = +time
    return (time) ? new Date(time) : new Date(Date.now())
  }

  set range (dateLike) {
    let date = this.#getDateObject(dateLike)
    if (!date) return
    this.setAttribute('range', date)
  }

  get range () {
    let time = this.getAttribute('range')
    return (time) ? new Date(time) : new Date(Date.now())
  }

  set locale(text) {
    this.setAttribute('locale', text)
  }

  get locale() {
    return this.getAttribute('locale')
  }


  set refresh(refresh) {
    if (!isNaN(refresh) && refresh > 100) this.setAttribute('refresh', +refresh)
  }

  get refresh() {
    return this.getAttribute('refresh')
  }

  set relative (isRelative) {
    if (isRelative && !this.getAttribute('range')) {
      this.setAttribute('relative', '')
      return
    }
    this.removeAttribute('relative')
  }

  get relative () {
    return this.hasAttribute('relative') && !this.hasAttribute('range')
  }

  set relativeUnit(text) {
    this.setAttribute('relative-unit', text)
  }

  get relativeUnit() {
    return this.getAttribute('relative-unit')
  }

  set relativeReverse(v) {
    if (v) { 
      this.setAttribute('relative-reverse', '')
    } else {
      this.removeAttribute('relative-reverse')
    }
  }

  get relativeReverse() {
    return this.hasAttribute('relative-reverse')
  }

  set relativeQuarter(v) {
    if (v) { 
      this.setAttribute('relative-quarter', '')
    } else {
      this.removeAttribute('relative-quarter')
    }
  }

  get relativeQuarter() {
    return this.hasAttribute('relative-quarter')
  }

  set decouple (v) {
    if (v) { 
      this.setAttribute('decouple', '')
    } else {
      this.removeAttribute('decouple')
    }
  }

  get decouple() {
    return this.hasAttribute('decouple')
  }

  set formatter(list) {
    if (Array.isArray(list)) {
      this.setAttribute('formatter', list.join(','))
    } else {
      this.setAttribute('formatter', list)
    }
  }

  get formatter() {
    return (this.getAttribute('formatter')) ? this.getAttribute('formatter').replace(/\s/g, ',').split(',') : []
  }

  set onUpdated(func) {
    if (typeof func === 'function') this.#onUpdated = func
  } 

  get onUpdated() {
    return this.#onUpdated
  }

  set onPassed(func) {
    if (typeof func === 'function') this.#onPassed = func
  }

  get onPassed() {
    return this.#onPassed
  }

  update() {
    this.#display()
  }

  #setTargetTime() {
    const now = new Date(Date.now())
    let attrTime = this.#getDateObject(this.getAttribute('time'))
    this.#targetTime = (attrTime) ? attrTime : now
    if (this.#targetTime.toString() === 'Invalid Date') this.#targetTime = now
  }

  #display() {
    const now = new Date(Date.now())
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

    let range = this.#getDateObject(this.getAttribute('range'))
    let relative = this.hasAttribute('relative') && !range
  
    if (relative) {
      const units = [
        'second', 'seconds', 'minute', 'minutes', 'hour', 'hours', 'day', 'days',
        'week', 'weeks', 'month', 'months', 'quarter', 'quarters', 'year', 'years'
      ]
      let unit = this.getAttribute('relative-unit')
      if (!units.includes(unit)) unit = 'auto'
      let tonow = this.hasAttribute('relative-reverse')
      let diff = (!tonow) ? this.#timeDiff(now, this.#targetTime) : this.#timeDiff(this.#targetTime, now)

      if (unit === 'auto') {
        const aUnits = new Map()
        aUnits.set('second', 60)
        aUnits.set('minute', 60)
        aUnits.set('hour', 24)
        aUnits.set('day', 7)
        aUnits.set('week', 4)
        if (this.hasAttribute('relative-quarter')) {
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
    } else {
      let format = new Intl.DateTimeFormat(locale, options)
      result = (!range) ? format.formatToParts(this.#targetTime) : format.formatRangeToParts(this.#targetTime, range)
    } 

    let formatters = (this.getAttribute('formatter')) ? this.getAttribute('formatter').replace(/\s/g, ',').split(',') : []
    for (let formatter of formatters) {
      result = this.#selfModule.formatter(formatter, result)
    }

    if (this.hasAttribute('decouple')) {
      result = result.map((parts) => {
        const {value, ...rest} = parts
        var list = Object.values(rest).join(' ')
        parts.value = `<span class="mm-time-parts ${list}">${value}</span>`
        return parts
      })
    }
    result = result.map(({value}) => { return value }).join('')

    /*
    if (
      this.hasAttribute('padzero')
      && this.getAttribute('padzero') !== 'none'
      && (!isNaN(result) && +result < 100)  
    ) result = String(result).padStart(2, '0')
    */

    this.innerHTML = result

    const eventDetails = {
      detail: {
        displayed: this.innerHTML, 
        time: new Date(this.#targetTime)
      }
    }

    var updateEvent = new CustomEvent('updated', eventDetails)
    this.dispatchEvent(updateEvent)
    if (typeof this.#onUpdated === 'function') this.#onUpdated(updateEvent)
    
    if (this.#passed && this.#targetTime.getTime() > now.getTime()) {
      this.#passed = false
    }

    if (!this.#passed && this.#targetTime.getTime() <= now.getTime()) {
      this.#passed = true
      let passedEvent = new CustomEvent('passed', eventDetails)
      this.dispatchEvent(passedEvent)
      if (typeof this.#onPassed === 'function') this.#onPassed(passedEvent)
    }

    if (refresh > 100) {
      this.#timer = setTimeout(() => {
        this.#display()
      }, refresh)
    }
  }
}

Module.register('MMM-CustomElementTime', {
  defaults: {},

  start: function () {
    this.formatters = new Map()
    window.customElements.define('mm-time', Time)
    for (const [name, func] of Object.entries(this.config.customFormatter ?? [])) {
      this.registerCustomFormatter(name, func)
    }
  },

  getStyles: function () {
    return ['MMM-CustomElementTime.css']
  },

  formatter: function (formatName, parts) {
    if (this.formatters.has(formatName)) {
      const func = this.formatters.get(formatName)
      var result = func(parts)
      return result
    }
    return parts
  },

  registerCustomFormatter: function (formatName, func) {
    if (typeof func === 'function') {
      this.formatters.set(formatName, func)
      return true
    } else {
      return false
    }
  },

  notificationReceived: function (notification, payload, sender) {
    if (notification === 'CETIME_REGISTER_CUSTOM_FORMAT') {
      const { name, callback } = payload
      this.sendNotification('CETIME_REGISTER_CUSTOM_FORMAT_RESULT', {
        result: this.registerCustomFormatter(name, callback),
        name,
        sender
      })
    }
  }
})
