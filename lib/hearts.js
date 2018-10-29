const Heart = require('@abstractions/Heart')
const { configuration, mapping, log } = require('@config')

const hearts = mapping.sensors && Object.entries(mapping.sensors).map(([address, position], index) => {
  const heart = new Heart({
    address,
    baudRate: configuration.sensors.baudRate,
    mockOptions: configuration.sensors.mockable
  })

  heart.on('error', error => log.error(error))
  return heart
})

module.exports = hearts
