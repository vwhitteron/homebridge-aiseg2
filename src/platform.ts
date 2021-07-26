import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';

import { request as HttpRequest } from 'urllib';
import { load as LoadHtml } from 'cheerio';

import { PLATFORM_NAME, PLUGIN_NAME } from './settings';
import { LightingDevice, LightingAccessory } from './lightingAccessory';


export class Aiseg2Platform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

  public readonly accessories: PlatformAccessory[] = [];

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.log.debug('Finished initializing platform:', this.config.name);

    this.api.on('didFinishLaunching', () => {
      log.debug('Executed didFinishLaunching callback');
      this.discoverDevices();
    });
  }

  configureAccessory(accessory: PlatformAccessory) {
    this.log.info('Loading accessory from cache:', accessory.displayName);
    this.accessories.push(accessory);
  }

  // Discover the various AiSEG2 device types that are compatible with Homekit
  discoverDevices() {
    this.discoverLighting();
  }

  provisionDevice(device: LightingDevice) {
    const uuid = this.api.hap.uuid.generate(device.deviceId);
    const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);

    if (existingAccessory) {
      this.log.info('Restoring existing accessory from cache:', existingAccessory.displayName);

      // if you need to update the accessory.context then you should run `api.updatePlatformAccessories`. eg.:
      // existingAccessory.context.device = device;
      // this.api.updatePlatformAccessories([existingAccessory]);

      new LightingAccessory(this, existingAccessory);

      // it is possible to remove platform accessories at any time using `api.unregisterPlatformAccessories`, eg.:
      // remove platform accessories when no longer present
      // this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [existingAccessory]);
      // this.log.info('Removing existing accessory from cache:', existingAccessory.displayName);
    } else {
      this.log.info('Adding new accessory:', device.displayName);
      const accessory = new this.api.platformAccessory(device.displayName, uuid);
      accessory.context.device = device;
      new LightingAccessory(this, accessory);
      this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
    }
  }

  // Fetch all lighting devices from the AiSEG2 controller
  discoverLighting() {
    const url = `http://${this.config.host}/page/devices/device/32i1?page=1`;

    const responseHandler = (err, data, res) => {
      if (err) {
        this.log.info(err);
      }

      const $ = LoadHtml(data);
      $('.panel').each((index, element) => {
        const deviceData: LightingDevice = {
          displayName: $($(element).find('.lighting_title')[0]).text() || '',
          nodeId: $(element).attr('nodeid') || '',
          eoj: $(element).attr('eoj') || '',
          type: $(element).attr('type') || '',
          nodeIdentNum: $(element).attr('nodeidentnum') || '',
          deviceId: $(element).attr('deviceid') || '',
        };

        this.log.info(`Discovered lighting device '${deviceData.displayName}'`);
        this.log.debug(JSON.stringify(deviceData));

        this.provisionLightingDevices(deviceData);
      });
    };

    this.log.debug(`Fetching lighting devices at ${url}`);
    HttpRequest(url, {
      method: 'GET',
      rejectUnauthorized: false,
      digestAuth: `aiseg:${this.config.password}`,
    }, responseHandler);
  }

  // Provision a lighting device in Homebridge
  provisionLightingDevices(deviceData: LightingDevice) {
    const url = `http://${this.config.host}/data/devices/device/32i1/auto_update`;
    const payload = `data={"page":"1","list":[${JSON.stringify(deviceData)}]}`;

    const responseHandler = (err, data, res) => {
      if (err) {
        this.log.info(err);
      }
      const deviceInfo = JSON.parse(data);
      this.log.debug(`Device info: ${data}`);
      deviceData.state = deviceInfo.panelData[0].state;
      if (deviceInfo.panelData[0].modulate_hidden === 'hidden') {
        deviceData.dimmable = false;
      } else {
        deviceData.dimmable = true;
        deviceData.brightness = deviceInfo.panelData[0].modulate_level;
      }

      this.log.debug(`Device data: ${JSON.stringify(deviceData)}`);

      this.provisionDevice(deviceData);
    };

    this.log.debug(`Fetching lighting device details at ${url}`);
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
}
