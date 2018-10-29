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
const pckg = require('package')(module)
const parseStringInObject = require('parse-strings-in-object')
const rc = require('rc')
const readrc = () => parseStringInObject(rc(pckg.name))
let configuration = Object.assign({}, { package: pckg }, readrc())

/**
 * ACTIONS
 */
if (configuration.h || configuration.help) {
  console.log(fs.readFileSync(path.join(__dirname, 'usage.txt'), 'utf-8'))
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
if (!configuration['mapping-file']) {
  log.error('No mapping file given.\nPlease set the `mapping-file` config key to a valid path.')
  process.exit(1)
}

if (!fs.existsSync(path.resolve(configuration['mapping-file']))) {
  log.error('Mapping file not found.\nPlease set the `mapping-file` config key to a valid path.')
  process.exit(1)
}

const mapping = require(path.resolve(configuration['mapping-file']))

module.exports = {
  log,
  viewer,
  configuration,
  mapping
}
