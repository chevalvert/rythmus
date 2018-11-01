const { Vec2 } = require('vec23')

function ensureVec (arrayOrVec) {
  return Array.isArray(arrayOrVec) ? new Vec2(...arrayOrVec) : arrayOrVec
}

module.exports = class Particle {
  constructor ([x, y], {
    acceleration = Particle.Vec2(0, 0),
    maxSpeed = 1,
    trailSize = 3
  } = {}) {
    this.startPosition = Particle.Vec2(x, y)
    this.acceleration = ensureVec(acceleration)

    this.maxSpeed = maxSpeed
    this.trailSize = trailSize

    this.reset()
  }

  reset () {
    this.position = this.startPosition.clone()
    this.pposition = this.position.clone()
    this.lifetime = 0
    this.velocity = Particle.Vec2(0, 0)

    this.trail = []
  }

  static Vec2 (x, y) {
    return new Vec2(x, y)
  }

  update () {
    this.lifetime++

    this.pposition = this.position.clone()
    this.storeTrail(this.pposition)

    this.velocity._add(this.acceleration)
    if (this.velocity.length() > this.maxSpeed) this.velocity._toLength(this.maxSpeed)

    this.position._add(this.velocity)
  }

  storeTrail (pos) {
    if (!this.trailSize) return

    this.trail.push(pos)
    if (this.trail.length > this.trailSize) this.trail.shift()
  }

  get trailPercent () { return this.trail.length / this.trailSize }

  get x () { return this.position.x }
  get y () { return this.position.y }

  get px () { return this.pposition.x }
  get py () { return this.pposition.y }

  get lastTrail () { return this.trail[this.trail.length - 1] || this.position }
}
