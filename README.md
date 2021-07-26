
<p align="center">

<img src="https://github.com/homebridge/branding/raw/master/logos/homebridge-wordmark-logo-vertical.png" width="150">

</p>


# Homebridge AiSEG2 Plugin

 A Homebridge platform plugin to control devices managed by a [Panasonic AiSEG2](https://www2.panasonic.biz/ls/densetsu/aiseg/) controller.

This plugin is currently in a minimal but working state and supports the following AiSEG2 devices:

* Panasonic Advance Series light switches

All development and testing has been performed using an MKN704 controller. It is likely that the code will also work with the MKN705 and KMN713 controllers.

## Configuration

To configure the plugin the hostname or IP address of the controller will need to be supplied as well as the password used to login to the web interface. _Autodiscovery of controllers is not yet implemented._

    "platforms": [{
        "name": "AiSEG2",
        "autodiscover": false,
        "host": "<controller IP address>",
        "password": "<controller password>",
        "platform": "AiSEG2"
    }]

## Future Development

The current codebase was developed as a quick proof of concept and is likely not very well written so needs to be refactored.

At a later date, support for the following additional AiSEG2 devices may be added where possible:

* Air conditioners
* Air purifiers
* Call button alerts
* Delivery box alerts
* Door locks
* EcoCute heat pump water systems
* EV chargers
* Fire alarm alerts
* Gas hot water systems
* Rangehoods
* Under floor heaters
* Window sashes
* Window shutters
