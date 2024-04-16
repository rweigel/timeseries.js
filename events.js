const events = {}

events.clear = function (id) {
  // https://stackoverflow.com/questions/4386300/javascript-dom-how-to-remove-all-event-listeners-of-a-dom-object
}

events.set = function (id) {
  const domElement = document.getElementById(id)
  for (const event of Object.keys(events)) {
    if (event === 'set') { continue }
    //log(`Adding eventListener to '${id}': ` + event, 'events')
    const eventName = 'plotly_' + event
    domElement.on(eventName, function (data) {
      if (data) {
        log(eventName + ' data:', 'events', 1)
        log(data, 'events', 1)
      } else {
        log(eventName, 'events', 1)
      }
      events[event](data)
    })
  }
}

events.click = function (data) {
}

events.doublclick = function (data) {
}

events.hover = function (event) {
}

events.unhover = function (data) {
}

events.selecting = function (data) {
}

events.selected = function (data) {
}

events.legendclick = function (data) {
}

events.legenddoubleclick = function (data) {
}

events.relayout = function (data) {
}

events.restyle = function (data) {
}

events.afterplot = function (data) {
}

events.autosize = function (data) {
}

events.deselect = function (data) {
}

events.redraw = function (data) {
}

events.animated = function (data) {
}

events.webglcontextlost = function (data) {
}
