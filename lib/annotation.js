plotjs.annotation = {}

plotjs.annotation.set = function (id, cb) {
  const layout = plotjs.util.deepCopy(plotjs.figure[id].layout)

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
  const axisArrowAnnotations = axisArrowsAndLabels()

  plotjs.log(`${id} creating origin symbol`,'annotation')
  const originAnnotation = originSymbol()
  const annotations = [...axisArrowAnnotations.slice(0,2), ...labelAnnotations]
  if (originAnnotation !== null) {
    annotations.push(originAnnotation)
  }

  const layoutNew = {
    annotations: annotations,
    shapes: [...tickShapes, ...axisArrowAnnotations[2]],
    "xaxis.title.text": "",
    "xaxis.ticks": '',
    "xaxis.showticklabels": false,
    "xaxis.minor.ticks": ''
  }

  plotjs.log(`${id} setting annotation`,'annotation')
  Plotly.update(id, null, layoutNew)
    .then(
      () => {
        plotjs.log(`${id} annotation set`,'annotation')
        document.getElementById(id).style.display = 'inline-block'
        cb()
      })

  function axisArrowsAndLabels() {

    for (key of Object.keys(_fullLayout.margin)) {
      plotjs.log(`${id} margin ${key}: ${_fullLayout.margin[key]}`,'arrow')
    }
    for (key of Object.keys(_fullLayout._size)) {
      plotjs.log(`${id} _size ${key}: ${_fullLayout._size[key]}`,'arrow')
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

    //let x = xaxis.c2p(xaxis.range[0])
    let x = 1.00
    if (yaxis.range[0] > -coordinateToPixelRatio('yaxis')*yaxis.zerolinewidth) {
      if (yaxis.zeroline === true) {
        //plotjs.log(`${id} Special condition where zero line is clipped. We recover by extending tail.`,'arrow')
        //plotjs.log(`${id} `,'arrow')
        //x = 0
      }
    }

    const axisArrow = {
      ...layout._annotations.xaxis.arrow,
      text: '',
      standoff: 0,
      borderpad: 0,
      captureevents: false,

      x: x,
      y: (height - yaxis.c2p(0.0))/height,
      xref: 'paper',
      yref: 'paper',

      ax: 1.1,
      ay: (height - yaxis.c2p(0.0))/height,
      axref: 'paper',
      ayref: 'paper',

      arrowside: 'start',
      startarrowhead: 3,
      arrowwidth: layout._annotations.xaxis.arrow.arrowwidth,
      showarrow: true,
    }

    let shapes = []
    // We need to draw the zero line because the zero line
    // drawn by Plotly does not exactly match the arrow.
    // Note that 'between' does not work, but may in a future version:
    // https://github.com/plotly/plotly.js/pull/6927
    if (1) {
    shapes.push({
      type: 'line',
      layer: 'above',
      x0: 0,
      y0: (height - yaxis.c2p(0))/height,
      x1: 1,
      y1: (height - yaxis.c2p(0))/height,
      xref: 'paper',
      yref: 'paper',
      line: {
        color: 'red',//_fullLayout['xaxis'].tickcolor || 'black',
        width: layout._annotations.xaxis.arrow.arrowwidth,
        dash: 'solid'
      }
    })
    }

    let text = layout._annotations.xaxis.arrowlabel.text || layout.xaxis.title.text
    let fontSize = layout._annotations.xaxis.arrowlabel.font.size
    let shiftyCorrection = 0
    if (!text.trim().startsWith('$')) {
      // Non-MathJax text has extra padding on top and bottom. Bounding
      // box does not exactly fit text. See https://codepen.io/rweigel/pen/VwNgzPL
      shiftyCorrection = -fontSize / 3
    }
    let xanchor = 'right'
    let yanchor = 'bottom'
    let shifty = layout._annotations.xaxis.arrow.arrowwidth + fontSize / 2 + shiftyCorrection
    if (layout._annotations.xaxis.arrowlabel._position === 'outside') {
      shifty = -shifty
      xanchor = 'right'
      yanchor = 'top'
    }
    if (layout._annotations.xaxis.arrowlabel._position === 'after') {
      shifty = 2
      if (text.trim().startsWith('$')) {
        shifty = 0
      }
      xanchor = 'left'
      yanchor = 'middle'
    }

    const arrowLabel = {
      standoff: 0,
      borderpad: 0,
      captureevents: false,
      x: 1.1,
      y: (height - yaxis.c2p(0) + shifty)/height,
      xref: 'paper',
      yref: 'paper',
      xanchor: xanchor,
      yanchor: yanchor,
      showarrow: false,
      text: text,
      ...layout._annotations.xaxis.arrowlabel
    }

    return [axisArrow, arrowLabel, shapes]
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
    plotjs.log(`${id}/${axis} c2pRatio = ${c2pRatio}`, 'axisTicksAndLabels')

    const majorTickValues = majorTicks(axis)
    const majorTickLabels = majorTicks(axis, 'labels')
    let msg1 = `${id}/${axis} major tick values: ${JSON.stringify(majorTickValues)}`
    let msg2 = `${id}/${axis} major tick labels: ${JSON.stringify(majorTickLabels)}`
    plotjs.log(msg1, 'axisTicksAndLabels')
    plotjs.log(msg2, 'axisTicksAndLabels')
    for (let i = 0; i < majorTickValues.length; i++) {
      let deltaTickPos = 0 // Tick length for on positive side
      let deltaTickNeg = 0 // Tick length for on negative side
      let detlaLabel = 0
      if (_ticks === 'centered') {
        deltaTickPos = ticklen/2
        deltaTickNeg = ticklen/2
        if (_ticklabelposition === 'outside') {
          deltaLabel = -ticklen/2
        }
        if (_ticklabelposition === 'inside') {
          deltaLabel = ticklen/2
        }
      }
      if (_ticks === 'outside') {
        deltaTickPos = 0
        deltaTickNeg = ticklen
        if (_ticklabelposition === 'outside') {
          deltaLabel = -ticklen
        }
        if (_ticklabelposition === 'inside') {
          deltaLabel = 0
        }
      }
      if (_ticks === 'inside') {
        deltaTickPos = ticklen
        deltaTickNeg = 0
        if (_ticklabelposition === 'outside') {
          deltaLabel = 0
        }
        if (_ticklabelposition === 'inside') {
          deltaLabel = ticklen
        }
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
            y: (height - yaxis.c2p(0) + deltaLabel)/height,
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
          let msg = `${id}/${axis} _zerotick == false; skipping zero tick`
          plotjs.log(msg, 'axisTicksAndLabels')
          continue
        }
        if (axis === 'xaxis') {
          let msg = `${id}/${axis} setting major tick at ${majorTickValues[i]}`
          plotjs.log(msg,'axisTicksAndLabels')
          shapes.push({
            type: 'line',
            layer: 'between', // Not working, but may in a future version:
                              // https://github.com/plotly/plotly.js/pull/6927
            x0: majorTickValues[i],
            y0: (height - yaxis.c2p(0) + deltaTickPos)/height,
            x1: majorTickValues[i],
            y1: (height - yaxis.c2p(0) - deltaTickNeg)/height,
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
      let msg = `${id}/${axis} setting minor tick at ${minorTickValues[i]}`
      plotjs.log(msg, 'axisTicksAndLabels')
      let deltaTickPos = ticklen/2 // Tick length for on positive side
      let deltaTickNeg = ticklen/2 // Tick length for on negative side
      if (_ticks === 'outside') {
        deltaTickPos = 0
        deltaTickNeg = ticklen
      }
      if (_ticks === 'inside') {
        deltaTickPos = ticklen
        deltaTickNeg = 0
      }
      if (axis === 'xaxis') {
        shapes.push({
          type: 'line',
          x0: minorTickValues[i],
          y0: (height - yaxis.c2p(0) + deltaTickPos)/height,
          x1: minorTickValues[i],
          y1: (height - yaxis.c2p(0) - deltaTickNeg)/height,
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
