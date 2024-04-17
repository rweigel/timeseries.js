plotjs.annotation = {}

plotjs.annotation.set = function (id, x, y, layout, config) {
  const domElement = document.getElementById(id)

  //plotjs.log(`${domElement.id}`, 'annotation')
  //plotjs.log(`${domElement.id} fullLayout after initial render:`, 'annotation')
  //plotjs.log(domElement._fullLayout, 'annotation')

  // Number of traces before annotation traces are added
  let nTraces = domElement.data.length

  if (config._useOriginalGridLines === false) {
    plotjs.log(`${domElement.id} adding grid lines`, 'annotation')
    const gridTraces = gridLines(plotjs.gcf(), layout)
    Plotly.addTraces(plotjs.gcf(), gridTraces)
    plotjs.log(`${domElement.id} added grid lines`, 'annotation')
  }

  // Need to set after newPlot() because range is needed.
  const endAnnotations = axisAnnotations(plotjs.gcf())

  // Need to set ticks and labels after Plotly.newPlot() so that
  // the coordinate to pixel ratios can be calculated.
  const [labelAnnotations, tickShapes] = axisTicksAndLabels(plotjs.gcf(), layout)

  layout = {}
  layout.annotations = [...endAnnotations, ...labelAnnotations]
  layout.shapes = tickShapes

  if (config._keepOriginalLayout === false) {
    const layoutMods = {
      xaxis: {
        zeroline: false,
        showgrid: config._useOriginalGridLines,
        showline: false,
        ticks: '',
        showticklabels: false,
        minor: {
          showgrid: config._useOriginalGridLines
        }
      }
    }
    layoutMods.yaxis = layoutMods.xaxis
    layout = { ...layout, ...layoutMods }
  }

  plotjs.log(`${domElement.id} calling Plotly.relayout()`, 'annotation')
  Plotly.relayout(plotjs.gcf(), layout)
    .then(() => {
      plotjs.log(`${domElement.id} Plotly.relayout() callback. Showing figure.`, 'annotation')
      domElement.style.display = ''
    })

  plotjs.log(`${domElement.id} called Plotly.relayout()`, 'annotation')

  // Move first trace to end so that it is behind the gridlines
  // https://plotly.com/javascript/plotlyjs-function-reference/
  plotjs.log(`${domElement.id} calling Plotly.moveTraces()`, 'annotation')
  Plotly.moveTraces(plotjs.gcf(), plotjs.math.arange(nTraces))
  plotjs.log(`${domElement.id} called Plotly.moveTraces()`, 'annotation')

  function dataRange (id) {
    const domElement = document.getElementById(id)
    const x = domElement.data[0].x
    const y = domElement.data[0].y
    const range = {
      x: [Math.min(...x), Math.max(...x)],
      y: [Math.min(...y), Math.max(...y)]
    }
    return range
  }

  function majorTicks (id, direction) {
    const axisName = direction + 'axis'
    const domElement = document.getElementById(id);
    const _axis = domElement._fullLayout[axisName];

    let values = [];
    for (let _val of _axis._vals) {
      if (!_val.minor) values.push(_val.x)
    }
    return values
  }

  function minorTicks (id, direction) {
    const axisName = direction + 'axis'
    const domElement = document.getElementById(id);
    const _axis = domElement._fullLayout[axisName];

    let values = [];
    for (let _val of _axis._vals) {
      if (_val.minor) values.push(_val.x)
    }
    return values
  }

  function coordinateToPixelRatio (id, direction) {
    const domElement = document.getElementById(id)
    const axis = domElement._fullLayout[direction + 'axis']
    let offset = 0
    let c2pRatio = 0

    const dPixels = axis.c2p(plotjs.math.last(axis.range)) - axis.c2p(axis.range[0])
    const dValues = plotjs.math.last(axis.range) - axis.range[0];

    if (0) {
      plotjs.log(`axis.range[0] = ${axis.range[0]}`, 'coordinateToPixelRatio')
      plotjs.log(`plotjs.math.last(axis.range) = ${plotjs.math.last(axis.range)}`, 'coordinateToPixelRatio')
      plotjs.log(`axis.c2p(axis.range[0]) = ${axis.c2p(axis.range[0])}`, 'coordinateToPixelRatio')
      plotjs.log(`axis.c2p(plotjs.math.last(axis.range)) = ${axis.c2p(plotjs.math.last(axis.range))}`, 'coordinateToPixelRatio')
      plotjs.log(`dValues = ${dValues}`, 'coordinateToPixelRatio')
      plotjs.log(`dPixels = ${dPixels}`, 'coordinateToPixelRatio')
    }
    if (direction === 'x') {
      offset = domElement._fullLayout.margin.l;
      //c2pRatio = (axis.c2p(axis.range[0]) + offset) / (axis.c2p(plotjs.math.last(axis.range)) + offset);
      c2pRatio = dValues / dPixels
    }
    if (direction === 'y') {
      //offset = domElement._fullLayout.margin.t;
      c2pRatio = -dValues / dPixels
    }
    if (0) {
      plotjs.log(`direction = ${direction}, c2pRatio = ${c2pRatio}, offset = ${offset}`, 'coordinateToPixelRatio')
    }
    return c2pRatio
  }

  function axisAnnotations (id) {
    // We don't use Plotly's zeroline because it will extend past the axis
    // arrow annotation. We add the zero lines after Plotly.newPlot() is
    // called because we need the axes ranges.

    const dataRange_ = dataRange(id)

    let domElement = document.getElementById(id)
    let xrange = domElement._fullLayout['xaxis'].range
    let yrange = domElement._fullLayout['yaxis'].range

    // Arrow heads and axis labels
    const xMinorTicks = minorTicks(id, 'x')
    const xLastMinorTickStep = xMinorTicks[xMinorTicks.length - 1] - xMinorTicks[xMinorTicks.length - 2]
    const xLastGrid = Math.max(plotjs.math.last(xMinorTicks), plotjs.math.last(majorTicks(id, 'x')))

    const yMinorTicks = minorTicks(id, 'x')
    const yLastMinorTickStep = xMinorTicks[xMinorTicks.length - 1] - xMinorTicks[xMinorTicks.length - 2]
    const yLastGrid = Math.max(plotjs.math.last(yMinorTicks), plotjs.math.last(majorTicks(id, 'y')))

    const annotations =
      [
        {
          text: '$\\Large x$',
          x: xLastGrid + xLastMinorTickStep / 2,
          y: coordinateToPixelRatio(id, 'y') * 16,
          showarrow: false
        },
        {
          text: '', // Needed or else space between end and ax value set below.
          x: xLastGrid + xLastMinorTickStep,
          y: 0,
          ax: xrange[0] < 0 && dataRange_.x[0] >= 0 ? 0 : dataRange_.x[0],
          ay: 0,

          xref: 'x',
          yref: 'y',
          axref: 'x',
          ayref: 'y',

          arrowwidth: 1,
          arrowsize: 2,
          arrowhead: 3,
          standoff: 0,
          arrowwidth: 1.1,
          arrowcolor: 'black',
          borderpad: 0,
          startstandoff: 0,
          showarrow: true
        },
        {
          text: '$\\Large y$',
          x: coordinateToPixelRatio(id, 'x') * 16,
          y: yLastGrid + yLastMinorTickStep / 2,
          showarrow: false
        },
        {
          text: '', // Needed or else space between end and ay value set below.
          x: 0,
          y: yLastGrid + yLastMinorTickStep,
          ax: 0,
          ay: yrange[0] < 0 && dataRange_.y[0] >= 0 ? 0 : dataRange_.y[0],
          xref: 'x',
          yref: 'y',
          axref: 'x',
          ayref: 'y',
          arrowwidth: 1,
          arrowsize: 2,
          arrowhead: 3,
          standoff: 0,
          arrowwidth: 1.1,
          arrowcolor: 'black',
          borderpad: 0,
          startstandoff: 0,
          showarrow: true
        }
      ]
    return annotations
  }

  function axisTicksAndLabels (id, layout, direction) {
    if (!direction) {
      const [annotationsx, shapesx] = axisTicksAndLabels(id, layout, 'x')
      const [annotationsy, shapesy] = axisTicksAndLabels(id, layout, 'y')
      return [[...annotationsx, ...annotationsy], [...shapesx, ...shapesy]]
    }

    const axisName = direction + 'axis'

    const ticks = layout[axisName].ticks
    const showticklabels = layout[axisName].showticklabels

    const annotations = []
    const shapes = []

    if (ticks === '' && showticklabels === false) {
      plotjs.log(`${id} ticks = '${ticks}', showticklabels = ${showticklabels}. Returning.`, 'axisTicksAndLabels')
      return [annotations, shapes]
    }

    let c2pRatio = coordinateToPixelRatio(id, 'y')
    if (direction === 'y') {
      c2pRatio = coordinateToPixelRatio(id, 'y')
    }

    let bottom = 0
    if (layout[axisName].ticks === 'inside') {
      bottom = 0
    }
    if (layout[axisName].ticks === 'outside') {
      bottom = -c2pRatio * layout[axisName].ticklen
    }
    if (layout[axisName].ticks === 'centered') {
      bottom = -c2pRatio * layout[axisName].ticklen / 2
    }

    const vals = majorTicks(id, direction)
    for (let i = 0; i < vals.length; i++) {
      if (vals[i] === 0) continue

      if (layout[axisName].showticklabels !== false) {
        if (direction === 'x') {
          annotations.push({
            text: vals[i],
            x: vals[i] < 0 ? vals[i] - c2pRatio : vals[i],
            y: bottom,
            xanchor: 'center',
            yanchor: 'top',
            showarrow: false
          })
        } else {
          annotations.push({
            text: vals[i],
            font: layout[axisName].font,
            x: bottom,
            y: vals[i] < 0 ? vals[i] - c2pRatio : vals[i],
            xanchor: 'right',
            yanchor: 'left',
            showarrow: false
          })
        }
      }

      if (layout[axisName].ticks !== '') {
        if (direction === 'x') {
          shapes.push({
            type: 'line',
            x0: 0,
            y0: -layout[axisName].ticklen / 2,
            x1: 0,
            y1: layout[axisName].ticklen / 2,
            xanchor: vals[i],
            yanchor: 0,
            xsizemode: 'pixel',
            ysizemode: 'pixel',
            line: {
              color: layout[axisName].tickcolor,
              width: layout[axisName].tickwidth,
              dash: 'solid'
            }
          })
        } else {
          shapes.push({
            type: 'line',
            x0: -layout[axisName].ticklen / 2,
            y0: 0,
            x1: layout[axisName].ticklen / 2,
            y1: 0,
            xanchor: 0,
            yanchor: vals[i],
            xsizemode: 'pixel',
            ysizemode: 'pixel',
            line: {
              color: 'black',
              width: layout[axisName].tickwidth,
              dash: 'solid'
            }
          })
        }
      }
    }

    return [annotations, shapes]
  }

  function gridLines (id, layout, direction) {
    const dataRange_ = dataRange(id)

    if (!direction) {
      const gridTracesx = gridLines(id, layout, 'x')
      const gridTracesy = gridLines(id, layout, 'y')
      return [...gridTracesx, ...gridTracesy]
    }

    const axisName = direction + 'axis'
    const gridTraces = []
    let showMajorGrid = layout[axisName].showgrid
    let showMinorGrid = layout[axisName].minor.showgrid
    if (showMajorGrid === false && showMinorGrid === false) {
      return gridTraces
    }

    let xMajor = majorTicks(id, 'x');
    let yMajor = majorTicks(id, 'y');
    let xMinor = minorTicks(id, 'x');
    let yMinor = minorTicks(id, 'y');
    const minX = dataRange_.x[0]
    const maxX = dataRange_.x[1]
    const minY = dataRange_.y[0]
    const maxY = dataRange_.y[1]

    if (showMajorGrid) {
      const attribs = {
        showlegend: false,
        mode: 'lines',
        hoverinfo: 'skip',
        line: {
          color: layout[axisName].gridcolor,
          width: layout[axisName].gridwidth,
          dash: layout[axisName].griddash
        }
      }
      if (direction === 'x') {
        for (let i = 0; i < xMajor.length; i++) {
          if (xMajor[i] !== 0 && xMajor[i] >= minX && xMajor[i] <= maxX) {
            //plotjs.log("major: ", xMajor[i])
            gridTraces.push({
              x: [xMajor[i], xMajor[i]],
              y: [minY, maxY],
              ...attribs
            })
          }
        }
      }
      if (direction === 'y') {
        for (let i = 0; i < yMajor.length; i++) {
          if (yMajor[i] !== 0 && yMajor[i] >= minY && yMajor[i] <= maxY) {
            //plotjs.log("major: ", yMajor[i])
            gridTraces.push({
              x: [minX, maxX],
              y: [yMajor[i], yMajor[i]],
              ...attribs
            })
          }
        }
      }
    }

    if (showMinorGrid) {
      const attribs = {
        showlegend: false,
        mode: 'lines',
        hoverinfo: 'skip',
        line: {
          color: layout[axisName].minor.gridcolor,
          width: layout[axisName].minor.gridwidth,
          dash: layout[axisName].minor.griddash
        }
      }
      if (direction === 'x') {
        for (let i = 0; i < xMinor.length; i++) {
          if (xMinor[i] !== 0 && xMinor[i] >= minX && xMinor[i] <= maxX) {
            //plotjs.log("minor: ", xMinor[i])
            gridTraces.push({
              x: [xMinor[i], xMinor[i]],
              y: [minY, maxY],
              ...attribs
            })
          }
        }
      }
      if (direction === 'y') {
        for (let i = 0; i < yMinor.length; i++) {
          if (yMinor[i] !== 0 && yMinor[i] >= minY && yMinor[i] <= maxY) {
            //plotjs.log("minor: ", yMinor[i])
            gridTraces.push({
              x: [minY, maxY],
              y: [yMinor[i], yMinor[i]],
              ...attribs
            })
          }
        }
      }
    }

    return gridTraces
  }
}
