const path = require('path')
const chokidar = require('chokidar')
const invalidate = require('invalidate-module')
const { configuration, log } = require('@configuration')

module.exports = (animations, { rythmus, players }) => {
  const runners = {}
  animations.forEach(module => {
    const key = path.parse(module.filename).name
    const runner = module.runner({ rythmus, players })
    runners[key] = runner

    if (!configuration.hot) return
    chokidar.watch(module.filename).on('change', () => {
      try {
        invalidate(module.filename)
        log.debug('HMR: ' + key)
        runners[key] = require(module.filename).runner({ rythmus, players })
      } catch (error) {
        log.error(error)
      }
    })
  })

  return runners
}
