plotjs.util = {}

plotjs.util.keys = function (obj) {
  return Object.keys(obj)
}

plotjs.util.shallowCopy = function (obj) {
  return { ...obj }
}

plotjs.util.deepCopy = function (obj) {
  return JSON.parse(JSON.stringify(obj))
}

plotjs.util.toJSON = function (obj, indent) {
  return JSON.stringify(obj, null, indent)
}

plotjs.util.viewportWH = function () {
  const scrollbarWidth = function () {
    const div = document.createElement('div');
    div.style.width = '50px'
    div.style.height = '50px'
    div.style.overflow = 'auto'

    const child = document.createElement('div')
    div.appendChild(child)

    document.body.appendChild(div)

    const width = child.offsetWidth - child.clientWidth
    document.body.removeChild(div)
    return width
  }

  // Based on https://stackoverflow.com/a/22266547/1491619
  // See also https://stackoverflow.com/a/8794370/1491619
  let w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
  let h = Math.min(document.documentElement.clientHeight, window.innerHeight || 0)
  w = window.innerWidth - scrollbarWidth() - 1
  h = window.innerHeight - scrollbarWidth() - 1
  return { width: w, height: h }
}

plotjs.util.setCanvasWH = function () {
  const vp = viewportWH();
  plotjs.util.plotjs.log('setCanvasWH(): Viewport width and height:')
  plotjs.util.plotjs.log(vp)
  const height = vp.height
               - $('#header').height()
               - parseInt($('body').css('margin-top'))
               - parseInt($('body').css('margin-bottom'));

  let Np = URLWatcher['plots'].length
  let plotheight = Math.floor(height / Np)
  let id
  for (let p = 0; p < Np;p++) {
    id = URLWatcher['plots'][p]['id'];
    if ($("#" + id).length == 0) {
      let div = '<div id="' + id + '"></div>';
      $('#plots').append(div);
      document.getElementById(id).style.height = plotheight;
    } else {
      plotjs.log('setCanvasWH(): Updating width and height of ' + id);
      plotjs.log([vp.width, plotheight]);
      Plotly.relayout(id, {width: vp.width, height: plotheight});
      $('#' + id).width(vp.width).height(plotheight);
    }
  }
}

plotjs.util.wordwrap = function (str, width, brk, cut) {
  // https://j11y.io/snippets/wordwrap-for-javascript/

  brk = brk || 'n'
  width = width || 75
  cut = cut || false

  if (!str) { return str }

  const regex = '.{1,' + width + '}(\s|$)' + (cut ? '|.{' + width + '}|.+$' : '|\S+?(\s|$)')

  return str.match(RegExp(regex, 'g')).join(brk)
}
