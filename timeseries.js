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
}

timeseries.textbook = {
  config: {
    ...timeseries.defaults.config,
    staticPlot: false
  },
  layout: {
    ...timeseries.defaults.layout,
    xaxis: {
      autorange: true,

      zeroline: true,

      showline: true, // bottom line
      mirror: 'ticks', // ( true | "ticks" | false | "all" | "allticks" )

      ticks: 'centered', // ( "" | "outside" | "inside" | "centered" ) (plotly does not have 'centered')
      ticklen: 5,
      showticklabels: true,

      //tickmode: 'auto',
      //tick0: -2,
      //dtick: 1,

      showgrid: true,
      gridcolor: '#eee',
      griddash: 'solid',
      gridwidth: 1,

      minor: {
        showgrid: true,
        tickmode: 'auto',
        dtick: 0.5,
        gridcolor: '#eee',
        griddash: 'dot',
        gridwidth: 1
      }
    },
    yaxis: {
      autorange: true,
      ticks: true, // needed for minor grid to show
      showticklabels: true,
      zeroline: true,

      tickmode: 'linear',
      dtick: 1,
      showgrid: false,
      gridcolor: 'black', // '#eee'
      griddash: 'solid',
      gridwidth: 1,
      minor: {
        showgrid: false,
        tickmode: 'linear',
        tick0: 1,
        dtick: 0.25,
        gridwidth: 1,
        gridcolor: '#eee',
        griddash: 'dot'
      }
    }
  }
}
