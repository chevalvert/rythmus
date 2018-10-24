const readline = require('readline')

const observers = []

readline.emitKeypressEvents(process.stdin)
process.stdin.setRawMode(true)
process.stdin.on('keypress', (str, key) => {
  // Capture ctrl+c sequence
  if (key.sequence === '\u0003') process.kill(process.pid)

  observers.forEach(observer => observer(key))
})

module.exports = observer => observers.push(observer)
