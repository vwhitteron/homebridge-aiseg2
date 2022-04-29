
export function delay(ms: number) {
  return new Promise( resolve => setTimeout(resolve, ms) );
}

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function deviceIdToHex(str: string): string {
  return '0x' + Array.from(str).map(c => {
    return c.charCodeAt(0).toString(16);
  }).join('').padEnd(62, '0');
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