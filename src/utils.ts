
export function delay(ms: number) {
  return new Promise( resolve => setTimeout(resolve, ms) );
}

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export interface ParsedDeviceId {
  model: string;
  serial: string;
  capability: number;
  asHex: string;
}

export function parseDeviceId(rawDeviceId: string): ParsedDeviceId {
  const [model = '', serial = '', capabilityHex = ''] = rawDeviceId.split('+');
  const hex = '0x' + Array.from(rawDeviceId).map(c => c.charCodeAt(0).toString(16)).join('').padEnd(62, '0');
  return {
    model,
    serial,
    capability: parseInt(capabilityHex, 16) || 0,
    asHex: hex,
  };
}

export function hexToString(hex: string): string {
  let str = '';
  for (let n = 0; n < hex.length; n += 2) {
    const charCode = parseInt(hex.substr(n, 2), 16);
    if (charCode) {
      str += String.fromCharCode(charCode);
    }
  }
  return str;
}