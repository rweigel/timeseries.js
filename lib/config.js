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
        b: 8
      },
      yanchor: 'bottom'
    },
    margin: {
      l: 32,
      r: 32,
      b: 32,
      t: 32,
      pad: 0
    },
    plot_bgcolor: 'white',
    paper_bgcolor: 'white',
    font: {
      size: 16,
      color: 'black',
      family: 'Times New Roman'
    },
    legend: {
      y: 0.5,
      x: 1,
      font: {
        size: 16
      }
    }
  },
  style: {
    lines: {
      mode: 'lines',
      line: {
        color: 'black',
        dash: 'solid',
        width: 2
      }
    }
  }
}

plotjs.config.textbook = {
  config: {
    ...plotjs.config.defaults.config,
    staticPlot: false,
    _keepOriginalLayout: true,
    _useOriginalGridLines: false
  },
  layout: {
    ...plotjs.config.defaults.layout,
    xaxis: {
      autorange: true,

      zeroline: false,

      showline: true, // bottom line assoc
      mirror: 'ticks', // ( true | "ticks" | false | "all" | "allticks" )

      ticks: 'outside', // ( "" | "outside" | "inside" | "_centered" ) (plotly does not have '_centered')
      ticklen: 4,
      tickwidth: 1,
      tickcolor: 'black',
      tickfont: {
        size: 12,
        color: 'black'
      },

      showticklabels: true,

      _productsymbol: '·', // 1x10<sup>3</sup> -> 1·10<sup>3</sup>
      _trimleadingzeros: true, // 0.001 -> .001
      showexponent: 'all',
      exponentformat: 'power',
      separatethousands: true,

      showgrid: true,
      gridcolor: '#eee',
      griddash: 'solid',
      gridwidth: 1,

      minor: {
        showgrid: true,
        tickmode: 'auto',
        gridcolor: '#eee',
        griddash: 'dot',
        gridwidth: 1
      }
    },
    _annotations: {
      xarrow: {
        xref: 'x',
        yref: 'y',
        axref: 'x',
        ayref: 'y',
        arrowwidth: 1.1,
        arrowsize: 2,
        arrowhead: 3,
        standoff: 0,
        arrowcolor: 'black',
        borderpad: 0,
        startstandoff: 0,
        showarrow: true
      }
    }
  }
}
plotjs.config.textbook.layout._annotations.yarrow = plotjs.config.textbook.layout._annotations.xarrow
plotjs.config.textbook.layout.yaxis = plotjs.config.textbook.layout.xaxis
