import React, { useState } from 'react';
import { Calculator, Calendar, Fuel, Route, DollarSign, Clock, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { VehicleStats } from '../types/fuel';
import { formatCurrency, formatNumber } from '../utils/formatters';

interface TripSimulatorProps {
  stats: VehicleStats;
  latestPricePerLiter?: number;
}

export const TripSimulator: React.FC<TripSimulatorProps> = ({ stats, latestPricePerLiter }) => {
  const [tab, setTab] = useState<'valueToDays' | 'tripCalculator' | 'retrospective'>('valueToDays');

  // Mode 1: Coloquei R$ X -> quantos km e dias rende?
  const defaultPrice = latestPricePerLiter || (stats.averagePricePerLiter > 0 ? stats.averagePricePerLiter : 7.19);
  const defaultKml = stats.overallKmPerLiter > 0 ? stats.overallKmPerLiter : 38.6;
  const defaultDailyKm = stats.averageKmPerDay > 0 ? Math.round(stats.averageKmPerDay) : 29;

  const [fuelValue, setFuelValue] = useState<number>(50);
  const [fuelPrice, setFuelPrice] = useState<number>(Number(defaultPrice.toFixed(2)));
  const [fuelEfficiency, setFuelEfficiency] = useState<number>(Number(defaultKml.toFixed(1)));
  const [dailyKm, setDailyKm] = useState<number>(defaultDailyKm);

  // Calculations for Mode 1
  const litersGot = fuelPrice > 0 ? fuelValue / fuelPrice : 0;
  const totalRangeKm = litersGot * fuelEfficiency;
  const daysOfAutonomy = dailyKm > 0 ? totalRangeKm / dailyKm : 0;
  const costPerKmMode1 = totalRangeKm > 0 ? fuelValue / totalRangeKm : 0;
  const costPerDayMode1 = daysOfAutonomy > 0 ? fuelValue / daysOfAutonomy : 0;

  // Estimated depletion date
  const depletionDate = new Date();
  depletionDate.setDate(depletionDate.getDate() + Math.round(daysOfAutonomy));
  const depletionDateStr = depletionDate.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  // Mode 2: Planejador de Viagem (Vou rodar Y km em X dias)
  const [tripKm, setTripKm] = useState<number>(231);
  const [tripDays, setTripDays] = useState<number>(8);
  const [isRoundTrip, setIsRoundTrip] = useState<boolean>(false);
  const [tripPrice, setTripPrice] = useState<number>(Number(defaultPrice.toFixed(2)));
  const [tripKml, setTripKml] = useState<number>(Number(defaultKml.toFixed(1)));

  const actualTripDistance = isRoundTrip ? tripKm * 2 : tripKm;
  const tripLitersNeeded = tripKml > 0 ? actualTripDistance / tripKml : 0;
  const tripTotalCost = tripLitersNeeded * tripPrice;
  const tripCostPerDay = tripDays > 0 ? tripTotalCost / tripDays : tripTotalCost;
  const tripKmPerDay = tripDays > 0 ? actualTripDistance / tripDays : actualTripDistance;

  // Mode 3: Retrospectiva ("Rodei Y km por X dias com R$ Z")
  const [retroSpent, setRetroSpent] = useState<number>(42.99);
  const [retroKm, setRetroKm] = useState<number>(231);
  const [retroDays, setRetroDays] = useState<number>(8);
  const [retroPrice, setRetroPrice] = useState<number>(7.19);

  const retroLiters = retroPrice > 0 ? retroSpent / retroPrice : 0;
  const retroKml = retroLiters > 0 ? retroKm / retroLiters : 0;
  const retroCostPerKm = retroKm > 0 ? retroSpent / retroKm : 0;
  const retroKmPerDay = retroDays > 0 ? retroKm / retroDays : 0;
  const retroCostPerDay = retroDays > 0 ? retroSpent / retroDays : 0;

  return (
    <div className="space-y-6">
      {/* Sub-navigation tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setTab('valueToDays')}
          className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            tab === 'valueToDays'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Fuel className="w-4 h-4" />
          <span>"Coloquei R$ X" → Quantos Km e Dias?</span>
        </button>

        <button
          onClick={() => setTab('retrospective')}
          className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            tab === 'retrospective'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Cálculo Rápido: Rodei Y km em X dias</span>
        </button>

        <button
          onClick={() => setTab('tripCalculator')}
          className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            tab === 'tripCalculator'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Route className="w-4 h-4" />
          <span>Planejar Viagem & Gastos</span>
        </button>
      </div>

      {/* Tab 1: Value to Km & Days */}
      {tab === 'valueToDays' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Inputs Column */}
          <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Fuel className="w-4 h-4 text-emerald-400" />
                <span>Simulador de Autonomia</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Descubra exatamente quantos quilômetros e dias seu abastecimento vai durar.
              </p>
            </div>

            {/* Quick buttons */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Valor a Abastecer (R$)
              </label>
              <div className="flex gap-2 mb-2">
                {[30, 42.99, 50, 100].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setFuelValue(val)}
                    className={`flex-1 py-1 text-xs font-mono rounded border transition-colors cursor-pointer ${
                      fuelValue === val
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-semibold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    R$ {val}
                  </button>
                ))}
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-mono text-slate-500">R$</span>
                <input
                  type="number"
                  min="5"
                  step="5"
                  value={fuelValue}
                  onChange={e => setFuelValue(Number(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Preço do Litro */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-slate-300">
                  Preço do Combustível (R$/L)
                </label>
                {latestPricePerLiter && (
                  <button
                    type="button"
                    onClick={() => setFuelPrice(Number(latestPricePerLiter.toFixed(2)))}
                    className="text-[11px] text-emerald-400 hover:underline cursor-pointer"
                  >
                    Usar último ({formatCurrency(latestPricePerLiter)})
                  </button>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-mono text-slate-500">R$</span>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={fuelPrice}
                  onChange={e => setFuelPrice(Number(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Consumo do Veículo */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-slate-300">
                  Consumo Médio do Carro (km/L)
                </label>
                {stats.overallKmPerLiter > 0 && (
                  <button
                    type="button"
                    onClick={() => setFuelEfficiency(Number(stats.overallKmPerLiter.toFixed(1)))}
                    className="text-[11px] text-emerald-400 hover:underline cursor-pointer"
                  >
                    Usar minha média ({formatNumber(stats.overallKmPerLiter, 1)} km/L)
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="2"
                  value={fuelEfficiency}
                  onChange={e => setFuelEfficiency(Number(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-500">km/L</span>
              </div>
            </div>

            {/* Média de km por dia */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-slate-300">
                  Quanto você roda por dia? (km/dia)
                </label>
                {stats.averageKmPerDay > 0 && (
                  <button
                    type="button"
                    onClick={() => setDailyKm(Math.round(stats.averageKmPerDay))}
                    className="text-[11px] text-emerald-400 hover:underline cursor-pointer"
                  >
                    Usar histórico ({Math.round(stats.averageKmPerDay)} km/dia)
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={dailyKm}
                  onChange={e => setDailyKm(Number(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-500">km/dia</span>
              </div>
            </div>
          </div>

          {/* Results Output Column */}
          <div className="lg:col-span-7 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-semibold text-white">Previsão de Rendimento</span>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {formatCurrency(fuelValue)} = {formatNumber(litersGot, 2)} L
                </span>
              </div>

              {/* Big Highlight KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-5">
                <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-4">
                  <span className="text-xs font-medium text-slate-400">Autonomia Prevista</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-bold font-mono text-emerald-400 tabular-nums">
                      {formatNumber(totalRangeKm, 0)}
                    </span>
                    <span className="text-sm font-semibold text-slate-300">km</span>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    a {formatNumber(fuelEfficiency, 1)} km/L
                  </span>
                </div>

                <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-4">
                  <span className="text-xs font-medium text-slate-400">Duração Estimada</span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-3xl font-bold font-mono text-teal-300 tabular-nums">
                      {daysOfAutonomy >= 1 ? formatNumber(daysOfAutonomy, 1) : '< 1'}
                    </span>
                    <span className="text-sm font-semibold text-slate-300">dias</span>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    rodando {dailyKm} km/dia
                  </span>
                </div>
              </div>

              {/* Breakdown metrics */}
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-slate-800/70">
                  <span className="text-slate-400">Custo por Km rodado:</span>
                  <span className="font-mono text-white font-semibold tabular-nums">
                    {formatCurrency(costPerKmMode1)} / km
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-800/70">
                  <span className="text-slate-400">Custo médio diário:</span>
                  <span className="font-mono text-white font-semibold tabular-nums">
                    {formatCurrency(costPerDayMode1)} / dia
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-800/70">
                  <span className="text-slate-400">Data prevista para acabar o combustível:</span>
                  <span className="font-mono text-emerald-300 font-medium tabular-nums">
                    {depletionDateStr}
                  </span>
                </div>
              </div>
            </div>

            {/* Practical advice box */}
            <div className="mt-5 bg-emerald-950/30 border border-emerald-800/50 rounded-lg p-3 text-xs text-emerald-200/90 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong>Resumo Prático:</strong> Com <strong>{formatCurrency(fuelValue)}</strong> você compra <strong>{formatNumber(litersGot, 1)} litros</strong>, suficientes para rodar cerca de <strong>{formatNumber(totalRangeKm, 0)} km</strong>. No seu ritmo de {dailyKm} km/dia, esse combustível deve durar aproximadamente <strong>{Math.round(daysOfAutonomy)} dias</strong>.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Retrospectiva ("Rodei Y km por X dias com R$ Z") */}
      {tab === 'retrospective' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Cálculo Rápido de Trecho / Período</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                "Coloquei R$ {retroSpent}, rodei {retroKm} km durante {retroDays} dias" — descubra a média exata!
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Valor Total Gasto (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-mono text-slate-500">R$</span>
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={retroSpent}
                  onChange={e => setRetroSpent(Number(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Quilometragem Percorrida (km)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={retroKm}
                  onChange={e => setRetroKm(Number(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-500">km</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Quantos Dias Levou? (dias)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={retroDays}
                  onChange={e => setRetroDays(Number(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-500">dias</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Preço Médio do Litro Pago (R$/L)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-mono text-slate-500">R$</span>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={retroPrice}
                  onChange={e => setRetroPrice(Number(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
            <div>
              <div className="pb-4 border-b border-slate-800 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-white">Análise do Desempenho</h4>
                <span className="text-xs font-mono text-slate-400">
                  {formatNumber(retroLiters, 2)} Litros consumidos
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-5">
                <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-4">
                  <span className="text-xs font-medium text-slate-400">Média de Consumo</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-bold font-mono text-emerald-400 tabular-nums">
                      {formatNumber(retroKml, 2)}
                    </span>
                    <span className="text-sm font-semibold text-slate-300">km/L</span>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    {retroKml >= 13 ? 'Muito Econômico' : retroKml >= 10 ? 'Consumo Médio' : 'Consumo Alto'}
                  </span>
                </div>

                <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-4">
                  <span className="text-xs font-medium text-slate-400">Custo por Km</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-bold font-mono text-amber-400 tabular-nums">
                      {formatCurrency(retroCostPerKm)}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">/ km</span>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    para cada 100 km: {formatCurrency(retroCostPerKm * 100)}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-slate-800/70">
                  <span className="text-slate-400">Média de rodagem diária:</span>
                  <span className="font-mono text-white font-semibold tabular-nums">
                    {formatNumber(retroKmPerDay, 1)} km / dia
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-800/70">
                  <span className="text-slate-400">Gasto diário no período:</span>
                  <span className="font-mono text-white font-semibold tabular-nums">
                    {formatCurrency(retroCostPerDay)} / dia
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-800/70">
                  <span className="text-slate-400">Projeção para 30 dias nesse ritmo:</span>
                  <span className="font-mono text-teal-300 font-semibold tabular-nums">
                    {formatCurrency(retroCostPerDay * 30.4)} / mês
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-xs text-slate-300">
              💡 <strong>Dica:</strong> Se você quiser salvar esse período no seu histórico oficial, basta clicar em <strong>"Abastecer"</strong> no topo da página e informar a data e o odômetro correspondente!
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Trip Planner */}
      {tab === 'tripCalculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Route className="w-4 h-4 text-emerald-400" />
                <span>Calculadora de Viagem</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Calcule o orçamento exato de combustível para sua próxima viagem.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Distância (um sentido) em km
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="5"
                  min="10"
                  value={tripKm}
                  onChange={e => setTripKm(Number(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-500">km</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="roundTrip"
                checked={isRoundTrip}
                onChange={e => setIsRoundTrip(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500 h-4 w-4 cursor-pointer"
              />
              <label htmlFor="roundTrip" className="text-xs text-slate-300 cursor-pointer">
                Incluir Ida e Volta (total: {tripKm * 2} km)
              </label>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Duração da Viagem (dias)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  value={tripDays}
                  onChange={e => setTripDays(Number(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-500">dias</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Consumo Estimado na Estrada (km/L)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="3"
                  value={tripKml}
                  onChange={e => setTripKml(Number(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-500">km/L</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Preço Estimado do Combustível (R$/L)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-mono text-slate-500">R$</span>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={tripPrice}
                  onChange={e => setTripPrice(Number(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
            <div>
              <div className="pb-4 border-b border-slate-800 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-white">Orçamento da Viagem</h4>
                <span className="text-xs font-mono text-emerald-400">
                  {actualTripDistance} km totais
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-5">
                <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-4">
                  <span className="text-xs font-medium text-slate-400">Gasto Total com Combustível</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-bold font-mono text-emerald-400 tabular-nums">
                      {formatCurrency(tripTotalCost)}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Necessários: {formatNumber(tripLitersNeeded, 1)} Litros
                  </span>
                </div>

                <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-4">
                  <span className="text-xs font-medium text-slate-400">Gasto Diário Médio</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-bold font-mono text-teal-300 tabular-nums">
                      {formatCurrency(tripCostPerDay)}
                    </span>
                    <span className="text-xs text-slate-400">/ dia</span>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    rodando {formatNumber(tripKmPerDay, 0)} km/dia
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-slate-800/70">
                  <span className="text-slate-400">Custo estimado por quilômetro:</span>
                  <span className="font-mono text-white font-semibold tabular-nums">
                    {formatCurrency(actualTripDistance > 0 ? tripTotalCost / actualTripDistance : 0)} / km
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-800/70">
                  <span className="text-slate-400">Tanques estimados (tanque médio 45L):</span>
                  <span className="font-mono text-white font-semibold tabular-nums">
                    {formatNumber(tripLitersNeeded / 45, 1)} tanque(s)
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-xs text-slate-300">
              💡 <strong>Dica de Estrada:</strong> Manter velocidade constante entre 90 km/h e 100 km/h e pneus calibrados pode economizar até 15% de combustível no trajeto!
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
