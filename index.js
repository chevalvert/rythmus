#!/usr/bin/env node
require('module-alias/register')

const { configuration } = require('@configuration')
process.title = configuration.package.name

const rythmus = require('@lib/rythmus')
const players = require('@lib/players')
const sound = require('@lib/sound')
const timeline = require('@lib/timeline')
const animations = require('@animations')({
  modules: [
    require('@animations/iddle'),
    require('@animations/invitation'),
    require('@animations/player-sinus'),
    require('@animations/player-swirl')
  ],
  variations: {
    'player-sinus-double': require('@animations/player-sinus'),
    'player-swirl-2': require('@animations/player-swirl')
  }
}, { rythmus, players })

players.setHistorySize(rythmus.circumference / 2 + 1)

rythmus.raf(players.update)
rythmus.raf(() => timeline.update(players.lifetimeTogether))

rythmus.raf(frameCount => {
  rythmus.clear()

  const emptyness = 1 - players.confidence
  animations.iddle(frameCount, { weight: emptyness })
  animations.invitation(frameCount, { weight: emptyness })

  players.forEach(player => {
    animations[player.animationName](frameCount, timeline.modulate({
      player,
      weight: player.confidence
    }))
  })

  if (sound.enabled) {
    sound.mix(sound.tracks.iddle, emptyness)
  }
})

if (sound.enabled) {
  sound.start()
  players.forEach(player => player.heart.beat.on('start', () => {
    if (!player.isActive) return
    const { track, note } = player.note
    sound.midi(track, note, 127)
  }))

  process.on('SIGINT', sound.kill)
  process.on('SIGTERM', sound.kill)
}

rythmus.start()
