const { configuration } = require('@configuration')
const { random, normalize } = require('missing-math')

// NOTE: filename and runner are needed by @animations wrapper in order to enable HMR
module.exports.filename = __filename
module.exports.runner = ({ rythmus, players }) => {
  const height = rythmus.sensorHeight
  const speeds = players.map(index => {
    return random(...configuration.animations['invitation'].speed)
  })

  return (frameCount, { weight = 1 } = {}) => {
    // Avoid unnecessary computation when weight is null
    if (weight === 0) return

    const CONFIG = configuration.animations['invitation']

    players.forEach((player, index) => {
      if (player.isActive) return

      const speed = speeds[index]
      const pulse = (Math.sin(frameCount * speed) + 1) / 2
      const opacity = 1 - player.confidence

      const zmin = player.confidence * height

      for (let z = zmin; z < height; z++) {
        const n = normalize(z, zmin, height)
        const v = Math.pow(n, CONFIG.contrast)
        const color = player.color.map(k => pulse * v * k * opacity)
        rythmus.both(player.position, z, color, 'lighten')
      }
    })
  }
}
