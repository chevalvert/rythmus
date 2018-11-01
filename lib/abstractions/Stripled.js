const chroma = require('chroma-js')
const { configuration } = require('@config')

module.exports = class Stripled {
  constructor ({ nodeName, index, length, expectedLength } = {}) {
    this.registered = false
    this.nodeName = nodeName
    this.index = index

    this.length = length

    // NOTE: expectedLength is a standard accross all stripleds, no matter what
    // their real length is. This is used to always send the same payload size
    // for nodes with strips of various length.
    // No matter what, the UDP client should receive payload sizes equal to the
    // number of strips by the expectedLength:
    // node.payload.size = node.strips.length * expectedLength
    this.expectedLength = expectedLength
    this.leds = new Array(this.expectedLength).fill(undefined)
  }

  register (parentNode) {
    this.registered = true
    this.node = parentNode
  }

  clear () {
    // NOTE: clearing is done by setting all leds to null ; when strip.apply is
    // called, all null values will fallback to [0, 0, 0]
    this.leds = new Array(this.expectedLength).fill(undefined)
  }

  // TODO: support for different color space (hsl ?)
  set (z, color, mode) {
    z = Math.floor(z)
    if (z < 0 || z > this.length) return

    if (!mode) {
      this.leds[z] = color
      return
    }

    // WIP: chroma.js implementation to support pixels combination inside a frame
    this.leds[z] = this.leds[z]
      ? chroma.blend(this.leds[z], color, mode).rgb()
      : chroma(color).rgb()
  }

  apply () {
    if (!this.registered) return

    this.leds.forEach((rgb = [0, 0, 0], z) => {
      const rgbLimited = rgb.map(k => +k.toFixed(configuration.stripleds.decimals))
      this.node.setLed(this.index, z, rgbLimited)
    })
  }
}
