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
        plotjs.log(`${id} ${eventName} event; data:`, 'events')
        plotjs.log(data, 'events')
      } else {
        plotjs.log(`${id} ${eventName} event`, 'events')
      }
      plotjs.events[event](data, id)
    })
  }
}

plotjs.events.click = function (data, id) {
}

plotjs.events.doublclick = function (data, id) {
}

plotjs.events.hover = function (event, id) {
}

plotjs.events.unhover = function (data, id) {
}

plotjs.events.selecting = function (data, id) {
}

plotjs.events.selected = function (data, id) {
}

plotjs.events.legendclick = function (data, id) {
}

plotjs.events.legenddoubleclick = function (data, id) {
}

plotjs.events.relayout = function (data, id) {
}

plotjs.events.restyle = function (data, id) {
}

plotjs.events.afterplot = function (data, id) {

  if (plotjs.events.afterplot.arrow === undefined) {
    plotjs.events.afterplot.arrow = false
  }
  if (plotjs.events.afterplot.arrow === false) {
    plotjs.events.afterplot.arrow = true
    plotjs.log(`${id} calling plotjs.annotation.set()`, 'events')
    plotjs.annotation.set(id, () =>
    {
      plotjs.log(`${id} plotjs.annotation.set() callback`, 'events')
      plotjs.events.afterplot.arrow = false
    })
  }
}

plotjs.events.autosize = function (data, id) {
}

plotjs.events.deselect = function (data, id) {
}

plotjs.events.redraw = function (data, id) {
}

plotjs.events.animated = function (data, id) {
}

plotjs.events.webglcontextlost = function (data, id) {
}
