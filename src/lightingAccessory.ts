import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';
import { Aiseg2Platform, Aiseg2Node } from './platform';
import {
  HTTP_OK_STATUS,
  STATUS_POLL_MAX_COUNT,
} from './constants';
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
  colorTemperature?: boolean;
}

// Soft-linear curve: 0–90% brightness → 2200–2700K (quadratic ease), 90–100% → 2700–6200K (linear)
function brightnessToMired(brightness: number): number {
  let kelvin: number;
  if (brightness <= 90) {
    const t = brightness / 90;
    kelvin = 2200 + (t * t) * 500;
  } else {
    const t = (brightness - 90) / 10;
    kelvin = 2700 + t * 3500;
  }
  return Math.min(454, Math.max(161, Math.round(1_000_000 / kelvin)));
}

// Inverse of brightnessToMired — result rounded to nearest 20% device step
function miredToBrightness(mired: number): number {
  const kelvin = 1_000_000 / mired;
  let brightness: number;
  if (kelvin <= 2700) {
    const eased = Math.max(0, (kelvin - 2200) / 500);
    brightness = Math.sqrt(eased) * 90;
  } else {
    const t = (kelvin - 2700) / 3500;
    brightness = 90 + t * 10;
  }
  return Math.min(100, Math.max(0, Math.round(brightness / 20) * 20));
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
  private readonly service: Service;

  // countdown timer to block state updates
  private blockUpdate = 0;

  constructor(
    private readonly platform: Aiseg2Platform,
    private readonly accessory: PlatformAccessory,
  ) {

    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, accessory.context.device.manufacturer)
      .setCharacteristic(this.platform.Characteristic.Model, accessory.context.device.model)
      .setCharacteristic(this.platform.Characteristic.SerialNumber, accessory.context.device.serialNumber)
      .setCharacteristic(this.platform.Characteristic.FirmwareRevision, accessory.context.device.firmwareRevision);

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
      this.service.getCharacteristic(this.platform.Characteristic.Brightness)
        .onSet(this.setBrightness.bind(this))
        .setProps({ minValue: 0, maxValue: 100, minStep: 20 });

      if (accessory.context.device.colorTemperature === true) {
        this.platform.log.debug(`Adding color temperature to ${accessory.context.device.displayName}`);
        this.service.getCharacteristic(this.platform.Characteristic.ColorTemperature)
          .onSet(this.setColorTemperature.bind(this))
          .onGet(this.getColorTemperature.bind(this))
          .setProps({ minValue: 161, maxValue: 454 });

        const { AdaptiveLightingController, AdaptiveLightingControllerMode } = this.platform.api.hap;
        this.accessory.configureController(
          new AdaptiveLightingController(this.service, { controllerMode: AdaptiveLightingControllerMode.MANUAL }),
        );
      }
    }
  }

  // Returns the LightingDevice data from within the accessory context
  getDeviceContext(): LightingDevice {
    //this.platform.log.info(`Context: ${JSON.stringify(this.accessory.context)}`);
    return this.accessory.context.device;
  }

  // Fetch the current state of an AiSEG2 lighting device
  updateLightingState(deviceData: LightingDevice) {
    if (this.blockUpdate >= 1) {
      this.blockUpdate--;
      return;
    }

    const currentState = (this.service.getCharacteristic(this.platform.Characteristic.On).value as boolean) ? 'on' : 'off';

    if (deviceData.state === '') {
      return;
    }

    if (deviceData.state !== currentState) {

      const updateState = deviceData.state === 'on' ? true : false;

      this.platform.log.info(`AiSEG2 -> ${deviceData.displayName} state set to ${deviceData.state?.toUpperCase()}`);

      this.service.updateCharacteristic(this.platform.Characteristic.On, updateState);

      this.accessory.context.device.state = deviceData.state;
    }

    if (deviceData.dimmable === true) {

      const currentBrightness = this.service.getCharacteristic(this.platform.Characteristic.Brightness).value;

      if (deviceData.brightness !== currentBrightness) {
        this.platform.log.info(`AiSEG2 -> ${deviceData.displayName} brightness set to ${deviceData.brightness}`);

        this.service.updateCharacteristic(this.platform.Characteristic.Brightness, deviceData.brightness || 0);

        this.accessory.context.device.brightness = deviceData.brightness;

        if (deviceData.colorTemperature === true) {
          const mired = brightnessToMired(deviceData.brightness || 0);
          this.service.updateCharacteristic(this.platform.Characteristic.ColorTemperature, mired);
        }
      }
    }
  }

  // Poll for the execution status of an async AiSEG2 change request
  async checkStatus(acceptId: number): Promise<boolean> {
    this.blockUpdate = 10;

    const url = `${this.platform.httpClient.baseUrl}/data/devices/device/32i1/check`;
    const payload = `data={"acceptId":"${acceptId}","type":"0x92"}`;

    const displayName = this.accessory.context.device.displayName;

    for (let count = STATUS_POLL_MAX_COUNT; count > 0; count--) {
      this.platform.log.debug(`Polling status of async request ID ${acceptId} (attempt ${STATUS_POLL_MAX_COUNT - count + 1}/${STATUS_POLL_MAX_COUNT})`);

      try {
        const { data, res } = await this.platform.httpClient.post(url, payload);

        if (res.statusCode !== HTTP_OK_STATUS) {
          this.platform.log.info(`HTTP post failed with status ${res.statusCode}: ${res.statusMessage}`);
          await delay(1000);
          continue;
        }

        const response = JSON.parse(data);

        switch (response.result) {
          case CheckResult.OK:
            this.platform.log.debug(`Device state change for ${displayName} completed successfully`);
            this.blockUpdate = 1;
            return true;
          case CheckResult.InProgress:
            await delay(1000);
            break;
          case CheckResult.Invalid:
            this.platform.log.debug(`Device state change for ${displayName} is unknown`);
            this.blockUpdate = 1;
            return false;
          default:
            this.platform.log.debug(`Unexpected result "${response.result}" for ${displayName}`);
            await delay(1000);
            break;
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        this.platform.log.info(`Poll error: ${message}`);
        await delay(1000);
      }
    }

    this.platform.log.error(`Timed out waiting for accessory '${displayName}' to update state`);
    this.blockUpdate = 1;
    return false;
  }

  // Send a device change request to the AiSEG2 gateway and handle sync/async response
  private async sendDeviceChange(devicePayload: { onOff: string; modulate: string }): Promise<boolean> {
    const deviceData = this.accessory.context.device;

    const url = `${this.platform.httpClient.baseUrl}/action/devices/device/32i1/change`;
    const payload = JSON.stringify({
      token: this.platform.Token,
      nodeId: deviceData.nodeId,
      eoj: deviceData.eoj,
      type: deviceData.type,
      device: {
        onoff: devicePayload.onOff,
        modulate: devicePayload.modulate,
      },
    });

    this.blockUpdate = 2;

    try {
      const { data } = await this.platform.httpClient.post(url, `data=${encodeURIComponent(payload)}`);

      this.platform.log.debug(`Response: '${data}'`);

      const response = JSON.parse(data);

      if (!Number.isInteger(response.acceptId)) {
        // No acceptId means the command was processed synchronously
        this.blockUpdate = 2;
        return true;
      }

      // Wait for async status check
      return await this.checkStatus(response.acceptId);
    } catch (err) {
      this.platform.log.error(`sendDeviceChange failed for ${deviceData.displayName}: ${(err as Error).message}`);
      throw err;
    }
  }

  // Handle set on requests from HomeKit
  async setOn(value: unknown): Promise<void> {
    const deviceData = this.accessory.context.device;
    const onValue = value === true;
    this.platform.log.debug(`setOn -> ${deviceData.displayName} to ${onValue ? 'ON' : 'OFF'}`);

    const currentState = this.service.getCharacteristic(this.platform.Characteristic.On).value || false;
    if (onValue === currentState) {
      return;
    }

    const onOff = onValue ? LightState.On : LightState.Off;

    try {
      const result = await this.sendDeviceChange({ onOff: onOff, modulate: '-' });
      if (result) {
        this.service.updateCharacteristic(this.platform.Characteristic.On, onValue);
        this.accessory.context.device.state = onValue ? 'on' : 'off';
        this.platform.log.info(`Homebridge -> ${deviceData.displayName} state set to ${onValue ? 'ON' : 'OFF'}`);
      } else {
        this.platform.log.error(`${deviceData.displayName} update submission failed`);
        throw new Error(`Device update failed for ${deviceData.displayName}`);
      }
    } catch (err) {
      this.platform.log.error(`setOn failed for ${deviceData.displayName}: ${(err as Error).message}`);
      throw err;
    }
  }

  // Handle get on requests from HomeKit
  async getOn(): Promise<CharacteristicValue> {
    const state = this.service.getCharacteristic(this.platform.Characteristic.On).value || false;

    this.platform.log.debug(`GetOn(${this.accessory.context.device.displayName}) <- ${state ? 'ON' : 'OFF'}`);

    return state;
  }

  // Handle set brightness requests from HomeKit
  async setBrightness(value: unknown): Promise<void> {
    const deviceData = this.accessory.context.device;
    const brightnessValue = typeof value === 'number' ? value : Number(value);

    this.platform.log.info(`setBrightness -> ${deviceData.displayName} to ${brightnessValue}`);

    try {
      const result = await this.sendDeviceChange({ onOff: '-', modulate: `0x${brightnessValue.toString(16)}` });
      if (result) {
        this.service.updateCharacteristic(this.platform.Characteristic.On, true);
        this.service.updateCharacteristic(this.platform.Characteristic.Brightness, brightnessValue);
        if (deviceData.colorTemperature === true) {
          const mired = brightnessToMired(brightnessValue);
          this.service.updateCharacteristic(this.platform.Characteristic.ColorTemperature, mired);
        }
        this.platform.log.info(`Homebridge -> ${deviceData.displayName} brightness set to ${brightnessValue}%`);
      } else {
        this.platform.log.error(`${deviceData.displayName} brightness update failed`);
        throw new Error(`Brightness update failed for ${deviceData.displayName}`);
      }
    } catch (err) {
      this.platform.log.error(`setBrightness failed for ${deviceData.displayName}: ${(err as Error).message}`);
      throw err;
    }
  }

  // Handle get color temperature requests from HomeKit
  async getColorTemperature(): Promise<CharacteristicValue> {
    const brightness = (this.service.getCharacteristic(this.platform.Characteristic.Brightness).value as number) || 0;
    return brightnessToMired(brightness);
  }

  // Handle set color temperature requests from HomeKit
  async setColorTemperature(value: unknown): Promise<void> {
    const deviceData = this.accessory.context.device;
    const miredValue = typeof value === 'number' ? value : Number(value);
    const brightnessValue = miredToBrightness(miredValue);
    const snappedMired = brightnessToMired(brightnessValue);

    this.platform.log.info(`setColorTemperature -> ${deviceData.displayName} to ${miredValue} mired -> snapped to ${brightnessValue}% (${snappedMired} mired)`);

    try {
      const result = await this.sendDeviceChange({ onOff: '-', modulate: `0x${brightnessValue.toString(16)}` });
      if (result) {
        this.service.updateCharacteristic(this.platform.Characteristic.On, true);
        this.service.updateCharacteristic(this.platform.Characteristic.Brightness, brightnessValue);
        this.service.updateCharacteristic(this.platform.Characteristic.ColorTemperature, snappedMired);
        this.platform.log.info(`Homebridge -> ${deviceData.displayName} color temperature set to ${snappedMired} mired`);
      } else {
        this.platform.log.error(`${deviceData.displayName} color temperature update failed`);
        throw new Error(`Color temperature update failed for ${deviceData.displayName}`);
      }
    } catch (err) {
      this.platform.log.error(`setColorTemperature failed for ${deviceData.displayName}: ${(err as Error).message}`);
      throw err;
    }
  }
}