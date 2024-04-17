plotjs.math = {}

plotjs.math.arange = function (start, step, step) {
  if (step === undefined) {
    return [...Array(start).keys()]
  } else {
    let x = []
    let val = start
    while (start < stop) {
      x.push(val)
      val += step
    }
    return x
  }
}

plotjs.math.last = function (array) {
  return array[array.length - 1]
}
