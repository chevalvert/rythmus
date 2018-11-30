const arrayLerp = require('@utils/array-lerp')
const captureMilliseconds = require('@utils/measure-ms')
const { configuration } = require('@configuration')

const properties = {}
// Make sure that properties is correctly populated as init
tweenProperties(0)

let milliseconds = 0
function update (playersLifetimeTogether) {
  const ms = captureMilliseconds()

  // Break execution if no lifetimeTogether
  if (!playersLifetimeTogether) return reset()

  milliseconds += ms

  // Break execution if time is passed timeline duration
  // Reset timeline if config.loop is set
  if (milliseconds > configuration.timeline.duration) {
    if (configuration.timeline.loop) reset()
    return
  }

  tweenProperties(milliseconds / configuration.timeline.duration)
}

function tweenProperties (t) {
  Object.entries(configuration.timeline.properties).forEach(([key, values]) => {
    const tweenedValue = arrayLerp(values, t)
    const easing = configuration.timeline.easings[key] || 1
    const value = properties[key] && properties[key].hasOwnProperty('value')
      ? properties[key].value + (tweenedValue - properties[key].value) * easing
      : tweenedValue

    properties[key] = { values, value }
  })
}

function reset () {
  milliseconds = 0
  tweenProperties(0)
}

module.exports = {
  modulate: props => {
    Object.entries(properties).forEach(([key, prop]) => {
      props[key] = prop.value
    })
    return props
  },
  reset,
  update
}
