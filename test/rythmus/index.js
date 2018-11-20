#!/usr/bin/env node
require('module-alias/register')

const { configuration } = require('@configuration')
process.title = 'test_' + configuration.package.name

const rythmus = require('@lib/rythmus')
const hsl2rgb = require('hsl-rgb')

let index = 0
let side = 1
require('@utils/keyboard')(key => {
  if (key.name === 'up') index++
  if (key.name === 'down') index--

  if (key.name === 'left') side = -side
  if (key.name === 'right') side = -side
})

rythmus.raf(require('@utils/measure-fps').measure)
rythmus.raf(frameCount => {
  rythmus.clear()
  for (let _index = 0; _index <= index; _index++) {
    for (let z = 0; z <= rythmus.height; z++) {
      const rgb = hsl2rgb(
        (_index / rythmus.circumference) * 360,
        Math.abs(Math.sin(frameCount * 0.1)),
        z / rythmus.height
      )
      rythmus[side > 0 ? 'outside' : 'inside'](_index, z, rgb)
    }
  }
})
rythmus.start()
