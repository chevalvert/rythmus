const AnimationDirection = require('@animations/helpers/animation-direction')
const AnimationZone = require('@animations/helpers/animation-zone')
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

  return (frameCount, {
    player,
    weight = 1,
    thickness,
    thicknessCenter,
    pulse,
    zmin,
    zmax
  } = {}) => {
    if (weight === 0) return

    const CONFIG = configuration.animations[NS]

    const dir = getAnimationDirection(player)
    const zone = getAnimationZone(zmin, zmax)

    const load = {
      zoffset: Math.pow(1 - player.confidence, 2),
      amplitude: Math.pow(player.confidence, 0.5),
      speed: Math.pow(1 - player.confidence, 3)
    }

    let time = player.getProperty(NS + 'time') || 0
    time += CONFIG.speed.default
    time += player.isActive
      ? Math.floor(player.point * 2) * CONFIG.speed.pulsing
      : load.speed * CONFIG.speed.appearance

    for (let i = 0; i < rythmus.circumference; i++) {
      // TODO: more explicit varnames
      const p = (getLocalPulseValue(i, { pulse, player }) || 0) * load.amplitude
      const p_ = p * CONFIG.pulseAmplitude
      const v = getLocalSinusValue(i, { time, frequence: CONFIG.frequence, player })
      const z = lerp(zone[0], zone[1], v - load.zoffset)
      const o = Math.max(p, CONFIG.minOpacity) * (1 - load.zoffset)
      const w = Math.floor(CONFIG.minimumThickness + thickness * p + p_)
      const zoffs = [
        Math.ceil(w * (1 - thicknessCenter)),
        Math.ceil(w * thicknessCenter)
      ].sort((a, b) => b - a)
      for (let zoff = z - zoffs[0]; zoff < z + zoffs[1]; zoff++) {
        rythmus[player.side](i, dir(zoff), player.color.map(k => k * o))
      }
    }

    player.setProperty(NS + 'time', time)
  }
}
