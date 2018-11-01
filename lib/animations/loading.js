const { configuration } = require('@config')
const { map, clamp } = require('missing-math')
const BezierEasing = require('bezier-easing')
const Particle = require('@abstractions/Particle')

// NOTE: filename and runner are needed by @animations wrapper in order to enable HMR
module.exports.filename = __filename
module.exports.runner = ({ rythmus, players }) => {
  const particles = players.map(player => {
    return new Particle([0, player.position], {
      acceleration: [0.01, 0],
      trailSize: rythmus.circumference / 2
    })
  })

  return (frameCount, weight) => {
    const CONFIG = configuration.animations['loading']

    const bezier = BezierEasing(...CONFIG.bezier)
    const height = rythmus.sensorHeight

    players.forEach((player, index) => {
      const particle = particles[index]

      switch (player.confidence) {
        case 0: {
          break
        }

        default: {
          particle.alive = true
          particle.reset()
          const n = clamp(1 - bezier(player.confidence), 0, 1)
          const zmin = n * height

          for (let z = height; z >= zmin; z--) {
            rythmus.both(player.position, z, player.color)
          }
          break
        }

        case 1: {
          if (particle.x > particle.trailSize) particle.alive = false
          if (!particle.alive) return

          particle.update()
          particle.trail.forEach(({ x, y }, index) => {
            // WIP
            const pillarIndex = Math.trunc(x)
            const zmax = map(index, 0, particle.trail.length, 0, rythmus.sensorHeight)
            for (let z = 0; z < zmax; z++) {
              for (let i = 0; i < 2; i++) {
                rythmus.both(pillarIndex + i, z, player.color)
                rythmus.both(rythmus.symmetric(pillarIndex + i), z, player.color)
              }
            }

            for (let z = 0; z < zmax; z++) {
              rythmus.both(player.position, z, player.color)
            }
          })
          break
        }
      }
    })
  }
}
