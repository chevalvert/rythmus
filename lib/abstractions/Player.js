const { configuration } = require('@configuration')
const arrayRandom = require('@utils/array-random')

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

  static get animations () {
    // Player animations are always prefixed with player-
    return Object.keys(configuration.animations).filter(key => {
      return ~key.indexOf('player-')
    })
  }

  reset () {
    this.history = []
    this.point = 0
    this.lifetime = 0
    this.props = {}

    this.animationName = configuration['force-animation']
      ? configuration['force-animation']
      : arrayRandom(Player.animations)

    if (configuration.sound) {
      this.note = arrayRandom(configuration.sound.notes[this.index])
    }
  }

  // This is used to safely get/set a property to an instanced player.
  // This property will be cleared at each Player.reset()
  setProperty (k, value) { this.props[k] = value }
  getProperty (k) { return this.props[k] }

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
    if (!this.isActive) {
      if (this.confidence === 0) this.reset()
      return
    }

    this.lifetime++

    // NOTE: player.point domain is always [0;1], so normalization is implicit
    const easing = configuration.players.easing[this.heart.isBeating ? 'up' : 'down']
    this._remember(this.point)
    this.point += (this.value - this.point) * easing
  }
}
