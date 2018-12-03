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
    require('@animations/invitation')
  ],
  variations: {
    'player-1': require('@animations/player-sinus'),
    'player-2': require('@animations/player-sinus'),
    'player-3': require('@animations/player-sinus'),
    'player-4': require('@animations/player-sinus'),
    'player-5': require('@animations/player-sinus'),
    'player-6': require('@animations/player-sinus')
  }
}, { rythmus, players })

players.setHistorySize(rythmus.circumference / 2 + 1)

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

rythmus.raf(players.update)
rythmus.raf(() => timeline.update(players.lifetimeTogether))
rythmus.raf(rythmus.clear)
rythmus.raf(frameCount => {
  const emptyness = 1 - players.confidence
  const modulations = timeline.properties

  animations.iddle(frameCount, { weight: emptyness })
  animations.invitation(frameCount, { weight: emptyness })

  players.forEach(player => {
    animations[player.animationName](frameCount, Object.assign({}, {
      player,
      weight: player.confidence
    }, modulations))
  })

  if (sound.enabled) {
    sound.mix(sound.tracks.iddle, emptyness)
    sound.tracks.acts.forEach(trackNumber => {
      const volume = (1 - emptyness) * modulations[`soundtrack-${trackNumber}-volume`]
      sound.mix(trackNumber, volume)
    })
  }
})

rythmus.start()
