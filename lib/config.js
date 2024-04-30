plotjs.config = {}
plotjs.config.defaults = {
  config: {
    staticPlot: false,
    fillFrame: false,
    _usePlotlyOnly: false, // Use only Plotly. Do not set plotjs annotations or events.
    editable: false // disables "click to edit" functionality
  },
  layout: {
    title: {
      text: '',
      yref: 'paper',
      y: 1,
      pad: {
        b: 6
      },
      yanchor: 'bottom',
      font: {
        size: 12,
        color: 'black'
      }
    },
    automargin: false,
    margin: {
      l: 0,
      r: 32,
      b: 32,
      t: 32,
      pad: 0
    },
    height: 300,
    width: 300,
    plot_bgcolor: 'rgba(0,0,0,0.0)',
    paper_bgcolor: 'rgba(0,0,0,0.0)',
    font: {
      size: 12,
      color: 'black',
      family: 'Times New Roman'
    },
    legend: {
      y: 0.5,
      x: 1,
      font: {
        size: 12
      }
    }
  },
  lines: {
    mode: 'lines',
    line: {
      color: 'black',
      dash: 'solid',
      width: 2
    }
  }
}

plotjs.config.textbook = {
  config: {
    ...plotjs.config.defaults.config
  },
  layout: {
    ...plotjs.config.defaults.layout,
    autoexpand: true,
    _originsymbol: '$\\mathcal{O}$', // Origin symbol

    xaxis: {
      _ticks: 'outside', // ( "" | ["outside"] | "inside" | ["centered"] ) (Plotly does not have '_centered')
      //ticks: 'outside',
      ticklen: 7,
      tickwidth: 1,
      tickcolor: 'black',
      tickfont: {
        size: 12,
        color: 'black'
      },
      showline: 1,
      mirror: true,
      automargin: true,
      title: {
        text: '$x\\phantom{|}$',
        font: {size: 16}
      },

      _ticklabelposition: 'outside', // ( "outside" | "inside" ; other valid Plotly options are ignored and 'outside' is used)
      _productsymbol: '·', // 1x10<sup>3</sup> -> 1·10<sup>3</sup>
      _trimleadingzeros: true, // 0.001 -> .001
      _truncatezerolines: true, // If data in first quadrant, do not extend zero lines below zero
      _zerotick: true, // Show zero tick
      _zeroticklabel: true, // Show zero tick label if yaxis.range[0] == 0

      showexponent: 'all',
      exponentformat: 'power',
      separatethousands: true,

      showgrid: true,
      gridwidth: 1,
      gridcolor: "#eee",
      minor: {
        showgrid: true,
        _ticks: 'outside', // ( "" | ["outside"] | "inside" | ["centered"] ) (Plotly does not have '_centered')
        ticklen: 3,
        griddash: 'dot',
        gridcolor: "#eee"
      }
    },

    _annotations: {
      // https://plotly.com/javascript/reference/layout/annotations/
      xaxis: {
        arrow: {
          arrowcolor: 'black',
          startarrowhead: 3,
          startarrowsize: 1.5,
        },
        arrowlabel: {
          _position: 'centered', // ('inside' | 'outside' | 'after' )
          // (inside/outside are relative to first quadrant; 'after' means to right of arrow for x, above for y)
          x: undefined,
          y: undefined,
          xanchor: undefined,
          yanchor: undefined,
          font: {
            size: 12
          }
        }
      },
      originsymbol: {
        text: '$\\mathcal{O}$',
        visible: true,
        _autohide: true, // If true, hide if no x and y data < 0.
        ax: -5, // pixels relative to origin
        ay: 5, // pixels relative to origin, positive is down
        arrowside: 'none',
        xref: 'paper',
        yref: 'paper',
        xanchor: 'right',
        yanchor: 'top',
        showarrow: true,
        arrowwidth: 0.1,
        arrowcolor: 'black'
      }
    }
  }
}
plotjs.config.textbook.layout.yaxis = plotjs.util.deepCopy(plotjs.config.textbook.layout.xaxis)
plotjs.config.textbook.layout.yaxis.title.text = '$y$'
plotjs.config.textbook.layout._annotations.yaxis = plotjs.util.deepCopy(plotjs.config.textbook.layout._annotations.xaxis)
