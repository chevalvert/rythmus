const { map } = require('missing-math')

module.exports = rythmus => (trailIndex, { particle, slope, zone }) => {
  const point = particle.trail[trailIndex]
  if (!point) return 0

  const dx = Math.abs(particle.startPosition.x - point.x)
  return map(dx * slope, 0, rythmus.height, zone[0], zone[1])
}
