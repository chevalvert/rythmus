module.exports = message => {
  const isInt = n => n % 1 === 0
  return isInt(message) ? 'i' : 'f'
}
