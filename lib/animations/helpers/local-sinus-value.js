const posin = require('@utils/math-positive-sinus')
const { map } = require('missing-math')

module.exports = rythmus => (pillarIndex, { time, frequence, player }) => {
  const theta = map(pillarIndex, 0, rythmus.circumference, 0, Math.PI * 2 * frequence)
  return posin(time + theta)
}
