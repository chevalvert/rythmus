#!/usr/bin/env node
require('module-alias/register')

const { configuration } = require('@configuration')
process.title = 'test_' + configuration.package.name

const Sensor = require('@abstractions/Sensor')

const datas = []
Object.keys(configuration.sensors.mapping).forEach((address, index) => {
  const sensor = new Sensor({
    address,
    baudRate: configuration.sensors.baudRate,
    mockOptions: configuration.sensors.mockable
  })

  sensor.on('data', data => {
    datas[index] = data.cycles + ` (${sensor.calibratedCyclesThreshold})` + ' ' + data.signal
  })

  setInterval(() => sensor.setLed(!sensor.ledOn), 1000)

  return sensor
})

setInterval(() => console.log(datas.join(' ')), 200)
