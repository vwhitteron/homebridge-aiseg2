import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';

import { request as HttpRequest } from 'urllib';
import { load as LoadHtml } from 'cheerio';

import { Aiseg2Platform } from './platform';


export interface LightingDevice {
    displayName: string;
    nodeId: string;
    eoj: string;
    type: string;
    nodeIdentNum: string;
    deviceId: string;
    disable?: string;
    state?: string;
    dimmable?: boolean;
    brightness?: number;
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
    Token: '',
    BlockUpdate: 0,
  };

  constructor(
    private readonly platform: Aiseg2Platform,
    private readonly accessory: PlatformAccessory,
  ) {

    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Panasonic')
      .setCharacteristic(this.platform.Characteristic.Model, 'Default-Model')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, 'Default-Serial');

    // get the LightBulb service if it exists, otherwise create a new LightBulb service
    this.service = this.accessory.getService(this.platform.Service.Lightbulb) || this.accessory.addService(this.platform.Service.Lightbulb);

    // set the service name for display as the default name in the Home app
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.displayName);

    // register handlers for the On/Off Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.setOn.bind(this))                // SET - bind to the `setOn` method below
      .onGet(this.getOn.bind(this));               // GET - bind to the `getOn` method below

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

    // Get a control token from the AiSEG2 controller
    this.updateControlToken();

    // Refresh the control token every 15 seconds
    setInterval(() => {
      this.updateControlToken();
    }, 15000);

    // Update lighting accessory characteristics values asynchronously
    setInterval(() => {
      this.updateLightingState();
    }, 1000);
  }

  // Fetch the current state of an AiSEG2 lighting device
  updateLightingState() {
    if (this.States.BlockUpdate >= 1) {
      this.States.BlockUpdate--;
      return;
    }

    const url = `http://${this.platform.config.host}/data/devices/device/32i1/auto_update`;
    const deviceData = this.accessory.context.device;
    delete deviceData.disable;
    delete deviceData.state;
    delete deviceData.dimmable;
    delete deviceData.brightness;
    const payload = `data={"page":"1","list":[${JSON.stringify(deviceData)}]}`;

    const responseHandler = (err, data, res) => {
      if (err) {
        this.platform.log.info(err);
      }

      if (res.status !== 200) {
        this.platform.log.info(`HTTP post failed with status ${res.status}: ${res.statusMessage}`);
        return;
      }

      const deviceInfo = JSON.parse(data);

      if (deviceInfo.panelData[0].state === 'on') {
        if (this.States.On === false) {
          this.States.On = true;
          this.platform.log.info(`${deviceData.displayName} state changed to ON`);
        }
        this.service.updateCharacteristic(this.platform.Characteristic.On, true);
      } else {
        if (this.States.On === true) {
          this.States.On = false;
          this.platform.log.info(`${deviceData.displayName} state changed to OFF`);
        }
        this.service.updateCharacteristic(this.platform.Characteristic.On, false);
      }
      if (deviceInfo.panelData[0].modulate_hidden !== 'hidden') {
        const brightnessLevel = deviceInfo.panelData[0].modulate_level * 20;
        if (brightnessLevel !== this.States.Brightness) {
          this.States.Brightness = brightnessLevel;
          this.platform.log.info(`${deviceData.displayName} brightness changed to ${this.States.Brightness}%`);
        }
        this.service.updateCharacteristic(this.platform.Characteristic.Brightness,
          this.States.Brightness);
      }
    };

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

  // Fetch the latest token to use for AiSEG2 device action requests
  updateControlToken() {
    const url = `http://${this.platform.config.host}/page/devices/device/32i1?page=1`;

    const responseHandler = (err, data, res) => {
      if (err) {
        this.platform.log.info(err);
      }

      if (res.status !== 200) {
        this.platform.log.info(`HTTP get failed with status ${res.status}: ${res.statusMessage}`);
        return;
      }

      const $ = LoadHtml(data);

      this.States.Token = $('#main').attr('token') || '';
      this.platform.log.debug(`Retrieved control token '${this.States.Token}'`);
    };

    this.platform.log.debug(`Fetching control token from ${url}`);
    HttpRequest(url, {
      method: 'GET',
      rejectUnauthorized: false,
      digestAuth: `aiseg:${this.platform.config.password}`,
    }, responseHandler);
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
    if (value === this.States.On) {
      return;
    }

    const onOff = (value === true)
      ? LightState.On
      : LightState.Off;

    const deviceData = this.accessory.context.device;

    const url = `http://${this.platform.config.host}/action/devices/device/32i1/change`;
    const payload = `data={\
                      "token":"${this.States.Token}",\
                      "nodeId":"${deviceData.nodeId}",\
                      "eoj":"${deviceData.eoj}",\
                      "type":"${deviceData.type}",\
                      "device":{\
                        "onoff":"${onOff}",\
                        "modulate":"-"}\
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

      this.platform.log.debug(`Response: '${data}'`);

      const response = JSON.parse(data);

      const result = (Number.isInteger(response.acceptId))
        ? this.checkStatus(response.acceptId)
        : true;

      if (result === true) {
        this.service.updateCharacteristic(this.platform.Characteristic.On, value);

        this.States.On = value as boolean;
        this.States.BlockUpdate = 2;

        this.platform.log.info(`${deviceData.displayName} switched ${value ? 'ON' : 'OFF'}`);
      } else {
        this.platform.log.error(`${deviceData.displayName} update submission failed: ${JSON.stringify(data)}`);
      }
    };

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
    const deviceData = this.accessory.context.device;

    this.platform.log.debug(`Requested state for ${deviceData.displayName} is ${this.States.On ? 'ON' : 'OFF'}`);
    this.service.updateCharacteristic(this.platform.Characteristic.On, this.States.On);

    return this.States.On;
  }

  // Handle set brightness requests from HomeKit
  async setBrightness(value: CharacteristicValue) {
    const deviceData = this.accessory.context.device;

    const url = `http://${this.platform.config.host}/action/devices/device/32i1/change`;
    const payload = `data={\
                      "token":"${this.States.Token}",\
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

        this.platform.log.info(`${deviceData.displayName} brightness set to ${value}%`);
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
