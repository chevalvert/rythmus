const Hnode = require('hnode')
const Pillar = require('@abstractions/Pillar')
const { configuration, mapping, log } = require('@configuration')

const hnode = Hnode(Object.assign({
  log: log.info.bind(log)
}, configuration.hnode))

const observers = []
const server = new hnode.Server()
server.setRate(1000 / configuration.fps)
server.on('newnode', node => {
  node.on('online', () => registerNode(node))

  node.on('start', () => log.debug(`start ${node.ip}:${node.name}`))
  node.on('online', () => log.debug(`online ${node.ip}:${node.name}`))
  node.on('offline', () => log.debug(`offline ${node.ip}:${node.name}`))
  node.on('stop', () => log.debug(`stop ${node.ip}:${node.name}`))
})

let frameCount = 0
server.on('tick', () => {
  frameCount++
  observers.forEach(observer => observer(frameCount))
  pillars.forEach(pillar => pillar.apply())
})

const pillars = getPillarsFromMapping(mapping)
const height = pillars.reduce((record, pillar) => {
  // NOTE: if a pillar is smaller than rythmus.height,
  // the desired behavior is ignoring led higher than pillar.height
  return pillar.height > record
    ? pillar.height
    : record
}, 0)

module.exports = {
  get height () { return height },
  get sensorHeight () { return configuration.stripleds.sensor / 2 },
  get circumference () { return pillars.length },
  get sensorIndexes () { return Object.values(mapping.sensors) },
  get sensors () {
    return Object.values(mapping.sensors).map(sensorPositon => pillars[sensorPositon])
  },

  get server () { return server },
  start: () => !server.isRunning && server.start(),
  resume: () => !server.isRunning && server.start(),
  pause: () => server.isRunning && server.stop(),
  stop: () => server.isRunning && server.stop(),

  clear: () => {
    // NOTE: this is the same as server.blackout, but in the pillar lifecycle
    pillars.forEach(pillar => pillar.clear())
  },

  // Return the index symmetric to the one given (axe is half the circle)
  symmetric: index => pillars.length - index,

  both: (index, z, rgb = [0, 0, 0], mode = null) => {
    const pillar = pillars[index]
    if (pillar) {
      pillar.inside(z, rgb, mode)
      pillar.outside(z, rgb, mode)
    }
  },

  inside: (index, z, rgb = [0, 0, 0], mode = null) => {
    const pillar = pillars[index]
    if (pillar) pillar.inside(z, rgb, mode)
  },

  outside: (index, z, rgb = [0, 0, 0], mode = null) => {
    const pillar = pillars[index]
    if (pillar) pillar.outside(z, rgb, mode)
  },

  set: (index, z, rgb = [0, 0, 0]) => {
    const pillar = pillars[index]
    if (pillar) pillar.set(z, rgb)
  },

  raf: fn => {
    if (typeof fn === 'function' && !~observers.indexOf(fn)) {
      observers.push(fn)
    }
  },

  remove: fn => {
    let index = observers.indexOf(fn)
    if (index >= 0) observers.splice(index, 1)
  }
}

function getPillarsFromMapping (mapping) {
  const pillars = []
  Object.entries(mapping.nodes).forEach(([nodeName, node]) => {
    node.forEach((position, index) => {
      const isSensor = mapping.sensors && Object.values(mapping.sensors).includes(position)
      pillars[position] = new Pillar({
        position,
        stripled: {
          length: configuration.stripleds[isSensor ? 'sensor' : 'default'],
          expectedLength: configuration.hnode['NLEDS_STRIPS'],
          nodeName,
          index
        }
      })
    })
  })
  return pillars
}

function registerNode (nodeToRegister) {
  const mappedNode = mapping.nodes[nodeToRegister.name]
  // ???: throw warning because pillars are not present in mapping ?
  if (!mappedNode) return

  mappedNode.forEach(index => {
    const pillar = pillars[index]
    if (pillar) pillar.register(nodeToRegister)
  })
}
