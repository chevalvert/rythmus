const Heart = require('@abstractions/Heart')
const { configuration, log } = require('@config')

const hearts = configuration.heartSensors.ports.map(address => {
  const heart = new Heart(address)
  heart.on('error', error => log.error(error))

  heart.on('update', () => {
    // WIP
    // DEBUG
    console.log('→ ' + heart.graph({ width: 30 }))
  })

  return heart
})

module.exports = {
  hearts
}
