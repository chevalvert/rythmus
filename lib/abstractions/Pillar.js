const Stripled = require('@abstractions/Stripled')

module.exports = class Pillar extends Stripled {
  constructor ({ position, stripled } = {}) {
    super(stripled)

    this.position = position

    // NOTE: the height of a pillar should always be half the length of its stripled
    this.height = this.length / 2
  }

  inside (z, rgb) {
    if (z < 0 || z >= this.height) return
    this.set(this.length - z - 1, rgb)
  }

  outside (z, rgb) {
    if (z < 0 || z >= this.height) return
    this.set(z, rgb)
  }
}
