const Emitter = require('tiny-emitter')
const { configuration, log } = require('@configuration')
const findType = require('@utils/osc-find-message-type')
const { UDPPort } = require('osc')

const emitter = new Emitter()

let udpPort
let isOpen = false
let connectionAttempts = 0

function handshake (message) {
  if (isOpen) return
  if (message.address !== configuration.sound.udp.handshakeMessage) return

  isOpen = true
  log.info('Sound UDP handshake done')
  emitter.emit('handshake')
}

function ready () {
  log.info('Sound UDP is ready on ports', configuration.sound.udp.remote.port, configuration.sound.udp.local.port)
  log.info(`Waiting for ${configuration.sound.udp.handshakeMessage} message on`, configuration.sound.udp.local.port)
}

function close () {
  isOpen = false
  log.info('Sound UDP has been closed')
}

function error (err) {
  if (!err) return

  log.error(err)
  close()

  if (connectionAttempts > configuration.sound.udp.reconnection.attempts) return
  if (err.code !== 'EHOSTUNREACH' && err.code !== 'EHOSTDOWN') return

  setTimeout(() => {
    log.info('Trying to reconnect sound UDP...')
    connectionAttempts++
    module.exports.connect()
  }, configuration.sound.udp.reconnection.delay)
}

module.exports = {
  get isOpen () { return isOpen },
  get port () { return udpPort },

  wait: async () => isOpen
    ? Promise.resolve()
    : new Promise((resolve, reject) => emitter.once('handshake', resolve)),

  connect: () => {
    if (udpPort) udpPort.close()

    udpPort = new UDPPort({
      // SEE: https://github.com/colinbdclark/osc.js/issues/83#issuecomment-290567155
      remoteAddress: configuration.sound.udp.remote.address,
      remotePort: configuration.sound.udp.remote.port,
      localAddress: configuration.sound.udp.local.address,
      localPort: configuration.sound.udp.local.port,
      metadata: true
    })

    udpPort.on('message', handshake)
    udpPort.on('ready', ready)
    udpPort.on('close', close)
    udpPort.on('error', error)

    udpPort.open()
  },

  send: (address, values = [0]) => {
    if (!isOpen) return

    values = Array.isArray(values) ? values : [values]

    log.debug('Send', address, values.join(' '))
    udpPort.send({
      address,
      args: values.map(value => {
        const type = findType(value)
        return {
          type,
          value: type === 'f'
            ? value.toFixed(configuration.sound.floatDecimals)
            : value
        }
      })
    })
  }
}
