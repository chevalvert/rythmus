#!/usr/bin/env node
require('module-alias/register')

const { configuration } = require('@configuration')
process.title = 'test_' + configuration.package.name

const sound = require('@lib/sound')
const keyboard = require('@utils/keyboard')
const queue = require('@utils/delayed-queue')

const tracks = {
  iddle: 1,
  acts: [2, 3, 4, 5]
}

const mixer = [0, 0.78]

keyboard(key => {
  if (key.name === 'a') sound.send('/midi', [6, 24, 127])
  if (key.name === 'z') sound.send('/midi', [7, 36, 127])
  if (key.name === 'e') sound.send('/midi', [8, 36, 127])
  if (key.name === 'r') sound.send('/midi', [9, 44, 127])
  if (key.name === 't') sound.send('/midi', [10, 43, 127])
  if (key.name === 'y') sound.send('/midi', [11, 36, 127])
  if (key.name === 'u') sound.send('/midi', [12, 37, 127])
  if (key.name === 'i') sound.send('/midi', [13, 37, 127])
  if (key.name === 'o') sound.send('/midi', [14, 36, 127])
  if (key.name === 'p') sound.send('/midi', [15, 24, 127])
  if (key.name === 'q') sound.send('/midi', [16, 24, 127])
  if (key.name === 's') sound.send('/midi', [17, 36, 127])
  if (key.name === 'd') sound.send('/midi', [18, 30, 127])
  if (key.name === 'f') sound.send('/midi', [19, 36, 127])
  if (key.name === 'g') sound.send('/midi', [20, 28, 127])
  if (key.name === 'h') sound.send('/midi', [21, 29, 127])
})

;(async function () {
  await sound.wait()
  queue([
    ...tracks.acts.map(index => () => sound.send('/mix', [index, mixer[0], 2])),
    () => sound.send('/mix', [tracks.iddle, mixer[1], 2]),
    () => sound.send('/play', 1)
  ], 100)
})()

function killSound () {
  sound.send('/play', 0)
  setTimeout(() => process.exit(), 100)
}

process.on('SIGINT', killSound)
process.on('SIGTERM', killSound)
