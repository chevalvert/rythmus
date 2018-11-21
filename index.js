#!/usr/bin/env node
require('module-alias/register')

const { configuration } = require('@configuration')
process.title = configuration.package.name

const rythmus = require('@lib/rythmus')
const players = require('@lib/players')
const timeline = require('@lib/timeline')
const animations = require('@animations')([
  require('@animations/iddle'),
  require('@animations/invitation'),
  require('@animations/player-sinus')
], { rythmus, players })

players.setHistorySize(rythmus.circumference / 2)

rythmus.raf(players.update)
rythmus.raf(() => timeline.update(players.lifetimeTogether))

rythmus.raf(frameCount => {
  rythmus.clear()

  const emptyness = 1 - players.confidence
  animations.iddle(frameCount, { weight: emptyness })
  animations.invitation(frameCount, { weight: emptyness })

  players.forEach(player => {
    const animationName = 'player-' + player.animationName
    animations[animationName](frameCount, timeline.modulate({
      player,
      weight: player.confidence
    }))
  })
})

rythmus.start()
