#!/usr/bin/env node
require('module-alias/register')

const { configuration } = require('@config')
process.title = configuration.package.name

const rythmus = require('@lib/rythmus')

// const keyboard = require('@utils/keyboard')
// let zk = 0
// keyboard(key => {
//   if (key.name === 'up') zk++
//   if (key.name === 'down') zk--
//   console.log(zk)
// })

let frameCount = 0
rythmus.raf(() => {
  frameCount++
  rythmus.clear()

  const o = (Math.sin(frameCount * 0.01) + 1) / 2
  const zmax = rythmus.height * ((Math.cos(frameCount * 0.1 * o) + 1) / 2)
  for (let i = 0; i < rythmus.circumference; i++) {
    for (let z = zmax - o * zmax; z < zmax; z++) {
      rythmus.inside(i, z, [255 * o, 0, 255 * o])
      rythmus.outside(i, z, [255 * (1 - o), 255 * (1 - o), 0])
    }
  }
})

rythmus.start()
