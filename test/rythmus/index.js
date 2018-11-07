#!/usr/bin/env node
require('module-alias/register')

const { configuration } = require('@config')
process.title = 'test_' + configuration.package.name

const chroma = require('chroma-js')
const rythmus = require('@lib/rythmus')

let index = 0
let side = 1
require('@utils/keyboard')(key => {
  if (key.name === 'up') index++
  if (key.name === 'down') index--

  if (key.name === 'left') side = -side
  if (key.name === 'right') side = -side
})

rythmus.raf(frameCount => {
  rythmus.clear()
  for (let _index = 0; _index <= index; _index++) {
    for (let z = 0; z <= rythmus.height; z++) {
      const hsl = [
        (_index / rythmus.circumference) * 360,
        Math.abs(Math.sin(frameCount * 0.1)),
        z / rythmus.height
      ]
      rythmus[side > 0 ? 'outside' : 'inside'](_index, z, chroma(...hsl, 'hsl').rgb())
    }
  }
})
rythmus.start()
