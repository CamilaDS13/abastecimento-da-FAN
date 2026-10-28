import React, { useState } from 'react';
import { ArrowLeftRight, CheckCircle2, AlertCircle, Info, Fuel } from 'lucide-react';
import { formatCurrency, formatNumber } from '../utils/formatters';

interface EthanolVsGasCalculatorProps {
  latestGasPrice?: number;
}

export const EthanolVsGasCalculator: React.FC<EthanolVsGasCalculatorProps> = ({ latestGasPrice }) => {
  const [gasPrice, setGasPrice] = useState<number>(latestGasPrice || 5.89);
  const [ethanolPrice, setEthanolPrice] = useState<number>(3.99);
  const [tankSize, setTankSize] = useState<number>(50);

  // Advanced mode: custom consumption ratio
  const [useCustomEfficiency, setUseCustomEfficiency] = useState<boolean>(false);
  const [gasKml, setGasKml] = useState<number>(12.0);
  const [ethanolKml, setEthanolKml] = useState<number>(8.4);

  // Parity calculation
  const parity = gasPrice > 0 ? (ethanolPrice / gasPrice) * 100 : 0;
  
  // Custom threshold if enabled, else 70% standard rule
  const parityThreshold = useCustomEfficiency && gasKml > 0 
    ? (ethanolKml / gasKml) * 100 
    : 70;

  const isEthanolBetter = parity < parityThreshold;
  const parityDifference = Math.abs(parity - parityThreshold);

  // Maximum price ethanol could be to still be worth it
  const maxEthanolPrice = (gasPrice * parityThreshold) / 100;

  // Cost to fill tank
  const gasTankCost = gasPrice * tankSize;
  const ethanolTankCost = ethanolPrice * tankSize;

  // Cost per 1,000 km
  const currentGasKml = useCustomEfficiency ? gasKml : 12.0;
  const currentEthanolKml = useCustomEfficiency ? ethanolKml : currentGasKml * 0.7;
  
  const costPer1000kmGas = currentGasKml > 0 ? (1000 / currentGasKml) * gasPrice : 0;
  const costPer1000kmEthanol = currentEthanolKml > 0 ? (1000 / currentEthanolKml) * ethanolPrice : 0;
  const savingsPer1000km = Math.abs(costPer1000kmGas - costPer1000kmEthanol);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Inputs Column */}
      <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="border-b border-slate-800 pb-3">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4 text-emerald-400" />
            <span>Comparador Etanol x Gasolina</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Descubra qual combustível é mais vantajoso financeiramente para o seu bolso.
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Preço da Gasolina (R$/L)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-xs font-mono text-slate-500">R$</span>
            <input
              type="number"
              step="0.01"
              min="1"
              value={gasPrice}
              onChange={e => setGasPrice(Number(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Preço do Etanol / Álcool (R$/L)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-xs font-mono text-slate-500">R$</span>
            <input
              type="number"
              step="0.01"
              min="1"
              value={ethanolPrice}
              onChange={e => setEthanolPrice(Number(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Capacidade do Tanque (Litros)
          </label>
          <div className="relative">
            <input
              type="number"
              step="1"
              min="20"
              max="120"
              value={tankSize}
              onChange={e => setTankSize(Number(e.target.value) || 50)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
            />
            <span className="absolute right-3 top-2.5 text-xs text-slate-500">Litros</span>
          </div>
        </div>

        {/* Custom Vehicle Efficiency toggle */}
        <div className="pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={() => setUseCustomEfficiency(!useCustomEfficiency)}
            className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 cursor-pointer font-medium"
          >
            <span>{useCustomEfficiency ? '− Usar regra padrão dos 70%' : '+ Calibrar com o consumo real do meu carro'}</span>
          </button>

          {useCustomEfficiency && (
            <div className="mt-3 p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-3">
              <span className="text-[11px] text-slate-400 block">
                Carros modernos podem ter rendimento do etanol de 72% a 75% da gasolina.
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">Km/L Gasolina</label>
                  <input
                    type="number"
                    step="0.1"
                    value={gasKml}
                    onChange={e => setGasKml(Number(e.target.value) || 1)}
                    className="w-full bg-slate-900 border border-slate-750 rounded p-1.5 text-xs font-mono text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">Km/L Etanol</label>
                  <input
                    type="number"
                    step="0.1"
                    value={ethanolKml}
                    onChange={e => setEthanolKml(Number(e.target.value) || 1)}
                    className="w-full bg-slate-900 border border-slate-750 rounded p-1.5 text-xs font-mono text-white"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Column */}
      <div className="lg:col-span-7 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
        <div>
          {/* Verdict Banner */}
          <div
            className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
              isEthanolBetter
                ? 'bg-blue-950/40 border-blue-800/80 text-blue-200'
                : 'bg-amber-950/40 border-amber-800/80 text-amber-200'
            }`}
          >
            <div>
              <span className="text-xs font-bold uppercase tracking-wider block opacity-75">
                Recomendação Econômica
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-0.5">
                {isEthanolBetter ? 'Abasteça com ETANOL (Álcool)' : 'Abasteça com GASOLINA'}
              </h2>
              <p className="text-xs mt-1 opacity-90">
                O etanol está a <strong>{formatNumber(parity, 1)}%</strong> do preço da gasolina (ponto de corte: {formatNumber(parityThreshold, 1)}%).
              </p>
            </div>

            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-white shadow-md ${
              isEthanolBetter ? 'bg-blue-600' : 'bg-amber-600'
            }`}>
              <Fuel className="w-6 h-6" />
            </div>
          </div>

          {/* Parity visual bar */}
          <div className="my-5">
            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
              <span>Relação atual: <strong className="font-mono text-white">{formatNumber(parity, 1)}%</strong></span>
              <span>Limite de vantagem: <strong className="font-mono text-emerald-400">{formatNumber(parityThreshold, 1)}%</strong></span>
            </div>
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 relative">
              {/* Threshold indicator line */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white z-10"
                style={{ left: `${Math.min(parityThreshold, 100)}%` }}
              />
              {/* Fill */}
              <div
                className={`h-full transition-all duration-300 ${
                  isEthanolBetter ? 'bg-blue-500' : 'bg-amber-500'
                }`}
                style={{ width: `${Math.min(Math.max(parity, 5), 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span>0% (Etanol de graça)</span>
              <span>70% (Equilíbrio)</span>
              <span>100% (Preço igual)</span>
            </div>
          </div>

          {/* Financial Breakdown Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-xs">
            <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3">
              <span className="text-slate-400 block mb-1">Economia estimada a cada 1.000 km</span>
              <span className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
                {formatCurrency(savingsPer1000km)}
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                escolhendo {isEthanolBetter ? 'Etanol' : 'Gasolina'}
              </span>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3">
              <span className="text-slate-400 block mb-1">Preço máximo do Etanol p/ valer a pena</span>
              <span className="text-xl font-bold font-mono text-white tabular-nums">
                {formatCurrency(maxEthanolPrice)}
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                acima disso, use Gasolina
              </span>
            </div>
          </div>

          {/* Side by side tank comparison */}
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Tanque Cheio ({tankSize}L) com Gasolina:</span>
              <span className="font-mono text-white tabular-nums">{formatCurrency(gasTankCost)}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Tanque Cheio ({tankSize}L) com Etanol:</span>
              <span className="font-mono text-white tabular-nums">{formatCurrency(ethanolTankCost)}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-xs text-slate-400 flex items-start gap-2">
          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <span>
            <strong>Entenda a conta:</strong> 1 litro de etanol tem em média 70% da energia de 1 litro de gasolina. Se o preço do etanol for menor que 70% do preço da gasolina, ele é financeiramente vantajoso mesmo rodando menos km por litro.
          </span>
        </div>
      </div>
    </div>
  );
};
