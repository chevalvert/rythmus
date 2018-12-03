# rythmus-app [<img src="https://github.com/chevalvert.png?size=100" align="right">](http://chevalvert.fr/)
**[Rythmus](https://github.com/chevalvert?q=rythmus)** main app

<br>

## **[Rythmus](https://github.com/chevalvert?q=rythmus)** ecosystem
- `rythmus` : Rythmus main app
- [`rythmus-assistant`](https://github.com/chevalvert/rythmus-assistant) : Rythmus mapping and configuration assistant
- [`hemisphere-project/stratum-hnode#rythmus`](https://github.com/Hemisphere-Project/stratum-hnode/tree/rythmus) : leds UDP server & client
- [`rythmus-viewer`](https://github.com/chevalvert/rythmus-viewer) : Rythmus `hnode` 3D previewer
- [`rythmus-sensor`](https://github.com/chevalvert/rythmus-sensor) : Rythmus heart sensor firmware

## Installation 
```sh
curl https://raw.githubusercontent.com/chevalvert/rythmus/master/scripts/install.sh | bash
```

## Usage
```
rythmus

Usage:
  rythmus --config=<path>
  rythmus --help
  rythmus --version

Options:
  -h, --help              Show this screen.
  -v, --version           Print the current version.
  --config=<path>         Override the default config with a given json file.
  --force-animation=<player-animation>
                          Force <player-animation> as both players animations.
  --hot                   Enable hot reloading of all configuration files
                          (including .rythmusrc, but excluding env and cli args)
                          and hot module replacement of all animations.
  --log-level=<level>     Set the log level (default is 'info').
  --viewer=<path>         Open rythmus-viewer as a previewer.

Log level:
  0, emergency            System is unusable.
  1, alert                Action must be taken immediately.
  2, critical             The system is in critical condition.
  3, error                Error condition.
  4, warning              Warning condition.
  5, notice               A normal but significant condition.
  6, info (default)       A purely informational message.
  7, debug                Messages to debug an application.

```
<sup>See [`.apprc`](.apprc) and the [`rc` package](https://github.com/dominictarr/rc#standards) for advanced options.</sup>

### Connection
To connect to Rythmus via UDP, use the following IPV4 config:
```
IP Address  : 192.168.0.200
Subnet Mask : 255.255.255.0
Router      : 192.168.0.1
```

## Tests
```sh
npm run test:sensors
npm run test:hearts
npm run test:players
npm run test:rythmus
npm run test:performances
```

###### Plotting values using [`gnuplot`](http://www.gnuplot.info/) and [`feedgnuplot`](https://github.com/dkogan/feedgnuplot)
```sh
npm run graph:sensors
npm run graph:hearts
npm run graph:players
npm run graph:performances
```

## Development

### Installation
```sh
git clone https://github.com/chevalvert/rythmus.git rythmus-assistant
cd rythmus-assistant
npm run install
```

### Usage
```sh
node . --hot --config=config/config.ENV.json
```
<sup>See [`config/`](config) for more examples.</sup>

## License
[MIT.](https://tldrlegal.com/license/mit-license)
