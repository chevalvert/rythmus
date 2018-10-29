const Filter = require('@utils/array-filter-lowpass')
const median = require('@utils/array-median')
const { normalize } = require('missing-math')

function analyse (arr = [0]) {
  // NOTE: this avoids returning NaN values
  if (!arr.length) arr = [0]

  let minimum = Number.POSITIVE_INFINITY
  let maximum = Number.NEGATIVE_INFINITY
  let sum = 0
  let length = 0

  arr.forEach(value => {
    if (isNaN(value)) return
    length++
    sum += value
    if (value < minimum) minimum = value
    if (value > maximum) maximum = value
  })

  return {
    minimum,
    maximum,
    average: sum / length,
    median: median(arr)
  }
}

module.exports = class PulseSample {
  constructor ({
    size = 512,
    smoothing = 0.75
  } = {}) {
    this.filter = smoothing && new Filter(1 - smoothing)
    this.maxLength = size
    this.reset()
  }

  reset () {
    this.raw = []
    this.sample = []
    this.stats = analyse(this.sample)
  }

  // Add a value to the sample
  add (signal) {
    if (isNaN(signal)) return

    this.raw.push(signal)
    this.sample = this.filter
      ? this.filter.smoothArray(this.raw.slice())
      : this.raw.slice()

    this.stats = analyse(this.sample)

    // Max sample size according to its maxlength
    if (this.raw.length > this.maxLength) this.remove()
  }

  // Remove the oldest value in the sample
  remove () {
    this.raw.shift()
    this.sample.shift()
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

  get median () { return this.stats.median }
  get normalizedMedian () { return this.normalize(this.stats.median) }

  // Return a value noramlized to sample boundaries
  normalize (value) {
    return normalize(value, this.stats.minimum, this.stats.maximum)
  }
}