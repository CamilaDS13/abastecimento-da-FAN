export type FuelType = 
  | 'gasolina_comum'
  | 'gasolina_aditivada'
  | 'etanol'
  | 'diesel'
  | 'gnv';

export interface FuelEntry {
  id: string;
  date: string; // YYYY-MM-DD
  odometer: number; // km inicial no momento do abastecimento
  startOdometer?: number; // km inicial do abastecimento
  currentOdometer?: number; // km atual no painel para acompanhar o quanto já rodou
  liters: number; // litros abastecidos
  pricePerLiter: number; // preço por litro em R$
  totalPrice: number; // valor total pago em R$
  fuelType: FuelType;
  isFullTank: boolean; // se completou o tanque
  isCurrentTank?: boolean; // se é o combustível atual no tanque (gasolina nova)
  missedPrevious?: boolean; // se esqueceu de anotar abastecimento anterior
  manualTripKm?: number; // km rodados especificamente com este combustível
  manualTripDays?: number; // dias rodados
  station?: string; // nome do posto / bandeira
  notes?: string; // observações
  createdAt: number;
}

export interface ComputedFuelEntry extends FuelEntry {
  startKm: number; // km inicial do abastecimento
  currentKm: number; // km atual / final
  distance: number; // km rodados (currentKm - startKm)
  kmPerLiter?: number; // média calculada (km/L)
  costPerKm?: number; // custo por km (R$/km)
  consumedLiters?: number; // litros consumidos calculados
  remainingLiters?: number; // litros ainda no tanque
  daysSinceLast?: number; // dias
  kmPerDay?: number; // km rodados por dia
  costPerDay?: number; // custo por dia (R$/dia)
  litersPerDay?: number; // litros por dia
  estimatedRangeKm?: number; // autonomia estimada
  estimatedDaysRemaining?: number; // dias restantes estimados
}

export interface VehicleStats {
  totalKm: number;
  totalLiters: number;
  totalSpent: number;
  overallKmPerLiter: number; // km total / litros totais
  averageCostPerKm: number;
  averagePricePerLiter: number;
  bestKmPerLiter: number | null;
  worstKmPerLiter: number | null;
  totalFillups: number;
  totalDaysTracked: number;
  averageKmPerDay: number;
  averageCostPerDay: number;
  averageDaysBetweenFillups: number;
  monthlyEstimatedCost: number;
  latestOdometer: number;
  currentFuelTypeDistribution: Record<FuelType, number>;
}
