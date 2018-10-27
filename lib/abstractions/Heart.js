const Sensor = require('@abstractions/Sensor')
const PulseSample = require('@abstractions/PulseSample')
const Beat = require('@abstractions/Beat')
const { configuration } = require('@config')
const { lerp } = require('missing-math')

module.exports = class Heart extends Sensor {
  constructor (sensorPort) {
    super(sensorPort)

    this.ibi = 0
    this.bpm = 0

    this.sample = new PulseSample(configuration.heartSensors.pulseSampleSize)

    this.beat = new Beat()
    this.beat.on('start', () => this.setLed(true))
    this.beat.on('stop', () => this.setLed(false))

    // Heart computation is done everytime the sensor send a data (every ~20ms)
    this.on('data', ({ cycles, signal }) => {
      // If capacitive cycles are below a threshold, there is no finger on the
      // sensor and readings are just noise
      this.isAlive = cycles > configuration.heartSensors.cyclesThreshold
      if (!this.isAlive) {
        this.setLed(false)
        // NOTE: This destroy the sample as the same rate as it is built.
        // This allows a value of 'confidence' to be used as a
        // representation of how long the user as put/lift its finger on/from
        // the sensor, which in turn can be used as a weight for the user's
        // animations
        this.sample.remove()
        return
      }

      // Adding latest sensor value to the sample
      this.sample.add(signal)

      // Store values to be accessed outside data events (i.e in raf loop)
      this.value = signal
      this.normalizedValue = this.sample.normalize(signal)

      // Computing various values based on update sample
      this.computeAdaptativeThreshold()
      this.computeIBI()
      this.computeBPM()

      this.emit('update')
    })
  }

  get confidence () { return this.sample.confidence }
  get median () { return this.sample.stats.median }
  get normalizedMedian () { return this.sample.stats.normalizedMedian }

  // Threshold value is set to COEF% between the median and the greatest
  // value of the sample, where COEF% is `adaptativePulseThresholdCoefficient`
  computeAdaptativeThreshold () {
    this.adaptativePulseThreshold = lerp(
      this.sample.stats.median,
      this.sample.stats.maximum,
      configuration.heartSensors.adaptativePulseThresholdCoefficient
    )
    return this.adaptativePulseThreshold
  }

  // IBI (Inter Beat Interval) corresponds to the value between to
  // consecutive beats start
  computeIBI () {
    if (this.value > this.adaptativePulseThreshold) {
      this.beat.record()
      this.ibi = this.beat.ibi
    } else this.beat.stop()
  }

  computeBPM () {
    if (!this.ibi) return
    this.bpm = (60 * 1000) / this.ibi
  }

  // This is for debug purpose
  graph ({ width = 10 }) {
    this.sample.normalize(this.adaptativePulseThreshold)

    const normalizedAdaptativePulseThreshold = this.sample.normalize(this.adaptativePulseThreshold)
    const graph = new Array(width).fill('').map((_, index) => {
      let char = ' '
      switch (index) {
        case Math.floor(this.normalizedValue * width): char = '█'; break
        case Math.floor(this.sample.normalizedMedian * width): char = ':'; break
        case Math.floor(normalizedAdaptativePulseThreshold * width): char = '|'; break
      }
      return char
    }).join('')

    const confidence = (this.confidence * 100).toFixed(0) + '%'
    const ibi = this.ibi + 'ms'
    const bpm = this.bpm.toFixed(0) + 'bpm'
    return `${confidence.padStart(4, ' ')} | ${ibi.padStart(5, ' ')} | ${bpm.padStart(5, ' ')} | ${graph} |`
  }
}
