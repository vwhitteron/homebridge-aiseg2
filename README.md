<span align="center">

# Homebridge AiSEG2

A Homebridge platform plugin to control devices managed by a [Panasonic AiSEG2](https://www2.panasonic.biz/ls/densetsu/aiseg/) controller.

[![npm](https://img.shields.io/npm/dt/homebridge-aiseg2)](https://www.npmjs.com/package/homebridge-aiseg2)  

</span>

## Disclaimer

Homebridge AiSEG2 is independently developed and is not in any way affiliated with or endorsed by Panasonic. Any issues or damage resulting
from use of this plugin are not the fault of the developer. Use at your own risk.

## About

Supports [Panasonic Advance Series Link Plus](https://www2.panasonic.biz/jp/densetsu/haisen/switch_concent/advance/lineup/linkplus/) light
switches registered to a Panasonic AiSEG2 controller.

All development and testing has been performed using an MKN704 and MKN713 controllers and should also work with the MKN705 as well. Note
that long term use of the MKN713 was not as stable as the MKN704 with the former failing to respond after a period of time.

## Configuration

To configure the plugin the hostname or IP address of the controller will need to be supplied as well as the password used to login to the
web interface.

    "platforms": [{
        "platform": "AiSEG2",
        "name": "AiSEG2",
        "host": "<controller IP address>",
        "password": "<controller password>",
        "synchroColourTone": true,
        "devices": [
            {
                "name": "<device name>",
                "synchroColourTone": false
            }
        ],
    }]

### Options

|          Option          |  Type   |      Default      |                              Description                                    |
|--------------------------|---------|-------------------|-----------------------------------------------------------------------------|
| `name`                   | string  | `"AiSEG2"`        | Display name for this platform instance in Homebridge.                      |
| `host`                   | string  | `"127.0.0.1"`     | IP address of the AiSEG2 controller                                         |
| `pasword`                | string  | `""`              | Basic auth password for the AiSEG2 controller                               |
| `synchroColourTone`      | boolean | `false`           | Globally enable colour temperature characteristic for all dimmable devices. |
| `devices`                | array   | `[]`              | Per-device overrides (see below).                                           |

#### Per-device overrides

Each entry in the `devices` array targets a specific device by its serial number. The plugin logs this value on first discovery and it can
also be found under the accessory info panel in the web UI.

|       Option        |  Type   | Req |                          Description                            |
|---------------------|---------|-----|-----------------------------------------------------------------|
| `name`              | string  | Yes | The name of the accessory.                                      |
| `synchroColourTone` | boolean | No  | Per-device override for the global `synchroColourTone` setting. |

## Synchro Colour Tone

Panasonic offers [synchro colour tone](https://sumai.panasonic.jp/lighting/home/synchro/feature/) lamps that shift colour temperature
directly in relation to the dimmer brightness setting. When `synchroColourTone` is `true`, the plugin exposes a HomeKit color temperature
characteristic directly linked to brightness so when either the temperature or brightness controls are adjusted the other moves in unison.
This setting attempts to match the colour temperature and brightness curve that is applied within the lamp so that the colour temperature
can be set andpo tentially support adaptive lighting in Apple Home.

## Future Development

Since originally developing the codebase as a quick proof of concept I have added a Panasonic WTY2001 controller for some additional lights.
This controller exposes the lights on the local network via Echonet Lite which is a much better interface and offers finer dimming control
using [homebridge-echonet-light](https://github.com/vwhitteron/homebridge-echonet-light) or
[homebridge-echonet-lite](https://github.com/japaniot/homebridge-echonet-lite).

The code as originally released was not very high quality and has since been massaged into better form with the assistance of AI tooling and
is unlikely to see any further development as it works well enough for day to day use.