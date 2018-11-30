const osc = require('@lib/osc')
const queue = require('@utils/delayed-queue')
const { configuration } = require('@configuration')
const { lerp } = require('missing-math')

if (configuration.sound) osc.connect()

module.exports = {
  send: osc.send,
  get enabled () { return (!!configuration.sound) },
  get tracks () { return configuration.sound.tracks },
  start: async () => {
    await osc.wait()

    const [off, on] = configuration.sound.mixer
    const resetActsMaster = configuration.sound.tracks.acts.map(actIndex => {
      return () => osc.send('/mix', [actIndex, off, 2])
    })
    queue([
      ...resetActsMaster,
      () => osc.send('/mix', [configuration.sound.tracks.iddle, on, 2]),
      () => osc.send('/play', 1)
    ], 100)
  },

  play: () => osc.send('/play', 1),
  pause: () => osc.send('/play', 0),
  midi: (track, note, velocity) => osc.send('/midi', [track, note, velocity]),
  mix: (track, t, pow = configuration.sound.mixerExponent) => {
    const volume = lerp(configuration.sound.mixer[0], configuration.sound.mixer[1], t)
    return osc.send('/mix', [track, volume, pow])
  },

  kill: (signal = 0) => {
    osc.send('/play', 0)
    setTimeout(() => process.exit(signal), 100)
  }
}
