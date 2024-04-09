const log = function (msg, category, level, line) {
  function pad (n) {
    if (n < 10) { return '0'.repeat(4) + n };
    if (n < 100) { return '0'.repeat(3) + n };
    if (n < 1000) { return '0'.repeat(2) + n };
    if (n < 10000) { return '0'.repeat(1) + n };
    return '' + n
  }

  this.config = {
    logLevel: {
      none: false,
      allAbove: -1, // all >= 0, 1, ...
      events: 1
    },
    logMode: 'custom'
  }

  if (this.config.logLevel.none === true) {
    return
  }
  if (this.config.logMode === 'disabled') {
    return
  }

  if (this.config.logLevel.all === 0 && this.config.logLevel[category] < level) {
    return
  }

  if (this.config.logLevel.all > 0 && level > this.config.logLevel.all) {
    return
  }

  if (this.config.logMode === 'native') {
    if (this.config.logLevel[category] >= level) {
      console.log(msg)
    }
    return
  }

  log.currentTime = (new Date()).getTime()
  let dt = 0
  if (this.lastTime !== undefined) {
    dt = this.currentTime - this.lastTime
  }
  this.lastTime = this.currentTime

  if (this.config.logMode === 'custom-fast') {
    if (this.config.logLevel[category] >= level) {
      console.log(pad(dt) + ' ' + msg)
    }
  } else {
    if (msg && line !== '') {
      // https://stackoverflow.com/a/37081135
      const e = new Error()
      const stack = e.stack.toString().split(/\r\n|\n/)
      line = stack[2].replace(/.*\//, '').replace(/:(.*):.*/, ':$1')
      line = ' ' + line
    }
    if (typeof (msg) === 'string') {
      console.log(pad(dt) + line + ' [' + category + '] ' + msg)
    } else {
      console.log(msg)
    }
  }
}
