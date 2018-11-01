#!/usr/bin/env node
require('module-alias/register')

const { configuration } = require('@config')
process.title = configuration.package.name

const rythmus = require('@lib/rythmus')
const players = require('@lib/players')
const animations = require('@animations')([
  require('@animations/iddle'),
  require('@animations/invitation'),
  require('@animations/loading'),
  require('@animations/pulse')
], { rythmus, players })

players.setHistorySize(rythmus.circumference / 2 + 1)

rythmus.raf(players.update)
rythmus.raf(rythmus.clear)
rythmus.raf(frameCount => {
  animations.iddle(frameCount, 1 - players.confidence)
  animations.invitation(frameCount, 1)

  animations.loading(frameCount, 1)
  animations.pulse(frameCount, 1)
})

rythmus.start()
