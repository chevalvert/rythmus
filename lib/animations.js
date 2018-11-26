const path = require('path')
const chokidar = require('chokidar')
const invalidate = require('invalidate-module')
const { configuration, log } = require('@configuration')

module.exports = ({ modules, variations }, { rythmus, players }) => {
  const runners = {}

  modules.forEach(module => register(module, null))
  Object.entries(variations).forEach(([key, module]) => register(module, key))

  return runners

  function register (module, key) {
    key = key || path.parse(module.filename).name
    const runner = module.runner({ namespace: key, rythmus, players })
    runners[key] = runner

    if (!configuration.hot) return
    chokidar.watch(module.filename).on('change', () => {
      try {
        invalidate(module.filename)
        log.debug('HMR: ' + key)
        runners[key] = require(module.filename).runner({ namespace: key, rythmus, players })
      } catch (error) {
        log.error(error)
      }
    })
  }
}
