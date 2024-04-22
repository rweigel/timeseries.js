plotjs.annotation = {}

plotjs.annotation.set = function (id, x, y, layout, config) {
  layout = plotjs.util.deepCopy(layout)

  const domElement = document.getElementById(id)
  const _fullLayout = domElement._fullLayout

  plotjs.log(`${domElement.id}`, 'annotation')
  plotjs.log(`${domElement.id} fullLayout after initial render:`, 'annotation')
  plotjs.log(_fullLayout, 'annotation')

  // Need to set after newPlot() because range is needed.
  const range = adjustedRange()
  const axisAnnotations = axisArrowsAndLabels(range)

  // Need to set ticks and labels after Plotly.newPlot() so that
  // the coordinate to pixel ratios can be calculated.
  const [labelAnnotations, tickShapes] = axisTicksAndLabels(layout)

  const layoutNew = {
    annotations: [...axisAnnotations, ...labelAnnotations],
    shapes: tickShapes,
    xaxis: {
      ...layout.xaxis,
      showline: false,
      text: undefined,
      title: undefined,
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
      text: undefined,
      title: undefined,
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
      const msg = `${domElement.id} called Plotly.relayout() to set annotations callback`
      plotjs.log(msg, 'annotation')
      domElement.style.display = ''
    })

  function axisArrowsAndLabels (range) {
    // We don't use Plotly's zeroline because it will extend past the axis
    // arrow annotation. We add the zero lines after Plotly.newPlot() is
    // called because we need the axes ranges.

    const last = plotjs.math.last
    // https://plotly.com/javascript/reference/layout/annotations/

    const xarrow = layout._annotations.xaxis.arrow
    xarrow.text = '' // Needed or else space between end and ax value set below.

    if (xarrow.x === undefined) {
      xarrow.x = range.x[1]
    }
    if (xarrow.y === undefined) {
      xarrow.y = 0
    }
    if (xarrow.ax === undefined) {
      xarrow.ax = range.x[0]
    }
    if (xarrow.ay === undefined) {
      xarrow.ay = 0
    }

    const yarrow = layout._annotations.yaxis.arrow
    yarrow.text = '' // Needed or else space between end and ax value set below.
    if (yarrow.x === undefined) {
      yarrow.x = 0
    }
    if (yarrow.y === undefined) {
      yarrow.y = range.y[1]
    }
    if (yarrow.ax === undefined) {
      yarrow.ax = 0
    }
    if (yarrow.ay === undefined) {
      yarrow.ay = range.y[0]
    }

    const label = {}
    for (const dir of ['x', 'y']) {
      const dirName = dir + 'axis'
      label[dir] = layout._annotations[dirName].label
      label[dir].showarrow = false
      label[dir].font = _fullLayout[dirName].title.font
      console.log(_fullLayout[dirName].title)
      if (!_fullLayout[dirName].title.text.startsWith('Click to')) {
        label[dir].text = _fullLayout[dirName].title.text
      } else {
        label[dir].text = ''
      }
    }
    const xposition = layout._annotations.xaxis.label._position || 'inside'
    if (label.x) {
      // Extra space for the x label to account for large numbers on the x-axis
      // when xposition = 'outside'. Could be improved by calculating the width
      // of the x-axis numbers.
      label.x.x = range.x[1] + coordinateToPixelRatio('x') * label.x.font.size / 2
      label.x.y = coordinateToPixelRatio('y') * label.x.font.size / 4
      label.x.xanchor = 'right'
      label.x.yanchor = 'bottom'
      if (xposition === 'outside') {
        label.x.xanchor = 'right'
        label.x.yanchor = 'top'
        label.x.y = -label.x.y
      }
      if (xposition === 'after') {
        label.x.xanchor = 'left'
        label.x.yanchor = 'center'
        label.x.x = range.x[1] + coordinateToPixelRatio('x') * label.x.font.size / 4
        // 2 pixel change is to account for fact that a hyphen is not centered
        // on horizontal line. Not sure if this is a bug in Plotly or a feature.
        label.x.y = 2 * coordinateToPixelRatio('y')
      }
    }

    const yposition = layout._annotations.yaxis.label._position || 'inside'
    if (label.y) {
      label.y.x = coordinateToPixelRatio('x') * label.y.font.size / 2
      label.y.y = range.y[1] + coordinateToPixelRatio('y') * label.y.font.size / 2
      label.y.xanchor = 'left'
      label.y.yanchor = 'top'
      if (yposition === 'outside') {
        label.y.x = -label.y.x
        label.y.xanchor = 'right'
        label.y.yanchor = 'top'
      }
      if (yposition === 'after') {
        label.y.xanchor = 'center'
        label.y.yanchor = 'bottom'
        label.y.y = range.y[1] + coordinateToPixelRatio('y') * label.y.font.size / 4
        label.y.x = 0
      }
    }

    console.log([label.x, xarrow, label.y, yarrow])
    return [label.x, xarrow, label.y, yarrow]
  }

  function axisTicksAndLabels (layout, direction) {
    if (!direction) {
      const [annotationsx, shapesx] = axisTicksAndLabels(layout, 'x')
      const [annotationsy, shapesy] = axisTicksAndLabels(layout, 'y')
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
    // Adjust the range to include the first and last grid lines. The new
    // range bounds are used to determine the ends of the axis lines.
    const range = {}
    for (const dir of ['x', 'y']) {
      const allTicks_ = allTicks(dir)
      // first/last means grid line associated with lowest/highest value on axis
      plotjs.log(`${domElement.id}/${dir} data range = ${dataRange(dir)}`, 'adjustedRange')
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

  function allTicks (direction) {
    const axisName = direction + 'axis'
    const axis = _fullLayout[axisName]
    const values = []
    for (const _val of axis._vals) {
      values.push(_val.x)
    }
    values.sort(function (a, b) { return a - b })
    return values
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
