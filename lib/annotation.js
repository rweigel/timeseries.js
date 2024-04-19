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

  let layoutNew = {}
  layoutNew.annotations = [...endAnnotations, ...labelAnnotations]
  layoutNew.shapes = tickShapes

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
    layoutNew = { ...layoutNew, ...layoutMods }
  }

  plotjs.log(`${domElement.id} calling Plotly.relayout()`, 'annotation')
  Plotly.relayout(plotjs.gcf(), layoutNew)
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

  function dataRange (id, direction) {
    const domElement = document.getElementById(id)
    if (dataRange[direction] !== undefined) {
      return dataRange[direction]
    }
    if (!direction) {
      return { x: dataRange(id, 'x'), y: dataRange(id, 'y') }
    }
    const data = domElement.data[0][direction]
    dataRange[direction] = [Math.min(...data), Math.max(...data)]
    return dataRange[direction]
  }

  function majorTicks (id, direction, labels) {
    const axisName = direction + 'axis'
    const domElement = document.getElementById(id)
    const _axis = domElement._fullLayout[axisName]
    let key = 'x' // x is used for direction = 'x' and 'y'.
    if (labels) {
      key = 'text'
    }
    const values = []
    for (const _val of _axis._vals) {
      if (!_val.minor) {
        if (labels) {
          let val = _val[key].replace('×', layout[axisName]._productsymbol)
          if (layout[axisName]._trimleadingzeros) {
            val = val.replace(/^0\./, '.')
          }
          values.push(val)
        } else {
          values.push(_val[key])
        }
      }
    }
    return values
  }

  function minorTicks (id, direction) {
    const axisName = direction + 'axis'
    const domElement = document.getElementById(id)
    const _axis = domElement._fullLayout[axisName]

    const values = []
    for (const _val of _axis._vals) {
      if (_val.minor) values.push(_val.x)
    }
    return values
  }

  function coordinateToPixelRatio (id, direction) {
    const last = plotjs.math.last
    const domElement = document.getElementById(id)
    const axis = domElement._fullLayout[direction + 'axis']
    let offset = 0
    let c2pRatio = 0

    const dPixels = axis.c2p(last(axis.range)) - axis.c2p(axis.range[0])
    const dValues = last(axis.range) - axis.range[0];

    if (0) {
      plotjs.log(`axis.range[0] = ${axis.range[0]}`, 'coordinateToPixelRatio')
      plotjs.log(`last(axis.range) = ${last(axis.range)}`, 'coordinateToPixelRatio')
      plotjs.log(`axis.c2p(axis.range[0]) = ${axis.c2p(axis.range[0])}`, 'coordinateToPixelRatio')
      plotjs.log(`axis.c2p(last(axis.range)) = ${axis.c2p(last(axis.range))}`, 'coordinateToPixelRatio')
      plotjs.log(`dValues = ${dValues}`, 'coordinateToPixelRatio')
      plotjs.log(`dPixels = ${dPixels}`, 'coordinateToPixelRatio')
    }
    if (direction === 'x') {
      offset = domElement._fullLayout.margin.l;
      //c2pRatio = (axis.c2p(axis.range[0]) + offset) / (axis.c2p(last(axis.range)) + offset);
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

    const last = plotjs.math.last
    let domElement = document.getElementById(id)

    const majorTickValues = {}
    const minorTickValues = {}
    const lastMinorTickStep = {}
    const lastGrid = {}
    for (const direction of ['x', 'y']) {
      // Arrow heads and axis labels
      minorTickValues[direction] = minorTicks(id, direction)
      lastMinorTickStep[direction] = last(minorTickValues[direction]) -
                                     minorTickValues[direction][minorTickValues[direction].length - 2];
      majorTickValues[direction] = majorTicks(id, 'x')
      lastGrid[direction] = Math.max(last(minorTickValues[direction]), last(majorTickValues[direction]));
    }

    // https://plotly.com/javascript/reference/layout/annotations/

    const xarrow = layout._annotations.xaxis.arrow
    if (xarrow.x === 'auto' || xarrow.x === undefined) {
      xarrow.x = lastGrid.x + lastMinorTickStep.x
    }
    if (xarrow.y === 'auto' || xarrow.y === undefined) {
      xarrow.y = 0
    }
    if (xarrow.ax === 'auto' || xarrow.ax === undefined) {
      const xrange = domElement._fullLayout.xaxis.range
      xarrow.ax = xrange[0] < 0 && dataRange(id, 'x')[0] >= 0 ? 0 : dataRange(id, 'x')[0]
    }
    if (xarrow.ay === 'auto' || xarrow.ay === undefined) {
      xarrow.ay = 0
    }

    const xlabel = layout._annotations.xaxis.label
    const xposition = layout._annotations.yaxis.label.position || 'inside'
    xlabel.showarrow = false
    if (xlabel.font === undefined) {
      xlabel.font = domElement._fullLayout.xaxis.tickfont || domElement._fullLayout.font
    }
    if (xlabel.x === 'auto' || xlabel.text === undefined) {
      xlabel.text = '$\\Large x$'
    }
    if (xlabel.x === 'auto' || xlabel.x === undefined) {
      xlabel.x = lastGrid.x + lastMinorTickStep.x / 2
      if (xposition === 'after') {
        xlabel.x = xarrow.x + coordinateToPixelRatio(id, 'x') * xlabel.font.size
      }
    }
    if (xlabel.y === 'auto' || xlabel.y === undefined) {
      xlabel.y = coordinateToPixelRatio(id, 'y') * xlabel.font.size * 1.2
      if (xposition === 'outside') {
        xlabel.y = -xlabel.y
      }
      if (xposition === 'after') {
        xlabel.y = 0
      }
    }

    const yarrow = layout._annotations.yaxis.arrow
    if (yarrow.x === 'auto' || yarrow.x === undefined) {
      yarrow.x = 0
    }
    if (yarrow.y === 'auto' || yarrow.y === undefined) {
      yarrow.y = lastGrid.y + lastMinorTickStep.y
    }
    if (yarrow.ax === 'auto' || yarrow.ax === undefined) {
      yarrow.ax = 0
    }
    if (yarrow.ay === 'auto' || yarrow.ay === undefined) {
      const yrange = domElement._fullLayout.yaxis.range
      yarrow.ay = yrange[0] < 0 && dataRange(id, 'y')[0] >= 0 ? 0 : dataRange(id, 'y')[0]
    }

    const ylabel = layout._annotations.yaxis.label
    const yposition = layout._annotations.yaxis.label.position || 'inside'
    ylabel.showarrow = false
    if (ylabel.font === undefined) {
      ylabel.font = domElement._fullLayout.yaxis.tickfont || domElement._fullLayout.font
    }
    if (ylabel.x === 'auto' || ylabel.text === undefined) {
      ylabel.text = '$\\Large y$'
    }
    if (ylabel.x === 'auto' || ylabel.x === undefined) {
      ylabel.x = coordinateToPixelRatio(id, 'x') * ylabel.font.size * 1.2
      if (yposition === 'outside') {
        ylabel.x = -ylabel.x
      }
      if (yposition === 'after') {
        ylabel.x = 0
      }
    }
    if (ylabel.y === 'auto' || ylabel.y === undefined) {
      ylabel.y = lastGrid.y + lastMinorTickStep.y / 2
      if (yposition === 'after') {
        ylabel.y = yarrow.y + coordinateToPixelRatio(id, 'y') * ylabel.font.size
      }
    }

    return [xlabel, xarrow, ylabel, yarrow]
  }

  function axisTicksAndLabels (id, layout, direction) {
    if (!direction) {
      const [annotationsx, shapesx] = axisTicksAndLabels(id, layout, 'x')
      const [annotationsy, shapesy] = axisTicksAndLabels(id, layout, 'y')
      return [[...annotationsx, ...annotationsy], [...shapesx, ...shapesy]]
    }

    const axisName = direction + 'axis'

    let showticklabels = layout[axisName].showticklabels
    if (showticklabels === undefined) {
      showticklabels = true
    }

    const annotations = []
    const shapes = []

    let _ticks = layout[axisName]._ticks
    if (_ticks === undefined) {
      _ticks = domElement._fullLayout[axisName].ticks
    }
    if (!['', 'inside', 'outside', 'centered'].includes(_ticks)) {
      _ticks = 'outside'
    }

    if (_ticks === '' && showticklabels === false) {
      plotjs.log(`${id} _ticks = '${_ticks}', showticklabels = ${showticklabels}. Returning.`, 'axisTicksAndLabels')
      return [annotations, shapes]
    }

    let _ticklabelposition = layout[axisName]._ticklabelposition
    if (!_ticklabelposition) {
      _ticklabelposition = domElement._fullLayout[axisName].ticklabelposition
    }
    if (!['inside', 'outside'].includes(_ticklabelposition)) {
      _ticklabelposition = 'outside'
    }

    const ticklen = domElement._fullLayout[axisName].ticklen

    let tickBottom = -ticklen / 2
    let tickTop = ticklen / 2
    if (_ticks === 'outside') {
      tickBottom = -ticklen
      tickTop = 0
    }
    if (_ticks === 'inside') {
      tickBottom = 0
      tickTop = tickBottom + ticklen
    }

    let c2pRatio = coordinateToPixelRatio(id, 'y')
    if (direction === 'y') {
      c2pRatio = coordinateToPixelRatio(id, 'y')
    }

    let anchorOffset = 0
    let xYAnchor, yXAnchor
    if (_ticklabelposition === 'outside') {
      xYAnchor = 'top'
      yXAnchor = 'right'
      if (_ticks === 'centered') {
        anchorOffset = -c2pRatio * ticklen / 2
      }
      if (_ticks === 'inside') {
        anchorOffset = 0
      }
      if (_ticks === 'outside') {
        anchorOffset = -c2pRatio * ticklen
      }
    }
    if (_ticklabelposition === 'inside') {
      xYAnchor = 'bottom'
      yXAnchor = 'left'
      if (_ticks === 'centered') {
        anchorOffset = c2pRatio * ticklen / 2
      }
      if (_ticks === 'inside') {
        anchorOffset = c2pRatio * ticklen
      }
      if (_ticks === 'outside') {
        anchorOffset = 0
      }
    }

    const majorTickValues = majorTicks(id, direction)
    const majorTickLabels = majorTicks(id, direction, 'labels')
    for (let i = 0; i < majorTickValues.length; i++) {
      if (majorTickValues[i] === 0) continue

      if (layout[axisName].showticklabels !== false) {
        if (direction === 'x') {
          annotations.push({
            text: majorTickLabels[i],
            font: domElement._fullLayout[axisName].font,
            x: majorTickValues[i] < 0 ? majorTickValues[i] - c2pRatio : majorTickValues[i],
            y: anchorOffset,
            xanchor: 'center',
            yanchor: xYAnchor,
            showarrow: false
          })
        } else {
          annotations.push({
            text: majorTickLabels[i],
            font: domElement._fullLayout[axisName].font,
            x: anchorOffset,
            y: majorTickValues[i] < 0 ? majorTickValues[i] - c2pRatio : majorTickValues[i],
            xanchor: yXAnchor,
            yanchor: 'center',
            showarrow: false
          })
        }
      }

      if (_ticks) {
        if (direction === 'x') {
          shapes.push({
            type: 'line',
            x0: 0,
            y0: tickBottom,
            x1: 0,
            y1: tickTop,
            xanchor: majorTickValues[i],
            yanchor: 0,
            xsizemode: 'pixel',
            ysizemode: 'pixel',
            line: {
              color: domElement._fullLayout[axisName].tickcolor,
              width: domElement._fullLayout[axisName].tickwidth,
              dash: 'solid'
            }
          })
        } else {
          shapes.push({
            type: 'line',
            x0: tickBottom,
            y0: 0,
            x1: tickTop,
            y1: 0,
            xanchor: 0,
            yanchor: majorTickValues[i],
            xsizemode: 'pixel',
            ysizemode: 'pixel',
            line: {
              color: domElement._fullLayout[axisName].tickcolor,
              width: domElement._fullLayout[axisName].tickwidth,
              dash: 'solid'
            }
          })
        }
      }
    }

    return [annotations, shapes]
  }

  function gridLines (id, layout, direction) {
    if (!direction) {
      const gridTracesx = gridLines(id, layout, 'x')
      const gridTracesy = gridLines(id, layout, 'y')
      return [...gridTracesx, ...gridTracesy]
    }

    const axisName = direction + 'axis'
    const gridTraces = []
    const showMajorGrid = layout[axisName].showgrid
    const showMinorGrid = layout[axisName].minor.showgrid
    if (showMajorGrid === false && showMinorGrid === false) {
      return gridTraces
    }

    const xMajor = majorTicks(id, 'x')
    const yMajor = majorTicks(id, 'y')
    const xMinor = minorTicks(id, 'x')
    const yMinor = minorTicks(id, 'y')
    const minX = dataRange(id, 'x')[0]
    const maxX = dataRange(id, 'x')[1]
    const minY = dataRange(id, 'y')[0]
    const maxY = dataRange(id, 'y')[1]

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
