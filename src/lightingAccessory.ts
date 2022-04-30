/* eslint-disable max-len */
import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';

import { request as HttpRequest } from 'urllib';

import { Aiseg2Platform, Aiseg2Node } from './platform';
import { delay } from './utils';


export interface LightingDevice extends Aiseg2Node {
    displayName: string;
    manufacturer: string;
    model: string;
    serialNumber: string;
    firmwareRevision: string;
    disable?: string;
    state?: string;
    dimmable?: boolean;
    brightness?: number;
    accessory?: LightingAccessory;
}

enum CheckResult {
  OK = '0',
  InProgress = '1',
  Invalid = '2',
}

enum LightState {
  On = '0x30',
  Off = '0x31',
}

export class LightingAccessory {
  private service: Service;

  // Accessory state tracking data
  private States = {
    On: false,
    Brightness: 100,
    BlockUpdate: 0,
  };

  constructor(
    private readonly platform: Aiseg2Platform,
    private readonly accessory: PlatformAccessory,
  ) {

    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, accessory.context.device.manufacturer)
      .setCharacteristic(this.platform.Characteristic.Model, accessory.context.device.model)
      .setCharacteristic(this.platform.Characteristic.SerialNumber, accessory.context.device.serialNumber);
    // .setCharacteristic(this.platform.Characteristic.FirmwareRevision, accessory.context.device.FirmwareRevision);

    const isDimmable = accessory.context.device.dimmable;
    const serviceType = isDimmable === true
      ? this.platform.Service.Lightbulb
      : this.platform.Service.Switch;

    // get the LightBulb service if it exists, otherwise create a new LightBulb service
    this.service = this.accessory.getService(serviceType) || this.accessory.addService(serviceType);

