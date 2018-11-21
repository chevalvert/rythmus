const { lerp } = require('missing-math')
const last = require('@utils/array-last')

/**
 * lerp([0, -1, 1], t)

    [0, 1, 0]
        .
       / \
      /   \
     /     \
    /       \

    ['0|', 1, 0]
       .
       |\
       | \
       |  \
   ____|   \

   [0, '1|', 0]
        .
       /|
      / |
     /  |
    /   |____

 */

module.exports = (array, _t, interpolate = lerp) => {
  const index = (array.length - 1) * _t
  const startIndex = Math.floor(index)
  const endIndex = Math.ceil(index)

  const start = array[startIndex]
  const end = array[endIndex]

  if (typeof start === 'string' && last(start) === '|') return end

  const t = index - startIndex

  return interpolate(parseFloat(start), parseFloat(end), t)
}
