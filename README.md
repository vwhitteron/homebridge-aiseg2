
<p align="center">

<img src="https://github.com/homebridge/branding/raw/master/logos/homebridge-wordmark-logo-vertical.png" width="150">

</p>


# Homebridge AiSEG2 Plugin

A Homebridge platform plugin to control devices managed by a [Panasonic AiSEG2](https://www2.panasonic.biz/ls/densetsu/aiseg/) controller.

* Panasonic Advance Series light switches

All development and testing has been performed using an MKN704 and MKN713 controllers and should also work with the MKN705 as well.
Note that long term use of the MKN713 was not as stable as the MKN704 with the former failing to respond after a period of time.

## Configuration

To configure the plugin the hostname or IP address of the controller will need to be supplied as well as the password used to login to the
web interface.

    "platforms": [{
        "platform": "AiSEG2",
        "name": "AiSEG2",
        "host": "<controller IP address>",
        "password": "<controller password>",
        "colorTemperature": true,
        "devices": [
            {
                "name": "<device name>",
                "colorTemperature": false
            }
        ],
    }]

Setting colorTemperature to `true` enables temperature control for all dimmable switches. Devices can also override the global
temperature control on an individual basis.

## Future Development

Since originally developing the codebase as a quick proof of concept I have added a Panasonic WTY2001 controller for some additional lights.
This controller exposes the lights on the local network via Echonet Lite which is a much better interface and offers finer dimming control
using [homebridge-echonet-lite](https://github.com/japaniot/homebridge-echonet-lite).

The code as originally released was not very high quality and has since been massaged into better form with the assistance of AI tooling and
is unlikely to see any further development as it works well enough for day to day use.