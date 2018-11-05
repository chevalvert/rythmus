#!/usr/bin/env node
require('module-alias/register')

const { configuration } = require('@config')
process.title = 'test_' + configuration.package.name

const Sensor = require('@abstractions/Sensor')

const datas = []
configuration.sensors.ports.forEach((address, index) => {
  const sensor = new Sensor({
    address,
    baudRate: configuration.sensors.baudRate,
    mockOptions: configuration.sensors.mockable
  })

  sensor.on('data', data => {
    datas[index] = data.cycles + ' ' + data.signal
  })
  return sensor
})

setInterval(() => console.log(datas.join(' ')), 200)
