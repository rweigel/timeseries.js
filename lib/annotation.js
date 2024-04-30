plotjs.annotation = {}

plotjs.annotation.set = function (id, cb) {
  layout = plotjs.util.deepCopy(plotjs.figure[id].layout)

  const domElement = document.getElementById(id)
  const _fullLayout = domElement._fullLayout

  plotjs.log(`${id}`,'annotation')

  xaxis = _fullLayout.xaxis
  yaxis = _fullLayout.yaxis
  width = xaxis.c2p(xaxis.range[1]) - xaxis.c2p(xaxis.range[0])
  height = yaxis.c2p(yaxis.range[0]) - yaxis.c2p(yaxis.range[1])
  plotjs.log(`${id} plot w x h = ${width} px x ${height} px`, 'annotation')

  let [labelAnnotations, tickShapes] = axisTicksAndLabels()

  plotjs.log(`${id} creating arrow`,'annotation')
  const arrow_ = arrow()

  plotjs.log(`${id} creating origin symbol`,'annotation')
  const originAnnotation = originSymbol()
  const annotations = [arrow_, ...labelAnnotations]
  if (originAnnotation !== null) {
    annotations.push(originAnnotation)
  }

  const layoutNew = {
    annotations: annotations,
    shapes: tickShapes,
    "xaxis.title.text": "",
    "xaxis.ticks": '',
    "xaxis.showticklabels": false,
    "xaxis.minor.ticks": '',
  }

  plotjs.log(`${id} setting annotation`,'annotation')
  Plotly.update(id, null, layoutNew)
    .then(
      () => {
        plotjs.log(`${id} annotation set`,'annotation')
        document.getElementById(id).style.display = 'inline-block'
        cb()
      })

  function arrow() {

    for (key of Object.keys(_fullLayout.margin)) {
      plotjs.log(`${id} margin ${key}: ${_fullLayout.margin[key]}`,'arrow')
    }

    plotjs.log(`${id} x rangemode:   ${xaxis.rangemode}`,'arrow')
    plotjs.log(`${id} x range[0]:    ${xaxis.range[0]}`,'arrow')
    plotjs.log(`${id} x range[0] px: ${xaxis.c2p(xaxis.range[0])}`,'arrow')
    plotjs.log(`${id} x range[0]:    ${xaxis.range[1]}`,'arrow')
    plotjs.log(`${id} x range[1] px: ${xaxis.c2p(xaxis.range[1])}`,'arrow')

    plotjs.log(`${id} y rangemode:   ${yaxis.rangemode}`,'arrow')
    plotjs.log(`${id} y range[0]:    ${yaxis.range[0]}`,'arrow')
    plotjs.log(`${id} y range[0] px: ${yaxis.c2p(yaxis.range[0])}`,'arrow')
    plotjs.log(`${id} y range[1]:    ${yaxis.range[1]}`,'arrow')
    plotjs.log(`${id} y range[1] px: ${yaxis.c2p(yaxis.range[1])}`,'arrow')
    if (yaxis.range[0] > 0) {
      plotjs.log(`${id} y range[0] > 0. No need to create arrow`,'arrow')
      return
    }

    let x = 1.0
    if (yaxis.range[0] > -coordinateToPixelRatio('yaxis')*yaxis.zerolinewidth) {
      if (yaxis.zeroline === true) {
        //plotjs.log(`${id} Special condition where zero line is clipped. We recover by extending tail.`,'arrow')
        //plotjs.log(`${id} `,'arrow')
        //x = 0
      }
    }

    const arrow = {
      ...layout._annotations.xaxis.arrow,
      text: layout.xaxis.title.text,
      font: xaxis.title.font,
      xanchor: 'right',
      yanchor: 'top',
      standoff: 0,
      borderpad: 0,
      captureevents: false,

      x: x,
      y: (height - yaxis.c2p(0))/height,
      xref: 'paper',
      yref: 'paper',

      ax: 1.1,
      ay: (height - yaxis.c2p(0))/height,
      axref: 'paper',
      ayref: 'paper',

      arrowside: 'start',
      startarrowhead: 3,
      arrowwidth: _fullLayout.yaxis.zerolinewidth,
      showarrow: true,
    }
    return arrow
  }

  function originSymbol () {

    if (layout._annotations.originsymbol._autohide && layout._annotations.originsymbol.visible === true) {
      if (_fullLayout.yaxis.range[0] >= 0) {
        plotjs.log(`${id} autohide condition for origin symbol. Not creating.`,'originSymbol')
        return null
      }
    }

    layout._annotations.originsymbol.x = xaxis.c2p(0)/width
    layout._annotations.originsymbol.y = (height - yaxis.c2p(0))/height

    return layout._annotations.originsymbol
  }

  function axisTicksAndLabels (axis) {
    if (!axis) {
      const [annotationsx, shapesx] = axisTicksAndLabels('xaxis')
      const [annotationsy, shapesy] = axisTicksAndLabels('xaxis')
      return [[...annotationsx, ...annotationsy], [...shapesx, ...shapesy]]
    }

    let showticklabels = layout[axis].showticklabels
    if (showticklabels === undefined) {
      showticklabels = true
    }

    const annotations = []
    const shapes = []

    let _ticks = layout[axis]._ticks
    if (_ticks === undefined) {
      _ticks = _fullLayout[axis].ticks
    }
    if (!['', 'inside', 'outside', 'centered'].includes(_ticks)) {
      _ticks = 'outside'
    }

    if (_ticks === '' && showticklabels === false) {
      plotjs.log(`${id} _ticks = '${_ticks}', showticklabels = ${showticklabels}. Returning.`, 'axisTicksAndLabels')
      return [annotations, shapes]
    }

    let _ticklabelposition = layout[axis]._ticklabelposition
    if (!_ticklabelposition) {
      _ticklabelposition = _fullLayout[axis].ticklabelposition
    }
    if (!['inside', 'outside'].includes(_ticklabelposition)) {
      _ticklabelposition = 'outside'
    }

    let ticklen = layout[axis].ticklen || 0

    let c2pRatio = coordinateToPixelRatio(axis)

    let xYAnchor = 'top'
    if (_ticklabelposition === 'outside') {
      xYAnchor = 'top'
    }
    if (_ticklabelposition === 'inside') {
      xYAnchor = 'bottom'
    }

    xaxis = _fullLayout.xaxis
    yaxis = _fullLayout.yaxis
    width = xaxis.c2p(xaxis.range[1]) - xaxis.c2p(xaxis.range[0])
    height = yaxis.c2p(yaxis.range[0]) - yaxis.c2p(yaxis.range[1])
    plotjs.log(`${id}/${axis} c2pRatio = ${c2pRatio}`, 'axisTicksAndLabels')

    const majorTickValues = majorTicks(axis)
    const majorTickLabels = majorTicks(axis, 'labels')
    plotjs.log(`${id}/${axis} major tick values: ${JSON.stringify(majorTickValues)}`, 'axisTicksAndLabels')
    plotjs.log(`${id}/${axis} major tick labels: ${JSON.stringify(majorTickLabels)}`, 'axisTicksAndLabels')
    for (let i = 0; i < majorTickValues.length; i++) {
      let deltap = ticklen/2 // Tick length for on positive side
      let deltan = ticklen/2 // Tick length for on negative side
      if (_ticks === 'outside') {
        deltap = 0
        deltan = ticklen
      }
      if (_ticks === 'inside') {
        deltap = ticklen
        deltan = 0
      }
      if (layout[axis].showticklabels !== false) {
        let msg = `'${majorTickLabels[i]}' at ${majorTickValues[i]}`
        let showZeroLabel = true
        if (majorTickValues[i] === 0) {
          if (layout[axis]._zeroticklabel === false) {
            showZeroLabel = false
          }
          if (axis === 'xaxis' && _fullLayout['yaxis'].range[0] < 0) {
            showZeroLabel = false
          }
          plotjs.log(`${id}/${axis} skipping text ${msg}`, 'axisTicksAndLabels')
        } else {
          plotjs.log(`${id}/${axis} setting text ${msg}`, 'axisTicksAndLabels')
        }
        if (axis === 'xaxis' && showZeroLabel === true) {
          annotations.push({
            text: majorTickLabels[i],
            font: _fullLayout[axis].font,
            x: majorTickValues[i],
            y: (height - yaxis.c2p(0) - deltan)/height,
            yref: 'paper',
            xanchor: 'center',
            yanchor: xYAnchor,
            showarrow: false,
            standoff: 0,
            borderpad: 0,
            startstandoff: 0
          })
        }
      }

      if (_ticks) {
        if (layout[axis]._zerotick === false && majorTickValues[i] === 0) {
          plotjs.log(`${id}/${axis} _zerotick == false; skipping zero tick`, 'axisTicksAndLabels')
          continue
        }
        if (axis === 'xaxis') {
          plotjs.log(`${id}/${axis} setting major tick at ${majorTickValues[i]}`,'axisTicksAndLabels')
          shapes.push({
            type: 'line',
            x0: majorTickValues[i],
            y0: (height - yaxis.c2p(0) + deltap)/height,
            x1: majorTickValues[i],
            y1: (height - yaxis.c2p(0) - deltan)/height,
            yref: 'paper',
            line: {
              color: _fullLayout[axis].tickcolor || 'black',
              width: _fullLayout[axis].tickwidth || 1,
              dash: 'solid'
            }
          })
        }
      }
    }

    _ticks = layout[axis].minor_ticks
    if (_ticks === undefined) {
      _ticks = _fullLayout[axis].ticks
    }
    if (!['', 'inside', 'outside', 'centered'].includes(_ticks)) {
      _ticks = 'outside'
    }
    ticklen = layout[axis].minor.ticklen || 0

    const minorTickValues = minorTicks(axis)
    for (let i = 0; i < minorTickValues.length; i++) {
      plotjs.log(`${id}/${axis} setting minor tick at ${minorTickValues[i]}`, 'axisTicksAndLabels')
      let deltap = ticklen/2 // Tick length for on positive side
      let deltan = ticklen/2 // Tick length for on negative side
      if (_ticks === 'outside') {
        deltap = 0
        deltan = ticklen
      }
      if (_ticks === 'inside') {
        deltap = ticklen
        deltan = 0
      }
      if (axis === 'xaxis') {
        shapes.push({
          type: 'line',
          x0: minorTickValues[i],
          y0: (height - yaxis.c2p(0) + deltap)/height,
          x1: minorTickValues[i],
          y1: (height - yaxis.c2p(0) - deltan)/height,
          yref: 'paper',
          line: {
            color: _fullLayout[axis].minor.tickcolor || 'black',
            width: _fullLayout[axis].minor.tickwidth || 1,
            dash: 'solid'
          }
        })
      }
    }
    return [annotations, shapes]
  }

  function axisArrowsAndLabels (range) {
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
      if (layout.xaxis._truncatezerolines && dataRange('x')[0] >= 0) {
        xarrow.ax = -coordinateToPixelRatio('x') * layout._annotations.xaxis.arrow.arrowwidth / 2
      }
    }
    if (xarrow.ay === undefined) {
      xarrow.ay = xarrow.y
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
      yarrow.ax = yarrow.x
    }
    if (yarrow.ay === undefined) {
      yarrow.ay = range.y[0]
      if (layout.yaxis._truncatezerolines && dataRange('y')[0] >= 0) {
        yarrow.ay = -coordinateToPixelRatio('y') * layout._annotations.yaxis.arrow.arrowwidth / 2
      }
    }

    const label = {}
    for (const dir of ['x', 'y']) {
      const dirName = dir + 'axis'
      label[dir] = layout._annotations[dirName].arrowlabel
      label[dir].showarrow = false
      label[dir].font = _fullLayout[dirName].title.font
      if (!_fullLayoutOrig[dirName].title.text.startsWith('Click to')) {
        label[dir].text = _fullLayout[dirName].title.text
      } else {
        label[dir].text = ''
      }
    }

    const xposition = layout._annotations.xaxis.arrowlabel._position || 'inside'
    if (label.x) {
      let shifty = 0
      if (!label.x.text.trim().startsWith('$')) {
        // Non-MathJax text has extra padding on top and bottom. Bounding
        // box does not exactly fit text. See https://codepen.io/rweigel/pen/VwNgzPL
        shifty = coordinateToPixelRatio('y') * label.x.font.size / 3
      }
      label.x.x = range.x[1]
      label.x.y = coordinateToPixelRatio('y') * label.x.font.size / 2 - shifty
      label.x.xanchor = 'right'
      label.x.yanchor = 'bottom'
      if (xposition === 'outside') {
        label.x.xanchor = 'right'
        label.x.yanchor = 'top'
        label.x.y = -label.x.y
      }
      if (xposition === 'after') {
        label.x.xanchor = 'left'
        label.x.yanchor = 'middle'
        label.x.x = range.x[1] + coordinateToPixelRatio('x') * label.x.font.size / 4
        // 2 pixel change is to account for fact that a hyphen is not centered
        // on horizontal line. Not sure if this is a bug in Plotly.
        label.x.y = 2 * coordinateToPixelRatio('y')
      }
    }

    const yposition = layout._annotations.yaxis.arrowlabel._position || 'inside'
    if (label.y) {
      let shifty = 0
      if (!label.y.text.trim().startsWith('$')) {
        shifty = coordinateToPixelRatio('y') * label.y.font.size / 2
      }
      label.y.x = coordinateToPixelRatio('x') * label.y.font.size / 2
      label.y.y = range.y[1] + shifty
      label.y.xanchor = 'left'
      label.y.yanchor = 'top'
      if (yposition === 'outside') {
        label.y.x = -label.y.x
        label.y.xanchor = 'right'
        label.y.yanchor = 'top'
      }
      if (yposition === 'after') {
        label.y.xanchor = 'middle'
        label.y.yanchor = 'bottom'
        label.y.y = range.y[1] + coordinateToPixelRatio('y') * label.y.font.size / 4
        label.y.x = 0
      }
    }
    if (range.x[0] >= 0 && range.y[0] >= 0) {
      if (layout._annotations.originsymbol._autohide === true) {
        layout._annotations.originsymbol.visible = false
      }
    }
    return [label.x, xarrow, label.y, yarrow, layout._annotations.originsymbol]
  }

  function majorTicks (axisName, labels) {
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

  function minorTicks (axisName) {
    const _axis = _fullLayout[axisName]

    const values = []
    for (const _val of _axis._vals) {
      if (_val.minor) values.push(_val.x)
    }
    return values
  }

  function coordinateToPixelRatio (axisName) {
    const last = plotjs.math.last
    const axis = _fullLayout[axisName]
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
    if (axisName === 'xaxis') {
      c2pRatio = dValues / dPixels
    }
    if (axisName === 'yaxis') {
      c2pRatio = -dValues / dPixels
    }
    if (0) {
      plotjs.log(`axis = ${axisName}, c2pRatio = ${c2pRatio}`, 'coordinateToPixelRatio')
    }
    return c2pRatio
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

  function allTicks (axisName) {
    const axis = _fullLayout[axisName]
    const values = []
    for (const _val of axis._vals) {
      values.push(_val.x)
    }
    values.sort(function (a, b) { return a - b })
    return values
  }
}
