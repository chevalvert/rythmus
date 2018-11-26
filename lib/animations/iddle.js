const { configuration } = require('@configuration')
const { perlin, normalize } = require('missing-math')

// NOTE: filename and runner are needed by @animations wrapper in order to enable HMR
module.exports.filename = __filename
module.exports.runner = ({ namespace: NS, rythmus, players }) => {
  const noises = [
    { side: 'inside', offset: 0, xoff: 0, yoff: 0 },
    { side: 'outside', offset: 100, xoff: 0, yoff: 0 }
  ]

  return (frameCount, { weight = 1 } = {}) => {
    if (weight === 0) return
    const CONFIG = configuration.animations['iddle']

    noises.forEach(noise => {
      noise.xoff = (frameCount + noise.offset) * CONFIG.speed
    })

    for (let i = 0; i < rythmus.circumference; i++) {
      noises.forEach(noise => {
        noise.xoff += CONFIG.resolution[0]
        noise.yoff = frameCount * CONFIG.speed
      })
      for (let z = 0; z < rythmus.height; z++) {
        noises.forEach(noise => {
          noise.yoff += CONFIG.resolution[1]
          const v = normalize(perlin(noise.xoff, noise.yoff), -1, 2)
          const n = Math.floor(v * CONFIG.posterization) / CONFIG.posterization
          const rgb = CONFIG.white.map(k => weight * n * k)
          rythmus[noise.side](i, z, rgb)
        })
      }
    }
  }
}
