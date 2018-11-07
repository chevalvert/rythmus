const { map, lerp } = require('missing-math')

let CYCLE = 1
require('@utils/keyboard')(key => {
  if (key.name === 'up') CYCLE = CYCLE >= 5 ? 1 : CYCLE + 1
  if (key.name === 'down') CYCLE = CYCLE > 1 ? CYCLE - 1 : 5
  console.log(`CYCLE #${CYCLE}`)
})

// NOTE: filename and runner are needed by @animations wrapper in order to enable HMR
module.exports.filename = __filename
module.exports.runner = ({ rythmus, players }) => (frameCount, weight) => {
  players.forEach(player => {
    const dir = z => Math.abs(rythmus.height * player.index - z)

    // TODO: use discrete logic (w/ weight) instead of switch
    switch (CYCLE) {
      case 1: {
        if (!player.confidence) return

        // TODO: sinusoïde w/ pulse
        const side = player.index === 0 ? 'inside' : 'outside'
        const zmin = 20
        const zmax = rythmus.height - 20

        player._counter = player._counter || 0
        player._counter += (player.point ** 2) * 10
        player._counter += 0.5

        for (let i = 0; i < rythmus.circumference; i++) {
          const v = (Math.sin(player._counter * 0.02 + map(i, 0, rythmus.circumference, 0, Math.PI * 2)) + 1) / 2
          const z = lerp(zmin, zmax, v)
          for (let zoff = z - 4; zoff < z; zoff++) {
            rythmus[side](i, dir(zoff), player.color)
          }
        }

        // const side = player.index === 0 ? 'both' : 'both'
        // const zmin = rythmus.height / 2 - 10
        // const zmax = rythmus.height / 2 + 10
        // const globalThickness = weight * 10
        // player.history.forEach((point, index) => {
        //   // NOTE: flip history, so the apex travel from user and not towards him
        //   index = player.history.length - index

        //   // NOTE: rotate the second player
        //   if (player.index === 1) index = (index + rythmus.circumference / 2) % rythmus.circumference

        //   const localThickness = (1 - player.point) * 10
        //   const thickness = globalThickness + localThickness

        //   const z = lerp(zmin, zmax, point)
        //   for (let zoff = -thickness / 2; zoff < thickness / 2; zoff++) {
        //     rythmus[side](index, dir(z + zoff), player.color)
        //     rythmus[side](rythmus.symmetric(index), dir(z + zoff), player.color)
        //   }
        // })
        break
      }

      case 2: {
        const side = player.index === 0 ? 'inside' : 'outside'

        const zmin = rythmus.height / 2 - 10
        const zmax = rythmus.height / 2 + 10

        const globalThickness = weight * 10

        player.history.forEach((point, index) => {
          // NOTE: flip history, so the apex travel from user and not towards him
          index = player.history.length - index

          // NOTE: rotate the second player
          if (player.index === 1) index = (index + rythmus.circumference / 2) % rythmus.circumference

          const localThickness = (1 - player.point) * 10
          const thickness = globalThickness + localThickness

          const z = lerp(zmin, zmax, point)
          for (let zoff = -thickness / 2; zoff < thickness / 2; zoff++) {
            rythmus[side](index, dir(z + zoff), player.color)
            rythmus[side](rythmus.symmetric(index), dir(z + zoff), player.color)
          }
        })
        break
      }

      case 3: {
        const side = player.index === 0 ? 'inside' : 'outside'

        const zmin = rythmus.height / 2 - 10
        const zmax = rythmus.height / 2 + 10

        const globalThickness = weight * 30

        player.history.forEach((point, index) => {
          // NOTE: flip history, so the apex travel from user and not towards him
          index = player.history.length - index

          // NOTE: rotate the second player
          if (player.index === 1) index = (index + rythmus.circumference / 2) % rythmus.circumference

          const localThickness = (1 - player.point) * 30
          const thickness = globalThickness + localThickness

          const z = lerp(zmin, zmax, point)
          for (let zoff = -thickness / 2; zoff < thickness / 2; zoff++) {
            rythmus[side](index, dir(z + zoff), player.color)
            rythmus[side](rythmus.symmetric(index), dir(z + zoff), player.color)
          }
        })
        break
      }

      case 4: {
        const side = player.index === 0 ? 'both' : 'both'

        const zmin = 0
        const zmax = rythmus.height / 2

        player.history.forEach((point, index) => {
          // NOTE: flip history, so the apex travel from user and not towards him
          index = player.history.length - index

          // NOTE: rotate the second player
          if (player.index === 1) index = (index + rythmus.circumference / 2) % rythmus.circumference

          for (let z = lerp(zmin, zmax, point); z < zmax; z++) {
            rythmus[side](index, dir(z), player.color)
            rythmus[side](rythmus.symmetric(index), dir(z), player.color)
          }
        })
        break
      }

      case 5: {
        const side = player.index === 0 ? 'inside' : 'outside'

        const zmin = 0

        player.history.forEach((point, index) => {
          // NOTE: flip history, so the apex travel from user and not towards him
          index = player.history.length - index

          const zmax = (rythmus.height / 2) * player.confidence

          // NOTE: rotate the second player
          if (player.index === 1) index = (index + rythmus.circumference / 2) % rythmus.circumference

          for (let z = 0; z < lerp(zmin, zmax, point); z++) {
            rythmus[side](index, dir(z), player.color)
            rythmus[side](rythmus.symmetric(index), dir(z), player.color)
          }
        })
        break
      }
    }
  })
}
