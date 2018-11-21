const { performance } = require('perf_hooks')

let last = 0

module.exports = () => {
  const now = performance.now()
  const ms = now - last
  last = now

  return ms
}
