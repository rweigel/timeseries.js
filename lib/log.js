plotjs.log = function (msg, category, level, line) {
  function pad (n) {
    if (n < 10) { return '0'.repeat(4) + n };
    if (n < 100) { return '0'.repeat(3) + n };
    if (n < 1000) { return '0'.repeat(2) + n };
    if (n < 10000) { return '0'.repeat(1) + n };
    return '' + n
  }

  plotjs.log.config = {
    logLevel: {
      none: false,
      allAbove: -1, // all >= 0, 1, ...
      events: 1
    },
    logMode: 'custom'
  }

  if (plotjs.log.config.logLevel.none === true) {
    return
  }
  if (plotjs.log.config.logMode === 'disabled') {
    return
  }

  if (plotjs.log.config.logLevel.all === 0 && plotjs.log.config.logLevel[category] < level) {
    return
  }

  if (plotjs.log.config.logLevel.all > 0 && level > plotjs.log.config.logLevel.all) {
    return
  }

  if (plotjs.log.config.logMode === 'native') {
    if (plotjs.log.config.logLevel[category] >= level) {
      console.log(msg)
    }
    return
  }
  const currentTime = (new Date()).getTime()

  let dt = 0
  if (plotjs.log.initialTime === undefined) {
    plotjs.log.initialTime = currentTime
  }
  dt = currentTime - plotjs.log.initialTime
  if (plotjs.log.lastTime !== undefined) {
    //dt = currentTime - plotjs.log.lastTime
  }
  plotjs.log.lastTime = currentTime

  if (plotjs.log.config.logMode === 'custom-fast') {
    if (plotjs.log.config.logLevel[category] >= level) {
      console.log(pad(dt) + ' ' + msg)
    }
  } else {
    if (msg && line !== '') {
      // https://stackoverflow.com/a/37081135
      const e = new Error()
      const stack = e.stack.toString().split(/\r\n|\n/)
      line = stack[2].replace(/.*\//, '').replace(/:(.*):.*/, ':$1')
      line = ' ' + line
      if (0) {
        let uri = stack[2].split('(')[1].slice(0, -1)
        const href = window.location.href.split('/').slice(0, -1).join('/')
        console.log(uri)
        uri = uri.replace(href + '/', './')
        console.log(uri)
        line = ' ' + uri + ' ' + line
      }
    }
    if (typeof (msg) === 'string') {
      console.log(pad(dt) + line + ' [' + category + '] ' + msg)
    } else {
      console.log(msg)
    }
  }
}
