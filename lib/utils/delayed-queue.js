module.exports = async (functions, delay) => {
  return Promise.all(functions.map((fn, index) => new Promise(resolve => {
    setTimeout(() => {
      fn()
      resolve()
    }, index * delay)
  })))
}
