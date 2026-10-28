import { FuelEntry } from '../types/fuel';

export const USER_REAL_ENTRIES: FuelEntry[] = [
  {
    id: 'user-entry-1',
    date: '2026-10-18',
    odometer: 83432,
    startOdometer: 83432,
    currentOdometer: 83663,
    liters: 7.15,
    pricePerLiter: 6.99,
    totalPrice: 50.00,
    fuelType: 'gasolina_comum',
    isFullTank: true,
    isCurrentTank: false,
    manualTripKm: 231, // 83.663 - 83.432 = 231 km
    manualTripDays: 8,
    station: 'Posto Serra',
    notes: 'Ciclo Concluído: 66km serra + 165km trabalho (33km/dia)',
    createdAt: 1729254400000,
  },
  {
    id: 'user-entry-2',
    date: '2026-10-26',
    odometer: 83663,
    startOdometer: 83663,
    currentOdometer: 83712,
    liters: 5.98,
    pricePerLiter: 7.19,
    totalPrice: 42.99,
    fuelType: 'gasolina_comum',
    isFullTank: true,
    isCurrentTank: true, // Gasolina Nova
    manualTripKm: 49, // 83.712 - 83.663 = 49 km
    station: 'Posto Fan',
    notes: 'Gasolina nova com tanque cheio na Fan 2013.',
    createdAt: 1729945600000,
  },
];

export const SAMPLE_FUEL_ENTRIES: FuelEntry[] = USER_REAL_ENTRIES;
