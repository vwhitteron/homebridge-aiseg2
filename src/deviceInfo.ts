export const types: { [id: string]: string } = {
  '0x25': 'residential solar power generator',
  '0x29': 'circuit breaker board',
  '0x33': 'air conditioner',
  '0x39': 'electric water heater',
  '0x91': 'smoke detector',
  '0x92': 'switch',
};

export type switchCharacteristics = {
  dimmable: boolean;
};

const CAPABILITY_DIMMABLE = 0x40;

/**
 * Derive switch characteristics from the capability byte in the raw device ID.
 * Device ID format: "<model>+<serial>+<capabilityHex>", e.g. "WTY22173+0023D1+40".
 * Known capabilities:
 *   0x0C — single gang on/off
 *   0x1C — double gang on/off, switch 1
 *   0x1D — double gang on/off, switch 2
 *   0x40 — single gang dimmable
 */
import { parseDeviceId } from './utils';

export function getSwitchCharacteristics(rawDeviceId: string): switchCharacteristics {
  const { capability } = parseDeviceId(rawDeviceId);
  return {
    dimmable: capability === CAPABILITY_DIMMABLE,
  };
}