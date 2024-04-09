//Plotly.PlotSchema.get()['layout']['layoutAttributes']
//Plotly.PlotSchema.get()['traces']['scatter']
//https://api.plot.ly/v2/plot-schema?format=json
//https://json-editor.github.io/json-editor/

timeseries = {
  defaults: {
    config: {
      fillFrame: true
    },
    layout: {
      title: {
        text: 'Line Dash',
        yref: 'paper',
        y: 1,
        pad: {
          b: 8
        },
        yanchor: 'bottom'
      },
      margin: {
        l: 50,
        r: 50,
        b: 24,
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
        range: [0.75, 5.25],
        autorange: false,
        linecolor: 'black',
        linewidth: 1,
        mirror: true
      },
      yaxis: {
        range: [0, 18.5],
        autorange: false,
        linecolor: 'black',
        linewidth: 1,
        mirror: true,
      },
      legend: {
        y: 0.5,
        traceorder: 'reversed',
        font: {
          size: 16
        }
      }
    },
    style: {
      lines: {
        mode: 'lines',
        name: 'name',
        fill: 'tozeroy',
        line: {
          dash: 'solid',
          width: 4
        }
      }
    }
  }
}
