plotjs.events = {}

plotjs.events.clear = function (id) {
  // https://stackoverflow.com/questions/4386300/javascript-dom-how-to-remove-all-event-listeners-of-a-dom-object
}

plotjs.events.set = function (id) {
  const domElement = document.getElementById(id)
  for (const event of Object.keys(plotjs.events)) {
    if (event === 'set') { continue }
    //plotjs.log(`Adding eventListener to '${id}': ` + event, 'events')
    const eventName = 'plotly_' + event
    domElement.on(eventName, function (data) {
      if (data) {
        plotjs.log(`${id} ${eventName} data:`, 'events')
        plotjs.log(data, 'events')
      } else {
        plotjs.log(`${id} ${eventName}`, 'events')
      }
      plotjs.events[event](data)
    })
  }
}

plotjs.events.click = function (data) {
}

plotjs.events.doublclick = function (data) {
}

plotjs.events.hover = function (event) {
}

plotjs.events.unhover = function (data) {
}

plotjs.events.selecting = function (data) {
}

plotjs.events.selected = function (data) {
}

plotjs.events.legendclick = function (data) {
}

plotjs.events.legenddoubleclick = function (data) {
}

plotjs.events.relayout = function (data) {
}

plotjs.events.restyle = function (data) {
}

plotjs.events.afterplot = function (data) {
}

plotjs.events.autosize = function (data) {
}

plotjs.events.deselect = function (data) {
}

plotjs.events.redraw = function (data) {
}

plotjs.events.animated = function (data) {
}

plotjs.events.webglcontextlost = function (data) {
}
