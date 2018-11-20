#!/usr/bin/env node
require('module-alias/register')

const rythmus = require('@lib/rythmus')
const fps = require('@utils/measure-fps')

rythmus.raf(() => {
  fps.measure({
    log: () => {},
    decimals: 3,
    updatesPerSecond: 30
  })

  console.log(fps.fps(), fps.median())
})

require('../../index.js')
