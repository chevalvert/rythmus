const Player = require('@abstractions/Player')
const Heart = require('@abstractions/Heart')
const bounds = require('@utils/array-bounds')
const mean = require('@utils/array-mean')
const { configuration } = require('@configuration')

const players = Object.entries(configuration.sensors.mapping).map(([address, position], index) => {
  return new Player({
    index,
    position,
    heart: new Heart({
      address,
      baudRate: configuration.sensors.baudRate,
      mockOptions: configuration.sensors.mockable
    })
  })
})

module.exports = {
  get: index => players[index],
  get all () { return players },

  map: callback => players.map(callback),
  find: callback => players.find(callback),
  filter: callback => players.filter(callback),
  forEach: callback => players.forEach(callback),

  update: frameCount => players.forEach(player => player.update(frameCount)),

  setHistorySize: length => players.forEach(player => player.setHistorySize(length)),

  // NOTE: the lifetime of an inactive player is 0, so there is no need to test
  // for player activity, as the result of active + inactive will always be 0
  get lifetimeTogether () {
    const lifetimes = players.map(player => player.lifetime)
    return bounds(lifetimes)[0]
  },

  get confidence () { return mean(players.map(player => player.confidence)) }
}
