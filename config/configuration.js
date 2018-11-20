const path = require('path')
const fs = require('fs')

/**
 * PROJECT CONFIGURATION
 * Construct from package.json and .rythmusrc
 * Overridden in order by :
 * - cli args `--parent.child=value`
 * - environment variables `rythmus_parent__child=value`
 * SEE: https://github.com/dominictarr/rc#standards
 */
const rc = require('rc')
const pckg = require('package')(module)
const parseStringInObject = require('parse-strings-in-object')
const defaultConfigPath = path.join(__dirname, '..', '.apprc')
const readrc = () => {
  const defaultConfig = JSON.parse(fs.readFileSync(defaultConfigPath, 'utf-8'))
  return parseStringInObject(rc(pckg.name, defaultConfig))
}

let configuration = readrc()
configuration.package = pckg

/**
 * ACTIONS
 */
if (configuration.h || configuration.help) {
  console.log(fs.readFileSync(path.join(__dirname, '..', 'USAGE'), 'utf-8'))
  process.exit(0)
}

if (configuration.v || configuration.version) {
  console.log(configuration.package.version)
  process.exit(0)
}

/**
 * LOGGER
 */
const Log = require('log')
const log = new Log(configuration['log-level'] || 6)

/**
 * HOT RELOADING
 * only when --hot flag is present
 */
if (configuration.hot) {
  require('chokidar')
    .watch(configuration.configs)
    .on('change', () => {
      try {
        configuration = Object.assign(configuration, readrc())
      } catch (e) {
        log.error(e)
      }
    })
}

/**
 * VIEWER
 */
const viewer = configuration.viewer && require('@utils/viewer')(configuration.viewer, log)

/**
 * MAPPING
 */
let mapping = {}
if (!configuration['mapping-file']) {
  log.warning('No mapping file given. Please set the `mapping-file` config key to a valid path.')
} else if (!fs.existsSync(path.resolve(configuration['mapping-file']))) {
  log.error('Mapping file not found. Please set the `mapping-file` config key to a valid path.')
  process.exit(1)
} else {
  mapping = require(path.resolve(configuration['mapping-file']))
}

module.exports = {
  log,
  viewer,
  configuration,
  mapping
}
