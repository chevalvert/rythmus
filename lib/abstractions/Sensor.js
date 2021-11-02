const Emitter = require('tiny-emitter')
const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')
const median = require('@utils/array-median')
const retry = require('@utils/retry')
const { configuration, log } = require('@configuration')

module.exports = class Sensor extends Emitter {
  constructor ({ address, baudRate, mockOptions = null }) {
    super()
    this.ledOn = false
    this.uid = address
    // NOTE: mockable only if passed a mockOptions object
    this.mockable = !!mockOptions
    this.isCalibrated = false
    this.calibratedCyclesThreshold = 0

    this.parser = new Readline()
    this.port = new SerialPort(address, { baudRate, autoOpen: false })
    this.port.pipe(this.parser)
    this.port.on('error', this._error.bind(this))

    const cyclesSamples = []

    this.parser.on('data', buffer => {
      const data = this.parseBuffer(buffer)

      // NOTE: emit parsed data only once the Sensor cyclesThreshold has been calibrated
      if (this.isCalibrated) {
        this.emit('data', data)
      } else {
        cyclesSamples.push(data.cycles)
        this.setLed(Math.sin(cyclesSamples.length) < 0)

        if (cyclesSamples.length >= configuration.sensors.calibratedCyclesSamplesLength) {
          this.calibratedCyclesThreshold = median(cyclesSamples)
          this.isCalibrated = true
        }
      }
    })

    // NOTE: auto-reconnect if the port is closed
    this.port.on('close', this.reconnect(configuration.sensors.reconnection, { verbose: true }))

    this.port.open(error => {
      if (!error) {
        log.notice(`Connected to ${this.uid}`)
        return
      }

      // NOTE: mockable sensor won't throw error on connection error,
      // but will instead switch internal `mock` flag to true
      if (this.mockable) {
        log.notice(`Mocking ${this.uid}`)
        this.mock(mockOptions)

        // Try to connect to a real device
        if (mockOptions.autoConnect) this.reconnect({ maxAttempts: Number.POSITIVE_INFINITY })()

        return
      }

      this._error(error)
    })
  }

  get connected () {
    return this.mock ? true : this.port.isOpen
  }

  reconnect (reconnectionOptions, { verbose = false } = {}) {
    return retry(attempts => new Promise((resolve, reject) => {
      if (verbose) log.warning(`Connection to ${this.uid} lost, reconnection #${attempts}...`)
      this.port.open(error => error ? reject(error) : resolve())
    }), reconnectionOptions)
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

    const seed = Math.random()
    let x = 0
    this.mock = true

    this.mockEquation = (x, seed) => eval(options.signal) // eslint-disable-line no-eval
    this.mockInterval = setInterval(() => {
      this.emit('data', {
        'mock': true,
        'cycles': 2,
        'signal': this.mockEquation(++x, seed)
      })
    }, options.interval)
  }

  _error (error) {
    log.error(error)
    this.emit('error', error)
  }
}
