const arrayMedian = require('@utils/array-median')
const { performance } = require('perf_hooks')

let sample = []
let median = 0

let nows = []
let fps = 0

module.exports.measure = ({
  updatesPerSecond = 1,
  decimals = 0,
  sampleSize = 100,
  log = console.log
} = {}) => {
  nows.push(performance.now())

  const msPassed = nows[nows.length - 1] - nows[0]
  if (msPassed < 1000 / updatesPerSecond) return

  fps = Math.round(nows.length / msPassed * 1000 * (decimals + 1)) / (decimals + 1)

  sample.push(fps)
  if (sample.length > sampleSize) sample.shift()
  median = arrayMedian(sample)

  log(fps)
  nows = []
}

module.exports.fps = () => fps
module.exports.median = () => median
