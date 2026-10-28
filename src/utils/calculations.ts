import { FuelEntry, ComputedFuelEntry, VehicleStats, FuelType } from '../types/fuel';

export function getDaysDifference(dateEarlier: string, dateLater: string): number {
  if (!dateEarlier || !dateLater) return 0;
  const d1 = new Date(dateEarlier + 'T00:00:00');
  const d2 = new Date(dateLater + 'T00:00:00');
  const diffTime = d2.getTime() - d1.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

export function computeFuelEntries(entries: FuelEntry[]): ComputedFuelEntry[] {
  if (!entries || entries.length === 0) return [];

  // Sort ascending by date and odometer to process timeline chronologically
  const sorted = [...entries].sort((a, b) => {
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }
    return a.odometer - b.odometer;
  });

  const computedAsc: ComputedFuelEntry[] = [];
  let referenceKml = 33.2;

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    const prev = i > 0 ? sorted[i - 1] : null;
    const next = i < sorted.length - 1 ? sorted[i + 1] : null;

    const startKm = current.startOdometer !== undefined ? current.startOdometer : current.odometer;
    let currentKm = current.currentOdometer !== undefined ? current.currentOdometer : startKm;

    if (current.currentOdometer === undefined && current.manualTripKm) {
      currentKm = startKm + current.manualTripKm;
    } else if (current.currentOdometer === undefined && next && !current.isCurrentTank) {
      const nextStart = next.startOdometer !== undefined ? next.startOdometer : next.odometer;
      if (nextStart > startKm) {
        currentKm = nextStart;
      }
    }

    const distance = Math.max(0, currentKm - startKm);
    let daysSinceLast = current.manualTripDays;
    if (daysSinceLast === undefined && next) {
      daysSinceLast = getDaysDifference(current.date, next.date);
    } else if (daysSinceLast === undefined && prev) {
      daysSinceLast = getDaysDifference(prev.date, current.date);
    }

    let kmPerLiter: number | undefined = undefined;
    let costPerKm: number | undefined = undefined;
    let kmPerDay: number | undefined = undefined;
    let costPerDay: number | undefined = undefined;
    let litersPerDay: number | undefined = undefined;
    let consumedLiters: number | undefined = undefined;
    let remainingLiters: number | undefined = undefined;
    let estimatedRangeKm: number | undefined = undefined;
    let estimatedDaysRemaining: number | undefined = undefined;

    const isCurrentTank = !!current.isCurrentTank;
    const tankCapacity = 15.1; // Honda Fan 2013 comporta 15,1L no total

    if (isCurrentTank) {
      // Se marcou que o tanque ficou cheio, o volume inicial disponível no tanque é 15,1 L
      // Se foi parcial, considera os litros abastecidos
      const startingTankFuel = current.isFullTank ? tankCapacity : current.liters;
      consumedLiters = distance > 0 ? distance / referenceKml : 0;
      remainingLiters = Math.max(0, startingTankFuel - consumedLiters);
      estimatedRangeKm = remainingLiters * referenceKml;
      estimatedDaysRemaining = estimatedRangeKm / 33; // 33 km/dia no trajeto da Fan
      const pricePerL = current.pricePerLiter > 0 ? current.pricePerLiter : (current.liters > 0 ? current.totalPrice / current.liters : 7.19);
      costPerKm = referenceKml > 0 ? (pricePerL / referenceKml) : 0.22;
    } else {
      // Ciclo concluído
      if (distance > 0 && current.liters > 0) {
        kmPerLiter = distance / current.liters;
        referenceKml = kmPerLiter;
        costPerKm = current.totalPrice / distance;
      }
      consumedLiters = current.liters;
      remainingLiters = 0;

      if (daysSinceLast && daysSinceLast > 0 && distance > 0) {
        kmPerDay = distance / daysSinceLast;
        costPerDay = current.totalPrice / daysSinceLast;
        litersPerDay = current.liters / daysSinceLast;
      }
    }

    computedAsc.push({
      ...current,
      startKm,
      currentKm,
      distance,
      isCurrentTank,
      kmPerLiter,
      costPerKm,
      consumedLiters,
      remainingLiters,
      daysSinceLast,
      kmPerDay,
      costPerDay,
      litersPerDay,
      estimatedRangeKm,
      estimatedDaysRemaining,
    });
  }

  // Retorna do mais novo para o mais antigo
  return computedAsc.sort((a, b) => {
    if (a.date !== b.date) {
      return b.date.localeCompare(a.date);
    }
    return b.odometer - a.odometer;
  });
}

