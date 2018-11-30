#!/usr/bin/env node
require('module-alias/register')

const { configuration } = require('@configuration')
process.title = 'test_' + configuration.package.name

const timeline = require('@lib/timeline')

setInterval(() => {
  timeline.update(1)

  const modulation = timeline.modulate({})
  console.log(Object.values(modulation).join(' '))
}, 1000 / configuration.fps)
