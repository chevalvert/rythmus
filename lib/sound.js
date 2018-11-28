const Emitter = require('tiny-emitter')
const { UDPPort } = require('osc')
const { configuration, log } = require('@configuration')

let udp
let isOpen = false
const emitter = new Emitter()

if (configuration.sound) connect()

function connect (attempts = 0) {
  if (udp) udp.close()

  udp = new UDPPort({
    // SEE: https://github.com/colinbdclark/osc.js/issues/83#issuecomment-290567155
    remoteAddress: configuration.sound.udp.remote.address,
    remotePort: configuration.sound.udp.remote.port,
    localAddress: configuration.sound.udp.local.address,
    localPort: configuration.sound.udp.local.port,
    metadata: true
  })

  udp.on('message', oscMsg => {
    if (isOpen) return
    if (oscMsg.address === configuration.sound.udp.handshakeMessage) {
      isOpen = true
      log.info('Sound UDP handshake')
      emitter.emit('handshake')
    }
  })

  udp.on('ready', () => {
    log.info('Sound UDP is ready on ports', configuration.sound.udp.remote.port, configuration.sound.udp.local.port)
    log.info(`Waiting for ${configuration.sound.udp.handshakeMessage} message on`, configuration.sound.udp.local.port)
  })

  udp.on('close', (data) => {
    isOpen = false
    log.info('Sound UDP has been closed')
  })

  udp.on('error', err => {
    if (!err) return

    log.error(err)
    isOpen = false

    if (attempts > configuration.sound.udp.reconnection.attempts) return
    if (err.code !== 'EHOSTUNREACH' && err.code !== 'EHOSTDOWN') return

    setTimeout(() => {
      log.info('Trying to reconnect sound UDP...')
      connect(++attempts)
    }, configuration.sound.udp.reconnection.delay)
  })

  udp.open()
}

function findType (value) {
  const isInt = n => n % 1 === 0
  return isInt(value) ? 'i' : 'f'
}

module.exports = {
  enabled: (!!configuration.sound),

  wait: async () => isOpen
    ? Promise.resolve()
    : new Promise((resolve, reject) => emitter.once('handshake', resolve)),

  send: (address, values = [0]) => {
    if (!isOpen) return
    /**
     * message = {
     *   address: '/varName',
     *   args: [
     *     { type: 'i', value: 100 }
     *     { type: 'f', value: 1.0 }
     *   ]
     * }
     */
    values = Array.isArray(values) ? values : [values]
    log.debug('Send', address, values.join(' '))
    udp.send({
      address,
      args: values.map(value => {
        const type = findType(value)
        if (type === 'f') value = value.toFixed(configuration.sound.floatDecimals)
        return { value, type }
      })
    })
  }
}
