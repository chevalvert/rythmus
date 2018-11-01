const { configuration } = require('@config')
const { normalize } = require('missing-math')

// NOTE: filename and runner are needed by @animations wrapper in order to enable HMR
module.exports.filename = __filename
module.exports.runner = ({ rythmus, players }) => (frameCount, weight) => {
  const CONFIG = configuration.animations['invitation']
  const height = rythmus.sensorHeight

  players.forEach(player => {
    if (player.isActive) return

    const pulse = (Math.sin(frameCount * CONFIG.speed) + 1) / 2
    const opacity = 1 - player.confidence

    const zmin = player.confidence * height

    for (let z = zmin; z < height; z++) {
      const i = normalize(z, zmin, height)
      const n = Math.pow(i, CONFIG.contrast)
      const white = CONFIG.white.map(k => pulse * n * k * opacity)
      rythmus.both(player.position, z, white, 'lighten')
    }
  })
}
