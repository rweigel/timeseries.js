const plotjs = {}

plotjs.plot = function (x, y, style, layout, config) {
  plotjs.log(`${plotjs.gcf()}`, 'plot')
  if (config && config._usePlotly) {
    plotjs.log('Using Plotly layout only.', 'plot')
    document.getElementById(plotjs.gcf()).style.display = ''
    config = { ...plotjs.config.defaults.config, ...config }
    if (style) {
      style = plotjs.util.deepCopy({ ...plotjs.config.defaults.style, ...style })
    }
    if (layout) {
      layout = plotjs.util.deepCopy({ ...plotjs.config.defaults.layout, ...layout })
    }
    Plotly.newPlot(plotjs.gcf(), [{ x, y, ...style }], layout, config)
    return
  }

  if (config) {
    config = { ...plotjs.config.textbook.config, ...config }
  } else {
    config = plotjs.config.textbook.config
  }
  if (style) {
    style = { ...plotjs.config.defaults.style, ...style }
  } else {
    style = plotjs.config.defaults.style
  }
  if (layout) {
    layout = { ...JSON.parse(JSON.stringify(plotjs.config.textbook.layout)), ...layout }
  } else {
    layout = JSON.parse(JSON.stringify(plotjs.config.textbook.layout))
  }

  const data = [{ x, y, ...style }]
  plotjs.log(`${plotjs.gcf()} calling Plotly.newPlot().`, 'plot')
  // Need to copy layout b/c it is modified in Plotly.newPlot()
  const layoutCopy = plotjs.util.deepCopy(layout)
  Plotly
    .newPlot(plotjs.gcf(), data, layoutCopy, config)
    .then(cb(layoutCopy))

  function cb (layout) {
    console.log(layout)
    plotjs.annotation.set(plotjs.gcf(), x, y, layout, config)
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

plotjs.gce = function () {
  return document.getElementById(plotjs.gcf())
}
plotjs.gcl = function () {
  return document.getElementById(plotjs.gcf())._fullLayout
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
