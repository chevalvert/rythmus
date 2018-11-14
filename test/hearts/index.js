#!/usr/bin/env node
require('module-alias/register')

const { configuration } = require('@configuration')
process.title = 'test_' + configuration.package.name

const Heart = require('@abstractions/Heart')
const hearts = Object.keys(configuration.sensors.mapping).map((address, index) => {
  return new Heart({
    address,
    baudRate: configuration.sensors.baudRate,
    mockOptions: configuration.sensors.mockable
  })
})

setInterval(() => {
  console.log(
    hearts.map(heart => {
      return [heart.value, heart.median, heart.adaptativePulseThreshold].join(' ')
    }).join(' ')
  )
}, 200)
