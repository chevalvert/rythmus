/**
 * lighten([r1, g1, b1], [r2, g2, b2])
 * SEE: https://github.com/gka/chroma.js/blob/master/src/ops/blend.coffee
 */
module.exports = (a, b) => {
  if (!b) return a
  if (!a) return

  return [
    a[0] > b[0] ? a[0] : b[0],
    a[1] > b[1] ? a[1] : b[1],
    a[2] > b[2] ? a[2] : b[2]
  ]
}
