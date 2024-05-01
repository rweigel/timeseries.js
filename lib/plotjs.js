const plotjs = {}

plotjs.plot = function (x, y, style, layout, config) {
  let id = plotjs.gcf()

  if (config && config._usePlotlyOnly) {
    plotjs.log(`${id} Using Plotly layout only.`, 'plot')
    document.getElementById(id).style.display = ''
    config = { ...plotjs.config.defaults.config, ...config }
    if (style) {
      style = plotjs.util.deepCopy({ ...plotjs.config.defaults.style, ...style })
    }
    if (layout) {
      layout = plotjs.util.deepCopy({ ...plotjs.config.defaults.layout, ...layout })
    }
    Plotly.newPlot(id, [{ x, y, ...style }], layout, config)
    return
  }

  layout = plotjs.util.deepUpdate(plotjs.config.textbook.layout, layout)

  plotjs.log(`${id}`, 'plot')

  plotjs.log(`${id} attaching layout to figure`, 'plot')
  plotjs.figure[id] = { layout: JSON.parse(JSON.stringify(layout)), config }

  plotjs.log(`${id} calling Plotly.newPlot()`, 'plot')
  Plotly
    .newPlot(id, [{ x, y, ...style }], JSON.parse(JSON.stringify(layout)), config)
    .then(cb0)

  function cb0() {
    plotjs.log(`${id} Plotly.newPlot() callback`, 'plot')
    plotjs.annotation.set(id, () => {
      plotjs.log(`${id} callback for plotjs.annotation.set()`, 'plot')
      plotjs.log(`${id} calling plotjs.events.set()`, 'plot')
      plotjs.events.set(id)
    })
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
  // Get current element
  return document.getElementById(plotjs.gcf())
}
plotjs.gcl = function () {
  // Get current layout
  return document.getElementById(plotjs.gcf())._fullLayout
}

plotjs.gcf = function () {
  // get current figure
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

function rectangle (id) {
  const _fullLayout = domElement._fullLayout
  return [
    {
      type: 'rect',
      xref: 'x',
      yref: 'y',
      x0: _fullLayout.xaxis.range[0],
      y0: _fullLayout.yaxis.range[0],
      x1: 0,
      y1: _fullLayout.yaxis.range[1],
      fillcolor: 'white',
      opacity: 1,
      line: {
        width: 0
      }
    },
    {
      type: 'rect',
      xref: 'x',
      yref: 'y',
      x0: 0,
      y0: _fullLayout.yaxis.range[0],
      x1: _fullLayout.yaxis.range[1],
      y1: 0,
      fillcolor: 'white',
      opacity: 1,
      line: {
        width: 0
      }
    },
    {
      type: 'rect',
      xref: 'x',
      yref: 'y',
      x0: 0,
      y0: 0,
      x1: _fullLayout.yaxis.range[1],
      y1: 0,
      fillcolor: 'white',
      opacity: 1,
      line: {
        width: 0
      }
    }
  ]
}

plotjs.text = function (id, x, y, text, font, anchors) {
  const annotation = {
    text,
    arrowside: 'none',
    x: 0,
    y: 0,
    xref: 'x',
    yref: 'y',
    xanchor: 'right',
    yanchor: 'top',
    showarrow: true
  }
  if (id) {
    Plotly.relayout(plotjs.gcf(), { annotation: { ...annotation } })
  }
  return annotation
}
