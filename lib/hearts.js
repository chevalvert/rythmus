const Heart = require('@abstractions/Heart')
const { configuration, mapping, log } = require('@config')

const graphs = []

const hearts = mapping.sensors && Object.entries(mapping.sensors).map(([address, position], index) => {
  const heart = new Heart({
    address,
    baudRate: configuration.sensors.baudRate,
    mockOptions: configuration.sensors.mockable
  })

  heart.on('error', error => log.error(error))
  heart.on('update', () => {
    // DEBUG
    graphs[index] = heart.graph({ width: 30 })
  })

  return heart
})

hearts[0].on('update', () => {
  console.log(graphs.join(' / '))
})

module.exports = {
  hearts
}
