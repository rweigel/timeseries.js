// Plotly.PlotSchema.get()['layout']['layoutAttributes']
// Plotly.PlotSchema.get()['traces']['scatter']
// https://api.plot.ly/v2/plot-schema?format=json
// https://json-editor.github.io/json-editor/

const timeseries = {
  defaults: {
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
      xaxis: {
        autorange: true
      },
      yaxis: {
        autorange: true
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
          dash: 'solid',
          width: 4
        }
      }
    }
  }
}

timeseries.textbook = {
  config: {
    ...timeseries.defaults.config,
    staticPlot: false
  },
  layout: {
    ...timeseries.defaults.layout,
    xaxis: {
      autorange: false,
      ticks: true,
      showticklabels: false,
      zeroline: false,
      minor: {
        showgrid: true,
        gridwidth: 1,
        gridcolor: '#eee',
        griddash: 'dot'
      }
    },
    yaxis: {
      autorange: false,
      ticks: true, // needed for minor grid to show
      showticklabels: false,
      zeroline: false,
      minor: {
        showgrid: true,
        gridwidth: 1,
        gridcolor: '#eee',
        griddash: 'dot'
      }
    },
    annotations: [
      {
        text: '$\\Large x$',
        //height: 16, // Does not work
        //valign: 'bottom', // Does not work
        x: 1,
        y: 0,
        showarrow: false
      },
      {
        text: '&#9654;',
        height: 16, // Fixes an off-by-one pixel error
        valign: 'top', // Fixes an off-by-one pixel error
        x: 1,
        y: 0,
        showarrow: false
      },
      {
        text: '$\\Large y$',
        x: 0,
        y: 1,
        xref: 'x',
        yref: 'y',
        showarrow: false
      },
      {
        text: '&#9650;',
        x: 0,
        y: 1,
        showarrow: false
      }
    ]
  }
}
