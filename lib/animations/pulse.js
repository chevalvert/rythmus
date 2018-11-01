const { configuration } = require('@config')
const { normalize, lerp } = require('missing-math')

// NOTE: filename and runner are needed by @animations wrapper in order to enable HMR
module.exports.filename = __filename
module.exports.runner = ({ rythmus, players }) => (frameCount, weight) => {
  const CONFIG = configuration.animations['pulse']

  players.forEach((player) => {
    const color = player.color

    player.history.forEach((point, index) => {
      // NOTE: flip history, so the apex travel from user and not towards him
      index = player.history.length - index

      const zmin = 0
      const zmax = rythmus.height
      const z = lerp(zmin, zmax, point)
      const zdired = Math.abs(rythmus.height * player.index - z)
      rythmus.both(index, zdired, color)
      rythmus.both(rythmus.symmetric(index), zdired, color)
    })
  })
}
