module.exports = values => {
  let sum = 0
  const len = values.length
  for (let i = 0; i < len; i++) sum += values[i]
  return sum / len
}
