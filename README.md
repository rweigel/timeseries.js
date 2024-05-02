# plotjs

# Notes

Finished x-axis for `textbook` layout. Need to implement y-axis. Axis and ticks appear above data. The "between" option does not work for shapes and a recent update may allow it for annotation, in which case both ticks and the axis can be below data and above grid. See https://github.com/plotly/plotly.js/pull/6927.

An alternative is discussed at https://medium.com/@tbarrasso/plotly-tip-2-svg-z-index-16c8a5125054, which involves re-ordering notes in SVG.

# Links

https://api.plot.ly/v2/plot-schema?format=json

https://json-editor.github.io/json-editor/

`Plotly.PlotSchema.get()['layout']['layoutAttributes']`

`Plotly.PlotSchema.get()['traces']['scatter']`

https://plotly.com/chart-studio-help/json-chart-schema/

https://plotly.com/javascript/reference/layout/annotations/

https://plotly.com/javascript/reference/layout/

https://plotly.com/javascript/reference/layout/xaxis/

https://plotly.com/javascript/subplot-charts/

https://github.com/plotly/plotly.js/blob/8b67ed6e4c09a67070be4be347b6d999b50b8354/src/plots/cartesian/axes.js

https://plotly.com/javascript/plotlyjs-function-reference/