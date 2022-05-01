import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';

import { request as HttpRequest } from 'urllib';
import { load as LoadHtml } from 'cheerio';

import { PLATFORM_NAME, PLUGIN_NAME } from './settings';
import { LightingDevice, LightingAccessory } from './lightingAccessory';
import * as deviceInfo from './deviceInfo';
import { deviceIdToHex, hexToString } from './utils';


export interface Aiseg2Node {
  nodeId: string;
  eoj: string;
  type: string;
  nodeIdentNum: string;
  deviceId: string;
}

export class Aiseg2Platform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

  public readonly accessories: PlatformAccessory[] = [];
  public devices: { [uid: string]: LightingAccessory } = {};
  public Token: string;

  private backoff: number;

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.Token = '';

    this.backoff = 0;

    this.log.debug('Finished initializing platform:', this.config.name);

    this.api.on('didFinishLaunching', () => {
      log.debug('Executed didFinishLaunching callback');

      // Get a control token from the AiSEG2 controller
      this.updateControlToken();

      // Refresh the control token periodically
      setInterval(() => {
        this.updateControlToken();
      }, 60000);

      // Refresh all device states often
      setInterval(() => {
        this.updateDeviceStates();
      }, 2500);

      this.discoverDevices();
    });
  }

  configureAccessory(accessory: PlatformAccessory) {
    this.log.info('Loading accessory from cache:', accessory.displayName);
    this.accessories.push(accessory);
  }

  // Fetch the latest token to use for AiSEG2 device action requests
  updateControlToken() {
    const url = `http://${this.config.host}/page/devices/device/32i1?page=1`;

    const responseHandler = (err, data, res) => {
      if (err) {
        this.log.info(err);
      }

      if (res.status !== 200) {
        this.log.info(`HTTP get failed with status ${res.status}: ${res.statusMessage}`);
        return;
      }

      const $ = LoadHtml(data);

      this.Token = $('#main').attr('token') || '';
      this.log.debug(`Retrieved control token '${this.Token}'`);
    };

    this.log.debug(`Fetching control token from ${url}`);
    HttpRequest(url, {
      method: 'GET',
      rejectUnauthorized: false,
      digestAuth: `aiseg:${this.config.password}`,
    }, responseHandler);
  }

  // Discover the various AiSEG2 device types that are compatible with Homekit
  discoverDevices() {
    this.discoverWirelessDevices();
    this.discoverNetworkDevices();
  }

  provisionDevice(devId: string, device: LightingDevice) {
    const uuid = this.api.hap.uuid.generate(device.deviceId);
    const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);

    if (existingAccessory) {
      this.log.info('Restoring cached accessory:', existingAccessory.displayName);

      // if you need to update the accessory.context then you should run `api.updatePlatformAccessories`. eg.:
      // existingAccessory.context.device = device;
      // this.api.updatePlatformAccessories([existingAccessory]);

      this.devices[devId] = new LightingAccessory(this, existingAccessory);

      // it is possible to remove platform accessories at any time using `api.unregisterPlatformAccessories`, eg.:
      // remove platform accessories when no longer present
      // this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [existingAccessory]);
      // this.log.info('Removing existing accessory from cache:', existingAccessory.displayName);
    } else {
      this.log.info('Adding new accessory:', device.displayName);
      const accessory = new this.api.platformAccessory(device.displayName, uuid);
      accessory.context.device = device;
      this.devices[devId] = new LightingAccessory(this, accessory);
      this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
    }
  }

  discoverWirelessDevices() {
    const url = `http://${this.config.host}/page/setting/installation/7314`;

    const responseHandler = (err, data, res) => {
      if (err) {
        this.log.info(err);
      }

      if (res.status !== 200) {
        this.log.info(`HTTP get failed with status ${res.status}: ${res.statusMessage}`);
        return;
      }

      const devData: { [nodeId: string]: LightingDevice } = {};

      const $ = LoadHtml(data);
      $('script').each((index, element) => {
        const content = $(element).html() || '';
        const pattern = /window.onload = function\(\){ init\((.*), \d\); };/;

        let devices = [];
        const match = content.match(pattern);
        if (match) {
          this.log.debug(`Found Wireless device data at script index ${index}: ${content}`);
          devices = JSON.parse(match[1]);
          this.log.info(typeof(devices));
        }


        for (const device of devices) {
          // Only provision switch devices for now
          if (device['devType'] !== '0x92') {
            this.log.debug(`Ignoring non-light device ${device['devName']}`);
            continue;
          }

          const deviceId: string = device['deviceId'];
          const model = hexToString(device['productCode']);
          const deviceData: LightingDevice = {
            displayName: device['devName'] || '',
            manufacturer: device['devMaker'] || '',
            model: model || '',
            serialNumber: deviceId.split('+')[1] || '',
            firmwareRevision: '0.0.0',
            nodeId: device['nodeId'] || '',
            eoj: device['eoj'] || '',
            type: device['devType'] || '',
            nodeIdentNum: '0x' + device['uniqueNo'] || '',
            deviceId: deviceIdToHex(deviceId) || '',
            dimmable: deviceInfo.switchModels[model]['dimmable'] || false,
            state: 'off',
          };

          if (deviceData.dimmable === true) {
            deviceData.brightness = 0;
          }

          const deviceUid = this.generateUid(device);
          devData[deviceUid] = deviceData;

          const devType = device['devType'];
          this.log.info(`Discovered ${deviceInfo.types[devType]} device '${deviceData.displayName}'`);
          this.log.debug(JSON.stringify(deviceData));
        }

      });

      this.provisionLightingDevices(devData);
    };

    this.log.debug(`Fetching lighting devices at ${url}`);
    HttpRequest(url, {
      method: 'GET',
      rejectUnauthorized: false,
      digestAuth: `aiseg:${this.config.password}`,
    }, responseHandler);
  }

  discoverNetworkDevices() {
    const url = `http://${this.config.host}/page/setting/installation/7322`;

    const responseHandler = (err, data, res) => {
      if (err) {
        this.log.info(err);
      }

      if (res.status !== 200) {
        this.log.info(`HTTP get failed with status ${res.status}: ${res.statusMessage}`);
        return;
      }

      //const devData: { [nodeId: string]: LightingDevice } = {};

      const $ = LoadHtml(data);
      $('script').each((index, element) => {
        const content = $(element).html() || '';
        const pattern = /window.onload = function\(\){ init\((.*), \d\); };/;

        let devices = [];
        const match = content.match(pattern);
        if (match) {
          this.log.debug(`Found network device data at script index ${index}: ${content}`);
          devices = JSON.parse(match[1]);
        }

        for (const device of devices) {
          this.log.debug(JSON.stringify(device));
        }
      });
    };

    this.log.debug(`Fetching network devices at ${url}`);
    HttpRequest(url, {
      method: 'GET',
      rejectUnauthorized: false,
      digestAuth: `aiseg:${this.config.password}`,
    }, responseHandler);
  }

  // Provision a lighting device in Homebridge
  provisionLightingDevices(deviceData: { [nodeId: string]: LightingDevice }) {
    for (const [devId, device] of Object.entries(deviceData)) {
      if (device.type === '0x92') {
        this.provisionDevice(devId, device);
      }
    }
  }

  // Fetch the current state of all AiSEG2 devices
  updateDeviceStates() {
    if (this.backoff > 0) {
      this.log.debug(`Skip device update due to backoff (${this.backoff})`);
      this.backoff--;
      return;
    }

    const url = `http://${this.config.host}/data/devices/device/32i1/auto_update`;

    const payloadDevices: Aiseg2Node[] = [];

    for (const [, accessory] of Object.entries(this.devices)) {
      const device = accessory.getDeviceContext();
      payloadDevices.push({
        nodeId: device.nodeId,
        eoj: device.eoj,
        type: device.type,
        nodeIdentNum: device.nodeIdentNum,
        deviceId: device.deviceId,
      });
    }

    const payload = `data={"page":"1","list":${JSON.stringify(payloadDevices)}}`;

    const responseHandler = (err, data, res) => {
      if (err) {
        this.backoff += this.backoff <= 25 ? 3 : 0;
        this.log.info(err);
      }

      if (res.status !== 200) {
        this.backoff += this.backoff <= 25 ? 3 : 0;
        this.log.info(`HTTP post failed with status ${res.status}: ${res.statusMessage}`);
        return;
      }

      this.backoff = 0;

      const deviceInfo = JSON.parse(data);

      for (const device of deviceInfo.panelData) {
        const devId = device.nodeId + device.eoj;
        const accessory = this.devices[devId];
        const deviceData = accessory.getDeviceContext();

        deviceData.state = device.state;
        if (deviceData.dimmable) {
          deviceData.brightness = device.modulate_level * 20;
        }
        accessory.updateLightingState(deviceData);
      }
    };

    HttpRequest(url, {
      method: 'POST',
      rejectUnauthorized: false,
      digestAuth: `aiseg:${this.config.password}`,
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: payload,
    }, responseHandler);
  }

  // Generate a unique ID for a given Aiseg2Node object
  generateUid(obj: Aiseg2Node): string {
    return obj['nodeId'] + obj['eoj'];
  }
}

// Get device version information
/*
  getVersionInfo() {
    const url = `http://${this.config.host}/page/setting/installation/7315`;

    const responseHandler = (err, data, res) => {
      if (err) {
        this.log.info(err);
      }

      if (res.status !== 200) {
        this.log.info(`HTTP get failed with status ${res.status}: ${res.statusMessage}`);
        return;
      }

      const devData = {};

      const $ = LoadHtml(data);
      $('script').each((index, element) => {
        const content = $(element).html() || '';
        const pattern = /window.onload = function\(\){ init\((.*), \d\); };/;

        let devices = [];

        const match = content.match(pattern);
        if (match) {
          this.log.debug(`Found Wireless device data at script index ${index}: ${content}`);
          devices = JSON.parse(match[1]);
          // this.log.debug(`Result: ${JSON.stringify(devices, null, 2)}`);
        }
      });
    };

    this.log.debug(`Fetching lighting devices at ${url}`);
    HttpRequest(url, {
      method: 'GET',
      rejectUnauthorized: false,
      digestAuth: `aiseg:${this.config.password}`,
    }, responseHandler);
  }
  */