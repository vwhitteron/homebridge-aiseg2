import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';

import { load as LoadHtml } from 'cheerio';

import { PLATFORM_NAME, PLUGIN_NAME } from './settings';
import { LightingDevice, LightingAccessory } from './lightingAccessory';
import * as deviceInfo from './deviceInfo';
import { parseDeviceId } from './utils';
import { AiSeg2HttpClient } from './httpClient';
import { RawWirelessDevice, RawVersionDevice } from './aiseg2-interfaces';
import {
  TOKEN_REFRESH_INTERVAL_MS,
  DEVICE_STATE_REFRESH_INTERVAL_MS,
  HTTP_OK_STATUS,
  BACKOFF_INCREMENT,
  BACKOFF_MAX,
  BRIGHTNESS_MULTIPLIER,
} from './constants';


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
  public readonly httpClient: AiSeg2HttpClient;
  private tokenRefreshTimer: NodeJS.Timeout | undefined;
  private deviceStateRefreshTimer: NodeJS.Timeout | undefined;

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.Token = '';
    this.backoff = 0;
    this.httpClient = new AiSeg2HttpClient(this.config.host, this.config.password);

    this.log.debug('Finished initializing platform:', this.config.name);

    if (!this.config.host || this.config.host === '127.0.0.1' || !this.config.password) {
      this.log.warn('Plugin is not configured. Please set the host and password in the Homebridge settings.');
      return;
    }

    this.api.on('didFinishLaunching', () => {
      this.log.debug('Executed didFinishLaunching callback');

      // Get a control token from the AiSEG2 controller
      this.updateControlToken().catch((err) => {
        this.log.error(`Token refresh failed: ${err}`);
      });

      // Refresh the control token periodically
      this.tokenRefreshTimer = setInterval(() => {
        this.updateControlToken().catch((err) => {
          this.log.error(`Token refresh failed: ${err}`);
        });
      }, TOKEN_REFRESH_INTERVAL_MS);

      // Refresh all device states often
      this.deviceStateRefreshTimer = setInterval(() => {
        this.updateDeviceStates().catch((err) => {
          this.log.error(`Device state refresh failed: ${err}`);
        });
      }, DEVICE_STATE_REFRESH_INTERVAL_MS);

      this.discoverDevices().catch((err) => {
        this.log.error(`Device discovery failed: ${err}`);
      });
    });

    // Clean up timers and resources when Homebridge shuts down
    this.api.on('shutdown', () => {
      this.log.info('Shutting down Aiseg2Platform');
      this.close();
    });
  }

  configureAccessory(accessory: PlatformAccessory) {
    this.log.info('Loading accessory from cache:', accessory.displayName);
    this.accessories.push(accessory);
  }

  // Fetch the latest token to use for AiSEG2 device action requests
  async updateControlToken() {
    const url = `${this.httpClient.baseUrl}/page/devices/device/32i1?page=1`;

    try {
      const { data, res } = await this.httpClient.get(url);

      if (res.statusCode !== HTTP_OK_STATUS) {
        this.log.error(`HTTP get failed with status ${res.statusCode}: ${res.statusMessage}`);
        return;
      }

      const $ = LoadHtml(data);

      this.Token = $('#main').attr('token') || '';
      this.log.debug(`Retrieved control token '${this.Token}'`);
    } catch (err) {
      this.log.error(`Failed to retrieve control token: ${err}`);
    }
  }

  // Discover the various AiSEG2 device types that are compatible with Homekit
  async discoverDevices() {
    let versionMap: Map<string, string>;
    try {
      versionMap = await this.getVersionInfo();
    } catch (err) {
      this.log.error(`Failed to get device version info: ${err}`);
      return;
    }

    try {
      await this.discoverWirelessDevices(versionMap);
    } catch (err) {
      this.log.error(`Failed to discover wireless devices: ${err}`);
    }

    try {
      await this.discoverNetworkDevices();
    } catch (err) {
      this.log.error(`Failed to discover network devices: ${err}`);
    }
  }

  // Fetch firmware version info for all wireless devices, keyed by nodeId+eoj
  async getVersionInfo(): Promise<Map<string, string>> {
    const url = `${this.httpClient.baseUrl}/page/setting/installation/7315`;
    const versionMap = new Map<string, string>();

    try {
      const { data, res } = await this.httpClient.get(url);

      if (res.statusCode !== HTTP_OK_STATUS) {
        this.log.error(`HTTP get failed with status ${res.statusCode}: ${res.statusMessage}`);
        return versionMap;
      }

      const $ = LoadHtml(data);
      $('script').each((_index, element) => {
        const content = $(element).html() || '';
        const match = content.match(/window\.onload\s*=\s*init\((\{.*\})\);/s);
        if (!match) {
          return;
        }
        const parsed: { list: RawVersionDevice[] } = JSON.parse(match[1]);
        for (const entry of parsed.list) {
          if (entry.nodeId && entry.eoj && entry.version) {
            versionMap.set(entry.nodeId + entry.eoj, entry.version);
          }
        }
      });

      this.log.debug(`Loaded firmware versions for ${versionMap.size} devices`);
    } catch (err) {
      this.log.error(`Failed to retrieve version info: ${err}`);
    }

    return versionMap;
  }

  provisionDevice(devId: string, device: LightingDevice) {
    const uuid = this.api.hap.uuid.generate(device.deviceId);
    const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);

    if (existingAccessory) {
      this.log.info('Restoring cached accessory:', existingAccessory.displayName);

      existingAccessory.context.device = device;
      this.api.updatePlatformAccessories([existingAccessory]);

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

  async discoverWirelessDevices(versionMap: Map<string, string> = new Map()) {
    const url = `${this.httpClient.baseUrl}/page/setting/installation/7314`;

    try {
      const { data, res } = await this.httpClient.get(url);

      if (res.statusCode !== HTTP_OK_STATUS) {
        this.log.error(`HTTP get failed with status ${res.statusCode}: ${res.statusMessage}`);
        return;
      }

      const devData: { [nodeId: string]: LightingDevice } = {};

      const $ = LoadHtml(data);
      $('script').each((index, element) => {
        const content = $(element).html() || '';
        const pattern = /window.onload = function\(\){ init\((.*), \d\); };/;

        let devices: RawWirelessDevice[] = [];
        const match = content.match(pattern);
        if (match) {
          this.log.debug(`Found Wireless device data at script index ${index}: ${content}`);
          devices = JSON.parse(match[1]);
        }


        for (const device of devices) {
          // Only provision switch devices for now
          if (device.devType !== '0x92') {
            this.log.debug(`Ignoring non-light device ${device.devName}`);
            continue;
          }

          const deviceId = parseDeviceId(device.deviceId);
          const modelInfo = deviceInfo.getSwitchCharacteristics(device.deviceId);
          const deviceData: LightingDevice = {
            displayName: device.devName || '',
            manufacturer: device.devMaker || '',
            model: deviceId.model,
            serialNumber: deviceId.serial,
            firmwareRevision: (versionMap.get(device.nodeId + device.eoj) ?? 'Ver.0.0.0').replace(/^Ver\./, ''),
            nodeId: device.nodeId || '',
            eoj: device.eoj || '',
            type: device.devType || '',
            nodeIdentNum: device.uniqueNo ? `0x${device.uniqueNo}` : '',
            deviceId: deviceId.asHex,
            dimmable: modelInfo?.dimmable ?? false,
            state: 'off',
          };

          if (deviceData.dimmable === true) {
            deviceData.brightness = 0;
            const globalColorTemp = (this.config.synchroColourTone as boolean | undefined) ?? false;
            const deviceConfig = (this.config.devices as Array<{ name: string; synchroColourTone?: boolean }> | undefined)
              ?.find(d => d.name === deviceData.displayName);
            deviceData.colorTemperature = deviceConfig?.synchroColourTone ?? globalColorTemp;
          }

          const deviceUid = this.generateUid(device);
          devData[deviceUid] = deviceData;

          const devType = device.devType;
          this.log.info(`Discovered ${deviceInfo.types[devType]} device '${deviceData.displayName}'`);
          this.log.debug(JSON.stringify(deviceData));
        }

      });

      this.provisionLightingDevices(devData);
    } catch (err) {
      this.log.error(`Failed to discover wireless devices: ${err}`);
    }
  }

  async discoverNetworkDevices() {
    const url = `${this.httpClient.baseUrl}/page/setting/installation/7322`;

    try {
      const { data, res } = await this.httpClient.get(url);

      if (res.statusCode !== HTTP_OK_STATUS) {
        this.log.error(`HTTP get failed with status ${res.statusCode}: ${res.statusMessage}`);
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
    } catch (err) {
      this.log.error(`Failed to discover network devices: ${err}`);
    }
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
  async updateDeviceStates() {
    if (this.backoff > 0) {
      this.log.debug(`Skip device update due to backoff (${this.backoff})`);
      this.backoff--;
      return;
    }

    const url = `${this.httpClient.baseUrl}/data/devices/device/32i1/auto_update`;

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

    try {
      const { data, res } = await this.httpClient.post(url, payload);

      if (res.statusCode !== HTTP_OK_STATUS) {
        this.backoff = Math.min(this.backoff + BACKOFF_INCREMENT, BACKOFF_MAX);
        this.log.info(`HTTP post failed with status ${res.statusCode}: ${res.statusMessage}`);
        return;
      }

      this.backoff = 0;

      const deviceStateData = JSON.parse(data);

      for (const device of deviceStateData.panelData) {
        const devId = device.nodeId + device.eoj;
        const accessory = this.devices[devId];
        if (!accessory) {
          this.log.debug(`Unknown device ${devId}, skipping state update`);
          continue;
        }
        accessory.updateLightingState({
          ...accessory.getDeviceContext(),
          state: device.state,
          brightness: device.modulate_level * BRIGHTNESS_MULTIPLIER,
        });
      }
    } catch (err) {
      this.backoff = Math.min(this.backoff + BACKOFF_INCREMENT, BACKOFF_MAX);
      this.log.error(`Failed to update device states: ${err}`);
    }
  }

  // Generate a unique ID for a given wireless device
  generateUid(obj: RawWirelessDevice): string {
    return obj.nodeId + obj.eoj;
  }

  // Clean up timers when Homebridge shuts down or the platform is reloaded
  close() {
    if (this.tokenRefreshTimer) {
      clearInterval(this.tokenRefreshTimer);
      this.tokenRefreshTimer = undefined;
      this.log.debug('Cleared token refresh timer');
    }
    if (this.deviceStateRefreshTimer) {
      clearInterval(this.deviceStateRefreshTimer);
      this.deviceStateRefreshTimer = undefined;
      this.log.debug('Cleared device state refresh timer');
    }
  }
}
