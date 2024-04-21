plotjs.annotation = {}

plotjs.annotation.set = function (id, x, y, layout, config) {
  layout = plotjs.util.deepCopy(layout)

  const domElement = document.getElementById(id)
  const _fullLayout = domElement._fullLayout

  plotjs.log(`${domElement.id}`, 'annotation')
  plotjs.log(`${domElement.id} fullLayout after initial render:`, 'annotation')
  plotjs.log(_fullLayout, 'annotation')

  // Number of traces before annotation traces are added
  const nTraces = domElement.data.length

  // Need to set after newPlot() because range is needed.
  let range = adjustedRange()
  const endAnnotations = axisArrowsAndLabels(range)

  // Need to set ticks and labels after Plotly.newPlot() so that
  // the coordinate to pixel ratios can be calculated.
  const [labelAnnotations, tickShapes] = axisTicksAndLabels(layout)

  const layoutNew = {
    annotations: [...endAnnotations, ...labelAnnotations],
    shapes: tickShapes,
    xaxis: {
      ...layout.xaxis,
      showline: false,
      ticks: '',
      showticklabels: false,
      autorange: true,
      zeroline: false,
      showgrid: true,
      minor: {
        ...layout.xaxis.minor,
        showgrid: true
      }
    },
    yaxis: {
      ...layout.yaxis,
      showline: false,
      ticks: '',
      showticklabels: false,
      autorange: true,
      zeroline: false,
      showgrid: true,
      minor: {
        ...layout.yaxis.minor,
        showgrid: true
      }
    }
  }

  plotjs.log(`${domElement.id} calling Plotly.relayout() to set annotations`, 'annotation')
  Plotly.relayout(domElement.id, plotjs.util.deepCopy(layoutNew))
    .then(() => {
      const domElement = document.getElementById(id)
      const _fullLayout = domElement._fullLayout
      const msg = `${domElement.id} ${_fullLayout['yaxis'].range} called Plotly.relayout() to set annotations callback`
      plotjs.log(msg, 'annotation')
      domElement.style.display = ''
    })

  function axisArrowsAndLabels (range) {
    // We don't use Plotly's zeroline because it will extend past the axis
    // arrow annotation. We add the zero lines after Plotly.newPlot() is
    // called because we need the axes ranges.

    const _fullLayout = domElement._fullLayout

    const last = plotjs.math.last
    // https://plotly.com/javascript/reference/layout/annotations/

    const xarrow = layout._annotations.xaxis.arrow
    if (xarrow.x === 'auto' || xarrow.x === undefined) {
      xarrow.x = range.x[1]
    }
    if (xarrow.y === 'auto' || xarrow.y === undefined) {
      xarrow.y = 0
    }
    if (xarrow.ax === 'auto' || xarrow.ax === undefined) {
      xarrow.ax = range.x[0]
    }
    if (xarrow.ay === 'auto' || xarrow.ay === undefined) {
      xarrow.ay = 0
    }

    const yarrow = layout._annotations.yaxis.arrow
    if (yarrow.x === 'auto' || yarrow.x === undefined) {
      yarrow.x = 0
    }
    if (yarrow.y === 'auto' || yarrow.y === undefined) {
      yarrow.y = range.y[1]
    }
    if (yarrow.ax === 'auto' || yarrow.ax === undefined) {
      yarrow.ax = 0
    }
    if (yarrow.ay === 'auto' || yarrow.ay === undefined) {
      yarrow.ay = range.y[0]
    }

    const xlabel = layout._annotations.xaxis.label
    const xposition = layout._annotations.xaxis.label.position || 'inside'
    xlabel.showarrow = false
    if (xlabel.font === undefined) {
      xlabel.font = _fullLayout.xaxis.tickfont || _fullLayout.font
    }
    if (xlabel.x === 'auto' || xlabel.text === undefined) {
      xlabel.text = '$\\Large x$'
    }
    if (xlabel.x === 'auto' || xlabel.x === undefined) {
      // Extra space for the x label to account for large numbers on the x-axis
      // when xposition = 'outside'. Could be improved by calculating the width
      // of the x-axis numbers.
      xlabel.x = range.x[1] + coordinateToPixelRatio('x') * xlabel.font.size
      xlabel.y = coordinateToPixelRatio('y') * xlabel.font.size / 2
      if (xposition === 'outside') {
        xlabel.xanchor = 'right'
        xlabel.yanchor = 'top'
        xlabel.y = -xlabel.y
      }
      if (xposition === 'after') {
        xlabel.xanchor = 'left'
        xlabel.yanchor = 'center'
        xlabel.x = range.x[1] + coordinateToPixelRatio('x') * xlabel.font.size / 4
        xlabel.y = 0
      }
    }

    const ylabel = layout._annotations.yaxis.label
    const yposition = layout._annotations.yaxis.label.position || 'inside'
    ylabel.showarrow = false
    if (ylabel.font === undefined) {
      ylabel.font = _fullLayout.yaxis.tickfont || _fullLayout.font
    }
    if (ylabel.x === 'auto' || ylabel.text === undefined) {
      ylabel.text = '$\\Large y$'
    }
    if (ylabel.x === 'auto' || ylabel.x === undefined) {
      ylabel.x = coordinateToPixelRatio('y') * ylabel.font.size
      ylabel.y = range.y[1]
      if (yposition === 'outside') {
        ylabel.x = -ylabel.x
      }
      if (yposition === 'after') {
        ylabel.xanchor = 'center'
        ylabel.yanchor = 'bottom'
        ylabel.y = range.y[1] + coordinateToPixelRatio('y') * ylabel.font.size / 4
        ylabel.x = 0
      }
    }

    return [xlabel, xarrow, ylabel, yarrow]
  }

  function axisTicksAndLabels (layout, direction) {
    if (!direction) {
      const [annotationsx, shapesx] = axisTicksAndLabels(layout, 'x')
      const [annotationsy, shapesy] = axisTicksAndLabels(layout, 'y')
      return [[...annotationsx, ...annotationsy], [...shapesx, ...shapesy]]
    }
    const _fullLayout = domElement._fullLayout

    const axisName = direction + 'axis'

    let showticklabels = layout[axisName].showticklabels
    if (showticklabels === undefined) {
      showticklabels = true
    }

    const annotations = []
    const shapes = []

    let _ticks = layout[axisName]._ticks
    if (_ticks === undefined) {
      _ticks = _fullLayout[axisName].ticks
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
      _ticklabelposition = _fullLayout[axisName].ticklabelposition
    }
    if (!['inside', 'outside'].includes(_ticklabelposition)) {
      _ticklabelposition = 'outside'
    }

    const ticklen = _fullLayout[axisName].ticklen

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

    let c2pRatio = coordinateToPixelRatio('y')
    if (direction === 'y') {
      c2pRatio = coordinateToPixelRatio('x')
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

    const majorTickValues = majorTicks(direction)
    const majorTickLabels = majorTicks(direction, 'labels')
    for (let i = 0; i < majorTickValues.length; i++) {
      if (majorTickValues[i] === 0) continue

      if (layout[axisName].showticklabels !== false) {
        if (direction === 'x') {
          annotations.push({
            text: majorTickLabels[i],
            font: _fullLayout[axisName].font,
            x: majorTickValues[i] < 0 ? majorTickValues[i] - c2pRatio : majorTickValues[i],
            y: anchorOffset,
            xanchor: 'center',
            yanchor: xYAnchor,
            showarrow: false
          })
        } else {
          annotations.push({
            text: majorTickLabels[i],
            font: _fullLayout[axisName].font,
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
              color: _fullLayout[axisName].tickcolor || 'black',
              width: _fullLayout[axisName].tickwidth || 1,
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
              color: _fullLayout[axisName].tickcolor || 'black',
              width: _fullLayout[axisName].tickwidth || 1,
              dash: 'solid'
            }
          })
        }
      }
    }

    return [annotations, shapes]
  }

  function dataRange (direction) {
    if (dataRange[direction] !== undefined) {
      return dataRange[direction]
    }
    if (!direction) {
      return { x: dataRange('x'), y: dataRange('y') }
    }
    const data = domElement.data[0][direction]
    dataRange[direction] = [Math.min(...data), Math.max(...data)]
    return dataRange[direction]
  }

  function adjustedRange () {
    const range = {}
    for (const dir of ['x', 'y']) {
      const allTicks_ = allTicks(dir)
      // first/last means grid line associated with lowest/highest value on axis
      plotjs.log(`${domElement.id}/${dir} datarange = ${dataRange(dir)}`, 'adjustedRange')
      plotjs.log(`${domElement.id}/${dir} range = ${axisRange(dir)}`, 'adjustedRange')
      plotjs.log(`${domElement.id}/${dir} all ticks = ${allTicks_}`, 'adjustedRange')

      const firstTickDelta = allTicks_[1] - allTicks_[0]
      const lastTickDelta = allTicks_[allTicks_.length - 1] -
                            allTicks_[allTicks_.length - 2]
      plotjs.log(`${domElement.id}/${dir} firstTickDelta = ${firstTickDelta}`, 'adjustedRange')
      plotjs.log(`${domElement.id}/${dir} lastTickDelta = ${lastTickDelta}`, 'adjustedRange')

      const first = allTicks_[0] - lastTickDelta
      const last = allTicks_[allTicks_.length - 1] + lastTickDelta

      range[dir] = [first, last]
      plotjs.log(`${domElement.id}/${dir} old range = ${axisRange(dir)}`, 'adjustedRange')
      plotjs.log(`${domElement.id}/${dir} new range = ${range[dir]}`, 'adjustedRange')
    }
    return range
  }

  function allTicks (direction) {
    const _fullLayout = domElement._fullLayout
    const axisName = direction + 'axis'
    const axis = _fullLayout[axisName]
    const values = []
    for (const _val of axis._vals) {
      values.push(_val.x)
    }
    values.sort(function (a, b) { return a - b })
    return values
  }

  function axisRange (direction) {
    if (axisRange[direction] !== undefined) {
      return axisRange[direction]
    }
    if (!direction) {
      return { x: axisRange('x'), y: axisRange('y') }
    }
    const _fullLayout = domElement._fullLayout
    const axisName = direction + 'axis'
    axisRange[direction] = _fullLayout[axisName].range
    return axisRange[direction]
  }

  function majorTicks (direction, labels) {
    const axisName = direction + 'axis'
    const _fullLayout = domElement._fullLayout
    const axis = _fullLayout[axisName]
    let key = 'x' // x is used for direction = 'x' and 'y'.
    if (labels) {
      key = 'text'
    }
    const values = []
    for (const _val of axis._vals) {
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

  function minorTicks (direction) {
    const axisName = direction + 'axis'
    const _fullLayout = domElement._fullLayout
    const _axis = _fullLayout[axisName]

    const values = []
    for (const _val of _axis._vals) {
      if (_val.minor) values.push(_val.x)
    }
    return values
  }

  function coordinateToPixelRatio (direction) {
    const last = plotjs.math.last
    const _fullLayout = domElement._fullLayout
    const axis = _fullLayout[direction + 'axis']
    let offset = 0
    let c2pRatio = 0

    const dPixels = axis.c2p(last(axis.range)) - axis.c2p(axis.range[0])
    const dValues = last(axis.range) - axis.range[0]

    if (0) {
      plotjs.log(`axis.range[0] = ${axis.range[0]}`, 'coordinateToPixelRatio')
      plotjs.log(`last(axis.range) = ${last(axis.range)}`, 'coordinateToPixelRatio')
      plotjs.log(`axis.c2p(axis.range[0]) = ${axis.c2p(axis.range[0])}`, 'coordinateToPixelRatio')
      plotjs.log(`axis.c2p(last(axis.range)) = ${axis.c2p(last(axis.range))}`, 'coordinateToPixelRatio')
      plotjs.log(`dValues = ${dValues}`, 'coordinateToPixelRatio')
      plotjs.log(`dPixels = ${dPixels}`, 'coordinateToPixelRatio')
    }
    if (direction === 'x') {
      offset = _fullLayout.margin.l
      c2pRatio = dValues / dPixels
    }
    if (direction === 'y') {
      c2pRatio = -dValues / dPixels
    }
    if (0) {
      plotjs.log(`direction = ${direction}, c2pRatio = ${c2pRatio}, offset = ${offset}`, 'coordinateToPixelRatio')
    }
    return c2pRatio
  }
}