    // set the service name for display as the default name in the Home app
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.displayName);

    // register handlers for the On/Off Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.setOn.bind(this))                // SET - bind to the `setOn` method below
      .onGet(this.getOn.bind(this));               // GET - bind to the `getOn` method below

    if (isDimmable === true) {
      this.platform.log.debug(`Adding brightness props to ${accessory.context.device.displayName}`);
      // register handlers for the Brightness Characteristic
      this.service.getCharacteristic(this.platform.Characteristic.Brightness)
        .onSet(this.setBrightness.bind(this));       // SET - bind to the 'setBrightness` method below

      // set brightness properties for the lightbulb device
      this.service.getCharacteristic(this.platform.Characteristic.Brightness)
        .setProps({
          minValue: 0,
          maxValue: 100,
          minStep: 20,
        });
    }
  }

  // Returns the LightingDevice data from within the accessory context
  getDeviceContext(): LightingDevice {
    //this.platform.log.info(`Context: ${JSON.stringify(this.accessory.context)}`);
    return this.accessory.context.device;
  }

  // Fetch the current state of an AiSEG2 lighting device
  updateLightingState(deviceData: LightingDevice) {
    if (this.States.BlockUpdate >= 1) {
      this.States.BlockUpdate--;
      return;
    }

    const currentState = this.service.getCharacteristic(this.platform.Characteristic.On).value ? 'on' : 'off';
    if (deviceData.state !== currentState ) {
      const updateState = deviceData.state === 'on' ? true : false;

      this.platform.log.info(`AiSEG2 -> ${deviceData.displayName} state set to ${deviceData.state?.toUpperCase()}`);

      this.service.updateCharacteristic(this.platform.Characteristic.On, updateState);
      //this.service.getCharacteristic(this.platform.Characteristic.On).updateValue(updateState);
      this.accessory.context.device.state = deviceData.state;
    }

    if (deviceData.dimmable === true) {
      const currentBrightness = this.service.getCharacteristic(this.platform.Characteristic.Brightness).value;
      if (deviceData.brightness !== currentBrightness) {
        this.platform.log.info(`AiSEG2 -> ${deviceData.displayName} brightness set to ${deviceData.brightness}`);

        this.service.updateCharacteristic(this.platform.Characteristic.Brightness, deviceData.brightness || 0);
        //this.service.getCharacteristic(this.platform.Characteristic.Brightness).updateValue(deviceData.brightness);
        this.accessory.context.device.brightness = deviceData.brightness;
      }
    }
  }

  // Poll for the execution status of an async AiSEG2 change request
  checkStatus(acceptId: number) {
    this.States.BlockUpdate = 10;

    const url = `http://${this.platform.config.host}/data/devices/device/32i1/check`;
    const payload = `data={"acceptId":"${acceptId}","type":"0x92"}`;

    let status = false;
    let count = 6;
    const checkLoop = setInterval(() => {
      const responseHandler = (err, data, res) => {
        if (err) {
          this.platform.log.info(err);
        }

        if (res.status !== 200) {
          this.platform.log.info(`HTTP post failed with status ${res.status}: ${res.statusMessage}`);
          return;
        }

        const response = JSON.parse(data);

        switch (response.result) {
          case CheckResult.OK:
            this.platform.log.debug(`Device state change for ${this.accessory.context.device.displayName} completed succesfully`);
            status = true;
            clearInterval(checkLoop);
            break;
          case CheckResult.InProgress:
            break;
          case CheckResult.Invalid:
            this.platform.log.debug(`Device state change for ${this.accessory.context.device.displayName} is unknown`);
            status = false;
            clearInterval(checkLoop);
            break;
        }
      };

      this.platform.log.debug(`Polling status of async request ID ${acceptId}`);
      HttpRequest(url, {
        method: 'POST',
        rejectUnauthorized: false,
        digestAuth: `aiseg:${this.platform.config.password}`,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: payload,
      }, responseHandler);
      count--;
      if (count === 0) {
        this.platform.log.error(`Timed out waiting for accessory '${this.accessory.context.device.displayName}' to update state`);
        clearInterval(checkLoop);
      }
    }, 500);

    this.States.BlockUpdate = 1;
    return status;
  }

  // Handle set on requests from HomeKit
  async setOn(value: CharacteristicValue) {
    const deviceData = this.accessory.context.device;
    const timestamp = Date.now();
    this.platform.log.debug(`setOn -> ${deviceData.displayName} to ${value ? 'ON' : 'OFF'}`);

    const currentState = this.service.getCharacteristic(this.platform.Characteristic.On).value || false;
    if (value === currentState) {
      return;
    }

    const onOff = value ? LightState.On : LightState.Off;

    const url = `http://${this.platform.config.host}/action/devices/device/32i1/change`;
    const payload = `data={\
                      "token":"${this.platform.Token}",\
                      "nodeId":"${deviceData.nodeId}",\
                      "eoj":"${deviceData.eoj}",\
                      "type":"${deviceData.type}",\
                      "device":{\
                        "onoff":"${onOff}",\
                        "modulate":"-"}\
                      }`.replace(/\s+/g, '');

    this.States.BlockUpdate = 2;

    const responseHandler = (err, data, res) => {
      if (err) {
        this.platform.log.info(err);
      }

      if (res.status !== 200) {
        this.platform.log.info(`HTTP post failed with status ${res.status}: ${res.statusMessage}`);
        return;
      }

      this.platform.log.debug(`Response: '${data}'`);

      const response = JSON.parse(data);

      const result = (Number.isInteger(response.acceptId))
        ? this.checkStatus(response.acceptId)
        : true;

      if (result === true) {
        this.service.updateCharacteristic(this.platform.Characteristic.On, value);

        // this.States.On = value as boolean;
        this.accessory.context.device.state = value ? 'on' : 'off';
        this.States.BlockUpdate = 2;

        this.platform.log.info(`Homebridge -> ${deviceData.displayName} state set to ${value ? 'ON' : 'OFF'}`);
      } else {
        this.platform.log.error(`${deviceData.displayName} update submission failed: ${JSON.stringify(data)}`);
      }
    };

    // Delay power on action in case it is immediately followed by a brightness command
    if (onOff === LightState.On) {
      await delay(50);
    }

    this.platform.log.debug(`Updating device '${deviceData.displayName}' state with ${url}`);
    HttpRequest(url, {
      method: 'POST',
      rejectUnauthorized: false,
      digestAuth: `aiseg:${this.platform.config.password}`,
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: payload,
    }, responseHandler);
  }

  // Handle get on requests from HomeKit
  async getOn(): Promise<CharacteristicValue> {
    const state = this.service.getCharacteristic(this.platform.Characteristic.On).value || false;

    this.platform.log.debug(`GetOn(${this.accessory.context.device.displayName}) <- ${state ? 'ON' : 'OFF'}`);

    return state;
  }

  // Handle set brightness requests from HomeKit
  async setBrightness(value: CharacteristicValue) {
    const deviceData = this.accessory.context.device;
    const timestamp = Date.now();
    this.platform.log.info(`setBrightness -> ${deviceData.displayName} to ${value}`);

    const url = `http://${this.platform.config.host}/action/devices/device/32i1/change`;
    const payload = `data={\
                      "token":"${this.platform.Token}",\
                      "nodeId":"${deviceData.nodeId}",\
                      "eoj":"${deviceData.eoj}",\
                      "type":"${deviceData.type}",\
                      "device":{\
                        "onoff":"-",\
                        "modulate":"0x${value.toString(16)}"}\
                      }`.replace(/\s+/g, '');

    this.States.BlockUpdate = 10;

    const responseHandler = (err, data, res) => {
      if (err) {
        this.platform.log.info(err);
      }

      if (res.status !== 200) {
        this.platform.log.info(`HTTP post failed with status ${res.status}: ${res.statusMessage}`);
        return;
      }

      const response = JSON.parse(data);

      const result = (Number.isInteger(response.acceptId))
        ? this.checkStatus(response.acceptId)
        : true;

      if (result === true) {
        this.service.updateCharacteristic(this.platform.Characteristic.On, 1);
        this.service.updateCharacteristic(this.platform.Characteristic.Brightness, value);

        this.States.On = true;
        this.States.Brightness = value as number;
        this.States.BlockUpdate = 2;

        this.platform.log.info(`Homebridge -> ${deviceData.displayName} brightness set to ${value}%`);
      } else {
        this.platform.log.error(`${deviceData.displayName} brightness update failed`);
      }
    };

    this.platform.log.debug(`Updating device '${deviceData.displayName}' brightness with ${url}`);
    HttpRequest(url, {
      method: 'POST',
      rejectUnauthorized: false,
      digestAuth: `aiseg:${this.platform.config.password}`,
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: payload,
    }, responseHandler);
  }
}