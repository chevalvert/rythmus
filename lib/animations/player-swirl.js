const AnimationDirection = require('@animations/helpers/animation-direction')
const AnimationZone = require('@animations/helpers/animation-zone')
const last = require('@utils/array-last')
const LocalPulseValue = require('@animations/helpers/local-pulse-value')
const LocalTrailValue = require('@animations/helpers/local-trail-value')
const Particle = require('@abstractions/Particle')
const { configuration } = require('@configuration')
const { lerp, random } = require('missing-math')

// NOTE: filename and runner are needed by @animations wrapper in order to enable HMR
module.exports.filename = __filename
module.exports.runner = ({ namespace: NS, rythmus, players }) => {
  const getLocalTrailValue = LocalTrailValue(rythmus)
  const getLocalPulseValue = LocalPulseValue(rythmus)
  const getAnimationZone = AnimationZone(rythmus)
  const getAnimationDirection = AnimationDirection(rythmus)

  return (frameCount, { player, weight = 1, thickness, pulse, zmin, zmax } = {}) => {
    if (weight === 0) return

    const CONFIG = configuration.animations[NS]
    CONFIG.initialPositionWindow = CONFIG.initialPositionWindow.map(v => {
      // Make sure negative values are converted to circle index
      return v >= 0
        ? v
        : rythmus.circumference - v
    })

    const dir = getAnimationDirection(player)
    const zone = getAnimationZone(zmin, zmax)
    const particles = player.getProperty(NS + 'particles') || []
    const lastParticle = last(particles) || { lifetime: Number.POSITIVE_INFINITY }

    // Adding new particles on heartbeat
    if (player.heart.hasBeaten && lastParticle.lifetime > CONFIG.minDelayBetweenTwoParticles) {
      const position = player.position + Math.floor(random(CONFIG.initialPositionWindow[0], CONFIG.initialPositionWindow[1]))
      particles.push(new Particle([position, 0], {
        acceleration: Particle.Vec2(1, 0),
        trailSize: lerp(CONFIG.trailLength, rythmus.circumference, pulse)
      }))
    }

    // Draw particles trail
    particles.forEach(particle => {
      particle.update()
      particle.trail.forEach((point, index) => {
        if (!point) return

        const z = getLocalTrailValue(index, { particle, slope: CONFIG.slope, zone })
        const p = getLocalPulseValue(index, { pulse, player })

        for (let zoff = z - Math.floor(thickness * p); zoff < z; zoff++) {
          rythmus[player.side](Math.floor(point.x % rythmus.circumference), dir(zoff), player.color)
        }
      })

      // Flag OOB particle as particle that must be deleted
      if (getLocalTrailValue(0, { particle, slope: CONFIG.slope, zone }) > zone[1]) particle.mustDie = true
    })

    // Update player particles for next frame, deleting particles flagged
    player.setProperty(NS + 'particles', particles.filter(particle => !particle.mustDie))
  }
}
