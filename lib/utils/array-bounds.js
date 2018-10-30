module.exports = (arr = [], {
  alreadySorted = false,
  alreadyCloned = false
} = {}) => {
  const values = alreadyCloned ? arr : arr.slice(0)
  const numbers = alreadySorted ? values : values.sort((a, b) => a - b)

  return [numbers[0], numbers[numbers.length - 1]]
}
