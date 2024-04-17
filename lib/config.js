// Plotly.PlotSchema.get()['layout']['layoutAttributes']
// Plotly.PlotSchema.get()['traces']['scatter']
// https://api.plot.ly/v2/plot-schema?format=json
// https://json-editor.github.io/json-editor/

plotjs.config = {}
plotjs.config.defaults = {
  config: {
    staticPlot: false,
    fillFrame: true
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
        color: 'blue',
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
    _keepOriginalLayout: false,
    _useOriginalGridLines: false
  },
  layout: {
    ...plotjs.config.defaults.layout,
    xaxis: {
      autorange: true,

      zeroline: false,

      showline: true, // bottom line assoc
      mirror: 'ticks', // ( true | "ticks" | false | "all" | "allticks" )

      ticks: 'outside', // ( "" | "outside" | "inside" | "centered" ) (plotly does not have 'centered')
      ticklen: 4,
      tickwidth: 1,
      tickcolor: 'black',
      tickfont: {
        size: 16,
        color: 'black'
      },

      showticklabels: true,

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
    }
  }
}
plotjs.config.textbook.layout.yaxis = plotjs.config.textbook.layout.xaxis
