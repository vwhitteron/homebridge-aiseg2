/* eslint-disable @typescript-eslint/no-unused-vars */

export const types: { [id: string]: string} = {
  '0x25': 'residential solar power generator',
  '0x29': 'circuit breaker board',
  '0x33': 'air conditioner',
  '0x39': 'electric water heater',
  '0x91': 'smoke detector',
  '0x92': 'switch',
};

export type switchCharacteristics = {
    dimmable: boolean;
    gangs: number;
};

export const switchModels: { [id: string]: switchCharacteristics } = {
  'WTY2201': {
    dimmable: false,
    gangs: 1,
  },
  'WTY2202': {
    dimmable: false,
    gangs: 2,
  },
  'WTY2401': {
    dimmable: false,
    gangs: 1,
  },
  'WTY2402': {
    dimmable: false,
    gangs: 2,
  },
  'WTY2421': {
    dimmable: false,
    gangs: 1,
  },
  'WTY2422': {
    dimmable: false,
    gangs: 2,
  },
  'WTY2530': {
    dimmable: false,
    gangs: 6,
  },
  'WTY2641': {
    dimmable: false,
    gangs: 1,
  },
  'WTY22173': {
    dimmable: true,
    gangs: 1,
  },
  'WTY24173': {
    dimmable: true,
    gangs: 1,
  },
};