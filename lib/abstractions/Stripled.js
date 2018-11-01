const chroma = require('chroma-js')

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
    this.leds = new Array(this.expectedLength).fill(null)
  }

  register (parentNode) {
    this.registered = true
    this.node = parentNode
  }

  clear () {
    // NOTE: clearing is done by setting all leds to null ; when strip.apply is
    // called, all null values will fallback to [0, 0, 0]
    this.leds = new Array(this.expectedLength).fill(null)
  }

  // TODO: support for different color space (hsl ?)
  set (z, color) {
    z = Math.floor(z)
    if (z < 0 || z > this.length) return

    // TODO: improve performance by not calling chroma (enforcing RGB ?)
    this.leds[z] = chroma(color).rgb()

    // TODO: chroma.js implementation to support pixels combination inside a frame
    // this.leds[z] = this.leds[z]
    //   ? chroma.mix(this.leds[z], rgb).rgb()
    //   : rgb
  }

  apply () {
    if (!this.registered) return

    this.leds.forEach((rgb, z) => {
      this.node.setLed(this.index, z, rgb || [0, 0, 0])
    })
  }
}