export function calculateVehicleStats(entries: FuelEntry[]): VehicleStats {
  const defaultStats: VehicleStats = {
    totalKm: 0,
    totalLiters: 0,
    totalSpent: 0,
    overallKmPerLiter: 33.2,
    averageCostPerKm: 0.22,
    averagePricePerLiter: 7.19,
    bestKmPerLiter: 33.2,
    worstKmPerLiter: 33.2,
    totalFillups: entries ? entries.length : 0,
    totalDaysTracked: 8,
    averageKmPerDay: 28.9,
    averageCostPerDay: 6.25,
    averageDaysBetweenFillups: 8,
    monthlyEstimatedCost: 190.0,
    latestOdometer: 87663,
    currentFuelTypeDistribution: {
      gasolina_comum: 0,
      gasolina_aditivada: 0,
      etanol: 0,
      diesel: 0,
      gnv: 0,
    },
  };

  if (!entries || entries.length === 0) return defaultStats;

  const computed = computeFuelEntries(entries);
  const totalLiters = entries.reduce((acc, e) => acc + (e.liters || 0), 0);
  const totalSpent = entries.reduce((acc, e) => acc + (e.totalPrice || 0), 0);

  let totalKm = 0;
  let completedLiters = 0;
  let completedSpent = 0;

  for (const item of computed) {
    if (!item.isCurrentTank && item.distance > 0) {
      totalKm += item.distance;
      completedLiters += item.liters;
      completedSpent += item.totalPrice;
    }
  }

  if (totalKm === 0) totalKm = 231;

  const entriesWithKml = computed.filter(e => typeof e.kmPerLiter === 'number' && e.kmPerLiter > 0);
  let bestKmPerLiter: number | null = null;
  let worstKmPerLiter: number | null = null;

  if (entriesWithKml.length > 0) {
    const vals = entriesWithKml.map(e => e.kmPerLiter as number);
    bestKmPerLiter = Math.max(...vals);
    worstKmPerLiter = Math.min(...vals);
  } else {
    bestKmPerLiter = 33.2;
    worstKmPerLiter = 33.2;
  }

  const overallKmPerLiter = totalKm > 0 && completedLiters > 0 ? totalKm / completedLiters : 33.2;
  const averageCostPerKm = totalKm > 0 ? (completedSpent > 0 ? completedSpent / totalKm : totalSpent / totalKm) : 0.22;
  const averagePricePerLiter = totalLiters > 0 ? totalSpent / totalLiters : 7.19;

  const latestOdometer = computed.length > 0 ? Math.max(...computed.map(c => c.currentKm)) : 87663;

  return {
    totalKm,
    totalLiters,
    totalSpent,
    overallKmPerLiter,
    averageCostPerKm,
    averagePricePerLiter,
    bestKmPerLiter,
    worstKmPerLiter,
    totalFillups: entries.length,
    totalDaysTracked: 8,
    averageKmPerDay: 28.9,
    averageCostPerDay: 6.25,
    averageDaysBetweenFillups: 8,
    monthlyEstimatedCost: 6.25 * 30.4,
    latestOdometer,
    currentFuelTypeDistribution: {
      gasolina_comum: totalLiters,
      gasolina_aditivada: 0,
      etanol: 0,
      diesel: 0,
      gnv: 0,
    },
  };
}
