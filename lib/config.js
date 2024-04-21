plotjs.config = {}
plotjs.config.defaults = {
  config: {
    staticPlot: false,
    fillFrame: false
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
    margin: {
      l: 32,
      r: 32,
      b: 32,
      t: 32,
      pad: 0
    },
    height: 300,
    width: 300,
    plot_bgcolor: 'white',
    paper_bgcolor: 'white',
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
    ...plotjs.config.defaults.config,
    staticPlot: false,
    _usePlotlyOnly: false // Use only Plotly. Do not set plotjs annotations or events.
  },
  layout: {
    ...plotjs.config.defaults.layout,
    xaxis: {
      _ticks: 'centered', // ( "" | ["outside"] | "inside" | ["centered"] ) (Plotly does not have '_centered')
      ticklen: 5,
      tickwidth: 1,
      tickcolor: 'black',
      tickfont: {
        size: 12,
        color: 'black'
      },
      _ticklabelposition: 'outside', // ( "outside" | "inside" ; other valid Plotly options are ignored and 'outside' is used)

      _productsymbol: '·', // 1x10<sup>3</sup> -> 1·10<sup>3</sup>
      _trimleadingzeros: true, // 0.001 -> .001
      showexponent: 'all',
      exponentformat: 'power',
      separatethousands: true,

      showgrid: true,
      minor: {
        showgrid: true
      }
    },
    // https://plotly.com/javascript/reference/layout/annotations/
    _annotations: {
      xaxis: {
        arrow: {
          text: '', // Needed or else space between end and ax value set below.
          x: 'auto', // ( "auto" | undefined | number ); undefined => "auto"
          y: 'auto',
          ax: 'auto',
          ay: 'auto',
          xref: 'x',
          yref: 'y',
          axref: 'x',
          ayref: 'y',
          arrowwidth: 1,
          arrowsize: 2,
          arrowhead: 3,
          standoff: 0,
          arrowcolor: 'black',
          borderpad: 0,
          startstandoff: 0,
          showarrow: true
        },
        label: {
          text: 'auto',
          position: 'inside', // ('inside' | 'outside' | 'after' )
          // (inside/outside are relative to first quadrant; 'after' means to right of arrow for x, above for y)
          x: 'auto',
          y: 'auto',
          xanchor: 'right',
          yanchor: 'bottom',
          showarrow: false
        }
      }
    }
  }
}
plotjs.config.textbook.layout._annotations.yaxis = plotjs.util.deepCopy(plotjs.config.textbook.layout._annotations.xaxis)
plotjs.config.textbook.layout._annotations.yaxis.label.yanchor = 'center'
plotjs.config.textbook.layout._annotations.yaxis.label.xanchor = 'center'
plotjs.config.textbook.layout.yaxis = plotjs.config.textbook.layout.xaxis
