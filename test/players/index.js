#!/usr/bin/env node
require('module-alias/register')

const { configuration } = require('@configuration')
process.title = 'test_' + configuration.package.name

const Player = require('@abstractions/Player')
const Heart = require('@abstractions/Heart')
const players = Object.keys(configuration.sensors.mapping).map((address, index) => {
  return new Player({
    index,
    // NOTE: Setting player.position to player.index is for debug purpose only,
    // and does not reflect a real-world mapping
    position: index,
    heart: new Heart({
      address,
      baudRate: configuration.sensors.baudRate,
      mockOptions: configuration.sensors.mockable
    })
  })
})

setInterval(() => {
  console.log(
    players.map(player => {
      player.update()
      return [
        player.confidence,
        player.heart.normalizedValue,
        player.point
      ].join(' ')
    }).join(' ')
  )
}, 200)
