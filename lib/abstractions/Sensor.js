const Emitter = require('tiny-emitter')
const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')
const { configuration } = require('@config')

module.exports = class Sensor extends Emitter {
  constructor (address) {
    super()
    this.ledOn = false

    this.parser = new Readline()
    this.port = new SerialPort(address, {
      baudRate: configuration.heartSensors.baudRate,
      autoOpen: false
    })

    this.port.pipe(this.parser)
    this.port.on('error', error => this.emit('error', error))
    this.parser.on('data', buffer => this.emit('data', this.parseBuffer(buffer)))

    this.port.open()
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
      // sensor's firmware, and should not be taken too seriously
      'bpm': +values[1],
      'ibi': +values[2]
    }
  }
}
