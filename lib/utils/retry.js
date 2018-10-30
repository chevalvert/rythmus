module.exports = (promise, {
  maxAttempts = Number.POSITIVE_INFINITY,
  delayBetweenAttempts = 1000
} = {}) => {
  let timer
  let attempts = 0

  const begin = () => {
    timer = setTimeout(attempt, delayBetweenAttempts)
  }

  const end = () => timer && clearTimeout(timer)

  const attempt = () => {
    if (++attempts > maxAttempts) end()
    promise(attempts).catch(begin)
  }

  return begin
}
