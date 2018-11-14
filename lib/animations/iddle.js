const { configuration } = require('@configuration')
const { perlin, normalize } = require('missing-math')

// NOTE: filename and runner are needed by @animations wrapper in order to enable HMR
module.exports.filename = __filename
module.exports.runner = ({ rythmus, players }) => (frameCount, weight) => {
  const CONFIG = configuration.animations['iddle']

  cloud('inside', 0)
  cloud('outside', 100)

  function cloud (side, offset) {
    let xoff = (frameCount + offset) * CONFIG.speed

    for (let i = 0; i < rythmus.circumference; i++) {
      xoff += CONFIG.resolution[0]
      let yoff = frameCount * CONFIG.speed

      for (let z = 0; z < rythmus.height; z++) {
        yoff += CONFIG.resolution[1]

        const v = normalize(perlin(xoff, yoff), -1, 2)
        const n = Math.floor(v * CONFIG.posterization) / CONFIG.posterization
        rythmus[side](i, z, CONFIG.white.map(k => weight * n * k))
      }
    }
  }
}
