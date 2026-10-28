import React from 'react';
import { Gauge, Coins, Route, Calendar, TrendingUp, Zap } from 'lucide-react';
import { VehicleStats } from '../types/fuel';
import { formatCurrency, formatNumber } from '../utils/formatters';

interface SummaryCardsProps {
  stats: VehicleStats;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Média de Consumo (Km/L) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Consumo Médio
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Gauge className="w-4 h-4" />
          </div>
        </div>

        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold font-mono tracking-tight text-white tabular-nums">
              {stats.overallKmPerLiter > 0 ? formatNumber(stats.overallKmPerLiter, 2) : '--'}
            </span>
            <span className="text-sm font-medium text-emerald-400">km/L</span>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>
              Melhor:{' '}
              <strong className="font-mono text-slate-200 tabular-nums">
                {stats.bestKmPerLiter ? `${formatNumber(stats.bestKmPerLiter, 1)}` : '--'}
              </strong>
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>
              Pior:{' '}
              <strong className="font-mono text-slate-200 tabular-nums">
                {stats.worstKmPerLiter ? `${formatNumber(stats.worstKmPerLiter, 1)}` : '--'}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Custo por Km */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Custo por Km
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Coins className="w-4 h-4" />
          </div>
        </div>

        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold font-mono tracking-tight text-white tabular-nums">
              {stats.averageCostPerKm > 0 ? formatCurrency(stats.averageCostPerKm) : 'R$ --'}
            </span>
            <span className="text-xs text-slate-400">/ km</span>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Preço Médio / L:</span>
            <strong className="font-mono text-slate-200 tabular-nums">
              {stats.averagePricePerLiter > 0 ? formatCurrency(stats.averagePricePerLiter) : '--'}
            </strong>
          </div>
        </div>
      </div>

      {/* 3. Total Rodado e Litros */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Distância & Combustível
          </span>
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <Route className="w-4 h-4" />
          </div>
        </div>

        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold font-mono tracking-tight text-white tabular-nums">
              {stats.totalKm > 0 ? formatNumber(stats.totalKm, 0) : '0'}
            </span>
            <span className="text-sm font-medium text-blue-400">km total</span>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>
              Litros:{' '}
              <strong className="font-mono text-slate-200 tabular-nums">
                {formatNumber(stats.totalLiters, 1)} L
              </strong>
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>
              Odômetro:{' '}
              <strong className="font-mono text-slate-200 tabular-nums">
                {stats.latestOdometer > 0 ? `${formatNumber(stats.latestOdometer, 0)} km` : '--'}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* 4. Ritmo Diário & Total Gasto */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Ritmo Diário & Gastos
          </span>
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
        </div>

        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold font-mono tracking-tight text-white tabular-nums">
              {stats.averageKmPerDay > 0 ? formatNumber(stats.averageKmPerDay, 1) : '--'}
            </span>
            <span className="text-xs text-teal-400">km / dia</span>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>
              Gasto total:{' '}
              <strong className="font-mono text-slate-200 tabular-nums">
                {formatCurrency(stats.totalSpent)}
              </strong>
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>
              Média/dia:{' '}
              <strong className="font-mono text-slate-200 tabular-nums">
                {stats.averageCostPerDay > 0 ? formatCurrency(stats.averageCostPerDay) : '--'}
              </strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
