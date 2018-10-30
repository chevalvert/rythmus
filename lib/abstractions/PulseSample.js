const Filter = require('@utils/array-filter-lowpass')
const median = require('@utils/array-median')
const bounds = require('@utils/array-bounds')
const { normalize, lerp, clamp } = require('missing-math')

module.exports = class PulseSample {
  constructor ({
    size = 512,
    boundariesAnalysisWindowSize = 10,
    boundariesSmoothing = 0.75,
    smoothing = 0.75
  } = {}) {
    this.boundariesAnalysisWindowSize = boundariesAnalysisWindowSize
    this.boundariesSmoothing = 1 - boundariesSmoothing
    this.filter = smoothing && new Filter(1 - smoothing)
    this.maxLength = size
    this.reset()
  }

  reset () {
    this.raw = []
    this.sample = []
    this.minimum = 0
    this.maximum = 0
    this.median = 0
  }

  // Add a value to the sample
  add (signal) {
    if (isNaN(signal)) return

    this.raw.push(signal)
    if (this.raw.length > this.maxLength) this.remove()

    this.update()
  }

  // Remove the oldest value in the sample
  remove () {
    this.raw.shift()
    this.update()
  }

  update () {
    this.sample = this.filter
      ? this.filter.smoothArray(this.raw.slice())
      : this.raw.slice()

    // NOTE: the boundaries are computed from a smaller window than the sample
    // to allow for tighter changes in the normalization.
    const boundariesAnalysisWindow = this.raw.slice(Math.min(this.boundariesAnalysisWindowSize, this.length))
    const [min, max] = bounds(boundariesAnalysisWindow, { alreadyCloned: true })
    this.setBounds(min, max)

    // NOTE: the sample analysis is done on the raw values to avoid artifacts
    // and weird feeback due to filtering
    this.median = median(this.raw)
  }

  setBounds (min, max) {
    // NOTE: to avoid artifacts due to extreme short changes,
    // the boundaries are smoothed with a basic lerping
    this.minimum = lerp(this.minimum, isNaN(min) ? 0 : min, this.boundariesSmoothing)
    this.maximum = lerp(this.maximum, isNaN(max) ? 0 : max, this.boundariesSmoothing)
  }

  get bounds () {
    return [this.minimum, this.maximum]
  }

  get length () {
    return this.sample.length
  }

  // Return the percentage of completeness of the sample
  // 0: the sample isn't built yet
  // 1: the sample is fully ready to be analyzed
  get confidence () {
    return this.sample.length / this.maxLength
  }

  // Return latest value of the sample
  get last () {
    return this.sample[this.sample.length - 1]
  }

  get normalizedMedian () { return this.normalize(this.median) }

  // Return a value noramlized to sample boundaries
  normalize (value) {
    return clamp(normalize(value, this.minimum, this.maximum), 0, 1)
  }
}
