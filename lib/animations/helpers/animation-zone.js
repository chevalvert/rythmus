const { clamp } = require('missing-math')

module.exports = rythmus => (zmin, zmax) => [
  clamp(zmin * rythmus.height, 1, rythmus.height),
  clamp(zmax * rythmus.height, 1, rythmus.height)
].sort((a, b) => a - b)
