#!/usr/bin/env node
require('module-alias/register')

const { configuration } = require('@configuration')
process.title = 'test_' + configuration.package.name

const sound = require('@lib/sound')
const keyboard = require('@utils/keyboard')

// Map keyboard to midi notes found in configuration.sound.notes
;['azertyuiop', 'qsdfghjklm'].forEach((row, rowIndex) => {
  row.split('').forEach((char, keyIndex) => {
    const midiNote = configuration.sound.notes[rowIndex][keyIndex]
    if (!midiNote) return

    keyboard(key => key.name === char && sound.midi(midiNote.track, midiNote.note, 127))
  })
})

// Handle basic mixer (←→ to change track, ↑↓ to change vol)
let track = configuration.sound.tracks.iddle
let vol = 0
keyboard(key => {
  if (!['left', 'right', 'up', 'down'].includes(key.name)) return

  if (key.name === 'left') track--
  if (key.name === 'right') track++
  if (key.name === 'up') vol = Math.min(vol + 0.1, 1)
  if (key.name === 'down') vol = Math.max(vol - 0.1, 0)
  sound.mix(track, vol)
})

sound.start()
process.on('SIGINT', sound.kill)
process.on('SIGTERM', sound.kill)
