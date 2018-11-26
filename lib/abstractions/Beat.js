const Emitter = require('tiny-emitter')

module.exports = class Beat extends Emitter {
  record () {
    this.hasBeaten = false
    if (this.running) return

    this.running = true
    this.hasBeaten = true
    const now = Date.now()

    // NOTE: this.start is defined if a beat has already occured
    if (this.start) this.ibi = now - this.start

    this.start = now
    this.emit('start')
  }

  stop () {
    if (!this.running) return

    this.running = false
    this.duration = Date.now() - this.start
    this.emit('stop')
  }
}
