const plotjs = {}

plotjs.plot = function (x, y, style, layout, config) {
  plotjs.log(`${plotjs.gcf()}`, 'plot')
  if (!config) {
    config = plotjs.config.textbook.config
  }
  if (!style) {
    style = plotjs.config.textbook.style.lines
  }
  if (!layout) {
    layout = JSON.parse(JSON.stringify(plotjs.config.textbook.layout))
  }
  if (layout.height === undefined) {
    //layout.height = plotjs.util.viewportWH().height
    layout.height = '300'
    layout.width = '300'
  }
  const data = [{ x, y, ...style }]
  plotjs.log(`${plotjs.gcf()} calling Plotly.newPlot().`, 'plot')
  // Need to copy layout b/c it is modified in Plotly.newPlot()
  const layoutCopy = plotjs.util.clone(layout)
  Plotly
    .newPlot(plotjs.gcf(), data, layoutCopy, config)
    .then(cb(layout))

  function cb (layout) {
    plotjs.annotation.set(plotjs.gcf(), x, y, layout, config)
  }

  if (!config.staticPlot) {
    plotjs.events.set(plotjs.gcf())
  }
}

plotjs.figures = []

plotjs.close = function (figureName) {
  plotjs.log(`Closing figure ${figureName}.`, 'plot')
  const div = document.getElementById(figureName)
  document.body.removeChild(div)
}

plotjs.figure = function (figureName) {
  if (figureName === undefined) {
    figureName = 'figure' + plotjs.figures.length
  }
  const div = document.createElement('div')
  div.id = figureName
  div.style.display = 'none'
  document.body.appendChild(div)
  plotjs.figures.push(figureName)
  return figureName
}

plotjs.gcf = function () {
  if (plotjs.figures.length === 0) {
    return plotjs.figure()
  }
  return plotjs.figures[plotjs.figures.length - 1]
}

plotjs.get = function (id, key) {
  const domElement = document.getElementById(id)
  plotjs.log(plotjs.util.keys(domElement))
  return domElement.layout[key]
}

plotjs.set = function (id, layout) {
  const domElement = document.getElementById(id)
  Plotly.relayout(domElement, layout);
}
