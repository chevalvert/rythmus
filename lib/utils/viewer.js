const { spawn } = require('child_process')

module.exports = (appletPath, log) => {
  const viewer = spawn('processing-java', ['--sketch=' + appletPath, '--run'], { detached: true })
  const killViewer = () => process.kill(-viewer.pid)

  viewer.stdout.on('data', data => log.info(`[viewer] ${data}`))
  viewer.stderr.on('data', data => log.error(`[viewer] ${data}`))

  viewer.on('close', process.exit)

  process.on('uncaughtException', err => {
    log.error(err)
    killViewer()
    process.exit(1)
  })

  process.on('SIGINT', killViewer)
  process.on('SIGTERM', killViewer)
}
