const AnimationDirection = require('@animations/helpers/animation-direction')
const AnimationZone = require('@animations/helpers/animation-zone')
const BezierEasing = require('bezier-easing')
const LocalPulseValue = require('@animations/helpers/local-pulse-value')
const LocalSinusValue = require('@animations/helpers/local-sinus-value')
const { configuration } = require('@configuration')
const { lerp } = require('missing-math')

// NOTE: filename and runner are needed by @animations wrapper in order to enable HMR
module.exports.filename = __filename
module.exports.runner = ({ namespace: NS, rythmus, players }) => {
  const getLocalSinusValue = LocalSinusValue(rythmus)
  const getLocalPulseValue = LocalPulseValue(rythmus)
  const getAnimationZone = AnimationZone(rythmus)
  const getAnimationDirection = AnimationDirection(rythmus)

  return (frameCount, { player, weight = 1, thickness, pulse, zmin, zmax } = {}) => {
    if (weight === 0) return

    const CONFIG = configuration.animations[NS]
    const bezier = BezierEasing(...CONFIG.bezier)

    const dir = getAnimationDirection(player)
    const zone = getAnimationZone(zmin, zmax)

    let time = player.getProperty(NS + 'time') || 0
    time += CONFIG.speed.default
    time += bezier(player.point) * CONFIG.speed.pulsing

    for (let i = 0; i < rythmus.circumference; i++) {
      const p = getLocalPulseValue(i, { pulse, player })
      const v = getLocalSinusValue(i, { time, frequence: CONFIG.frequence, player })
      const z = lerp(zone[0], zone[1], v - (1 - player.confidence)) + (p * CONFIG.pulseAmplitude)

      for (let zoff = z - Math.floor(thickness * p); zoff < z; zoff++) {
        rythmus[player.side](i, dir(zoff), player.color)
      }
    }

    player.setProperty(NS + 'time', time)
  }
}
