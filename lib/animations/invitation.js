const { configuration } = require('@config')
const { random, normalize } = require('missing-math')

// NOTE: filename and runner are needed by @animations wrapper in order to enable HMR
module.exports.filename = __filename
module.exports.runner = ({ rythmus, players }) => {
  const speeds = players.map(index => {
    return random(...configuration.animations['invitation'].speed)
  })

  return (frameCount, weight) => {
    const CONFIG = configuration.animations['invitation']
    const height = rythmus.sensorHeight

    players.forEach((player, index) => {
      if (player.isActive) return

      const speed = speeds[index]
      const pulse = (Math.sin(frameCount * speed) + 1) / 2
      const opacity = 1 - player.confidence

      const zmin = player.confidence * height

      for (let z = zmin; z < height; z++) {
        const i = normalize(z, zmin, height)
        const n = Math.pow(i, CONFIG.contrast)
        const color = player.color.map(k => pulse * n * k * opacity)
        rythmus.both(player.position, z, color, 'lighten')
      }
    })
  }
}
