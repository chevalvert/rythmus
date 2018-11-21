const { configuration } = require('@configuration')

module.exports = class Player {
  constructor ({ index, position, heart }) {
    this.index = index
    this.position = position
    this.heart = heart

    this.color = configuration.players.colors[this.index]
    this.side = configuration.players.sides[index]
    this.flip = configuration.players.direction[index] === 'top'

    this.reset()
  }

  reset () {
    this.history = []
    this.point = 0
    this.lifetime = 0
    // WIP: random animation
    // ???: allow for reset of animation state when resetting player
    this.animationName = 'sinus'
  }

  setHistorySize (length) {
    this.historySize = length
    this.history.length = length
  }

  _remember (point) {
    this.history.push(point)
    if (this.history.length > this.historySize) this.history.shift()
  }

  get value () {
    return this.heart.normalizedValue
  }

  get confidence () {
    return this.heart.confidence
  }

  get isActive () {
    return this.heart.confidence === 1
  }

  update (frameCount) {
    if (this.confidence === 0) {
      this.reset()
      return
    }

    this.lifetime++

    // NOTE: player.point domain is always [0;1], so normalization is implicit
    const easing = configuration.players.easing[this.heart.isBeating ? 'up' : 'down']
    this._remember(this.point)
    this.point += (this.value - this.point) * easing
  }
}
