const Emitter = require('tiny-emitter')
const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')

module.exports = class Sensor extends Emitter {
  constructor ({ address, baudRate, mockOptions = null }) {
    super()
    this.ledOn = false
    this.uid = address
    // NOTE: mockable only if passed a mockOptions object
    this.mockable = !!mockOptions

    this.parser = new Readline()
    this.port = new SerialPort(address, { baudRate, autoOpen: false })
    this.port.pipe(this.parser)
    this.port.on('error', error => this.emit('error', error))
    this.parser.on('data', buffer => this.emit('data', this.parseBuffer(buffer)))

    this.port.open(error => {
      if (!error) return

      // NOTE: mockable sensor won't throw error on connection error,
      // but will instead switch internal `mock` flag to true
      if (this.mockable) return this.mock(mockOptions)
      this.emit('error', error)
    })
  }

  setLed (state = true) {
    if (this.ledOn === state) return

    this.ledOn = state
    this.port.write(state ? 'H' : 'L')
  }

  parseBuffer (buffer) {
    const values = buffer.toString('utf8').trim('\r').split(',')
    return {
      'cycles': +values[0],
      'signal': +values[3],

      // WARNING: these values depend on an hardcoded threshold set in the
      // sensor's firmware, and should not be taken too seriously.
      // Heart.js reimplements these values computation, based on filtered signal
      'bpm': +values[1],
      'ibi': +values[2]
    }
  }

  mock (options = null) {
    if (!options) {
      this.mock = false
      this.mockInterval && clearInterval(this.mockInterval)
      return
    }

    let x = 0
    this.mock = true

    this.mockEquation = x => eval(options.signal) // eslint-disable-line no-eval
    this.mockInterval = setInterval(() => {
      this.emit('data', {
        'mock': true,
        'cycles': 2,
        'signal': this.mockEquation(++x)
      })
    }, options.interval)
  }
}
