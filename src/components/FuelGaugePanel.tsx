import React, { useState } from 'react';
import { Bell, Fuel, Gauge, Sparkles, AlertTriangle, ArrowRight, Check } from 'lucide-react';
import { formatNumber } from '../utils/formatters';

interface FuelGaugePanelProps {
  daysRemaining: number;
  estimatedKm: number;
  dateStr: string;
  remainingLiters: number;
  remainingPct: number;
  tankCapacity?: number;
  consumedLiters: number;
  currentKmDriven: number;
  currentOdometer?: number;
  onUpdateCurrentOdometer?: (newOdometer: number) => void;
}

export const FuelGaugePanel: React.FC<FuelGaugePanelProps> = ({
  daysRemaining,
  estimatedKm,
  dateStr,
  remainingLiters,
  remainingPct,
  tankCapacity = 15.1,
  consumedLiters,
  currentKmDriven,
  currentOdometer,
  onUpdateCurrentOdometer,
}) => {
  const [isQuickEditOpen, setIsQuickEditOpen] = useState(false);
  const [tempKm, setTempKm] = useState(currentOdometer ? currentOdometer.toString() : '');

  // Clamp percentage between 0 and 100
  const pct = Math.min(100, Math.max(0, Math.round(remainingPct)));
  
  // Angle for the Honda Fan PGM-FI dial:
  // At 100% (F): -50 deg
  // At 50% (Half): 0 deg
  // At 0% (E): +50 deg
  const needleAngle = -50 + (100 - pct) * 1.0;

  // Status and color
  const isReserve = remainingLiters <= 3.0 || pct <= 20;
  const isHalf = pct > 20 && pct <= 60;

  const barColor = isReserve
    ? 'from-rose-600 via-red-500 to-amber-500 shadow-rose-500/30'
    : isHalf
    ? 'from-amber-500 via-yellow-400 to-emerald-400 shadow-amber-500/20'
    : 'from-emerald-500 via-teal-400 to-cyan-400 shadow-emerald-500/20';

  const handleSaveQuickKm = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(tempKm);
    if (!isNaN(val) && val > 0 && onUpdateCurrentOdometer) {
      onUpdateCurrentOdometer(val);
      setIsQuickEditOpen(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        
        {/* CARD 1: 🔔 Previsão de Abastecimento (5 colunas no desktop) */}
        <div className="lg:col-span-5 bg-slate-950/85 border border-amber-500/30 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-amber-500/50 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-lg text-amber-400 shrink-0">
                  🔔
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1 font-mono">
                    <Bell className="w-3 h-3" />
                    <span>Previsão de Abastecimento</span>
                  </span>
                  <span className="text-[11px] text-slate-400">Honda Fan 2013</span>
                </div>
              </div>
              <span className="text-[11px] font-mono font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/80">
                ~33 km/dia útil
              </span>
            </div>

            <div>
              <div className="text-sm text-slate-300 font-medium">Próximo abastecimento previsto em:</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-baseline gap-2 mt-0.5">
                <span className="text-amber-400 font-mono text-3xl sm:text-4xl">~{daysRemaining}</span>
                <span className="text-slate-200 text-lg sm:text-xl">dias</span>
                <span className="text-xs font-normal text-slate-400 font-sans">
                  ({dateStr})
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/80 rounded-xl p-2.5 border border-slate-800/80">
              Autonomia estimada restante para <strong className="text-white font-mono">~{Math.round(estimatedKm)} km</strong>. Cobre tranquilamente seu trajeto diário de ida e volta ao trabalho.
            </p>
          </div>

          <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-800/80 text-[11px] text-slate-400 font-mono">
            <span>Custo/dia: <strong className="text-amber-300">~R$ 7,15</strong></span>
            <span>Média base: <strong className="text-emerald-400">33,2 km/L</strong></span>
          </div>
        </div>

        {/* CARD 2: ⛽ Nível do Tanque & Barrinha Visual com Mostrador PGM-FI (7 colunas no desktop) */}
        <div className="lg:col-span-7 bg-slate-950/85 border border-teal-500/30 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-teal-500/50 transition-all">
          <div className="absolute top-0 right-0 w-40 h-40 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-3">
            {/* Cabeçalho do Card */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/25 flex items-center justify-center text-lg text-teal-400 shrink-0">
                  ⛽
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300 flex items-center gap-1 font-mono">
                    <Fuel className="w-3 h-3" />
                    <span>Nível do Tanque</span>
                  </span>
                  <span className="text-[11px] text-slate-400">Capacidade: {tankCapacity.toString().replace('.', ',')} L</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isReserve ? (
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Reserva (~3L)</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-teal-950/80 text-teal-300 border border-teal-800/80">
                    {pct}% do Tanque
                  </span>
                )}
                {onUpdateCurrentOdometer && (
                  <button
                    onClick={() => {
                      setTempKm(currentOdometer ? currentOdometer.toString() : '');
                      setIsQuickEditOpen(!isQuickEditOpen);
                    }}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1"
                    title="Atualizar KM atual do odômetro"
                  >
                    <span>⚡</span>
                    <span className="hidden sm:inline">Atualizar KM</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quick edit form se aberto */}
            {isQuickEditOpen && (
              <form onSubmit={handleSaveQuickKm} className="bg-slate-900 border border-emerald-500/40 rounded-xl p-3 flex items-center gap-2 animate-fadeIn">
                <div className="flex-1">
                  <label className="text-[10px] text-slate-400 font-mono block">Qual é o KM Atual marcado no painel agora?</label>
                  <input
                    type="number"
                    value={tempKm}
                    onChange={(e) => setTempKm(e.target.value)}
                    placeholder="Ex: 83720"
                    autoFocus
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <button
                  type="submit"
                  className="mt-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Salvar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsQuickEditOpen(false)}
                  className="mt-3.5 text-slate-400 hover:text-white px-2 py-1.5 text-xs"
                >
                  Cancelar
                </button>
              </form>
            )}

            {/* Linha Principal: Mostrador PGM-FI + Dados em destaque */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
              {/* Mostrador Redondo PGM-FI réplica da foto do painel da Fan 2013 */}
              <div className="relative shrink-0 flex flex-col items-center">
                <svg viewBox="0 0 140 105" className="w-28 sm:w-32 h-auto select-none drop-shadow-md">
                  <defs>
                    <radialGradient id="fanDialGrad" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#0f172a" />
                      <stop offset="100%" stopColor="#020617" />
                    </radialGradient>
                  </defs>

                  {/* Fundo do Dial */}
                  <circle cx="70" cy="72" r="50" fill="url(#fanDialGrad)" stroke="#1e293b" strokeWidth="2" />
                  
                  {/* PGM-FI */}
                  <text x="70" y="32" fill="#94a3b8" fontSize="7" fontFamily="'JetBrains Mono', monospace" fontWeight="800" textAnchor="middle" letterSpacing="1.2">
                    PGM-FI
                  </text>
                  
                  {/* Arco da escala */}
                  <path d="M 36.3 46.7 A 44 44 0 0 1 103.7 46.7" fill="none" stroke="#334155" strokeWidth="4.5" strokeLinecap="round" />
                  
                  {/* Arco da Reserva em vermelho (próximo ao E) */}
                  <path d="M 91 37 A 44 44 0 0 1 103.7 46.7" fill="none" stroke="#ef4444" strokeWidth="5.5" strokeLinecap="round" />
                  
                  {/* Letras F e E */}
                  <text x="24" y="50" fill="#f8fafc" fontSize="11" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">
                    F
                  </text>
                  <text x="116" y="50" fill="#ef4444" fontSize="11" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">
                    E
                  </text>
                  
                  {/* Traços intermediários (ticks) */}
                  {/* 3/4 */}
                  <line x1="51.4" y1="36" x2="49.5" y2="31" stroke="#cbd5e1" strokeWidth="1.8" strokeLinecap="round" />
                  {/* 1/2 */}
                  <line x1="70" y1="32" x2="70" y2="26" stroke="#cbd5e1" strokeWidth="2.2" strokeLinecap="round" />
                  {/* 1/4 */}
                  <line x1="88.6" y1="36" x2="90.5" y2="31" stroke="#cbd5e1" strokeWidth="1.8" strokeLinecap="round" />

                  {/* Ícone de bomba de combustível */}
                  <g transform="translate(63.5, 43) scale(0.55)" fill="#64748b">
                    <path d="M3 2v14h10V2H3zm8 12H5V4h6v10zm4-6h1a2 2 0 0 1 2 2v4a1 1 0 0 1-2 0v-4h-1v-2z" />
                  </g>

                  {/* Ponteiro Laranja dinâmico da Fan 2013 */}
                  <g
                    transform={`rotate(${needleAngle}, 70, 72)`}
                    style={{ transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                  >
                    <polygon points="68.8,72 71.2,72 70.6,35 69.4,35" fill="#f97316" />
                    <line x1="70" y1="72" x2="70" y2="36" stroke="#fdba74" strokeWidth="1.2" />
                    <circle cx="70" cy="72" r="5.5" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
                    <circle cx="70" cy="72" r="2" fill="#ea580c" />
                  </g>
                </svg>
                <span className="text-[9px] font-mono text-slate-400 mt-[-6px]">Mostrador Fan 2013</span>
              </div>

              {/* Informações Numéricas e Barrinha */}
              <div className="flex-1 w-full space-y-2">
                <div className="flex items-baseline justify-between gap-2 flex-wrap">
                  <div className="text-sm font-semibold text-slate-300">Combustível restante:</div>
                  <div className="text-xl sm:text-2xl font-mono font-bold text-teal-300">
                    {formatNumber(remainingLiters, 2)} L <span className="text-sm font-normal text-slate-400">({pct}%)</span>
                  </div>
                </div>

                {/* A BARRINHA VISUAL DE TANQUE SOLICITADA */}
                <div className="space-y-1.5 pt-0.5">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-rose-400 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block"></span>
                      E (Reserva 3L)
                    </span>
                    <span className="text-slate-500">1/4</span>
                    <span className="text-slate-500">1/2</span>
                    <span className="text-slate-500">3/4</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      F (Cheio 15,1L)
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                    </span>
                  </div>

                  {/* Trilho da barra com marcadores visuais */}
                  <div className="relative w-full bg-slate-900 rounded-lg h-4 border border-slate-700/80 p-0.5 overflow-hidden shadow-inner">
                    {/* Divisores de referência */}
                    <div className="absolute inset-0 flex justify-between px-1 pointer-events-none opacity-25 z-10">
                      <div className="border-r border-slate-400 h-full w-[20%]"></div>
                      <div className="border-r border-slate-400 h-full w-[25%]"></div>
                      <div className="border-r border-slate-400 h-full w-[25%]"></div>
                      <div className="border-r border-slate-400 h-full w-[25%]"></div>
                    </div>

                    {/* Preenchimento Dinâmico da Barra */}
                    <div
                      className={`h-full rounded-md transition-all duration-700 bg-gradient-to-r ${barColor} shadow-md`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-0.5">
                    <span>
                      Consumido: <strong className="text-slate-200">{formatNumber(consumedLiters, 2)} L</strong> (+{currentKmDriven} km)
                    </span>
                    <span>
                      Resta: <strong className="text-teal-300">{formatNumber(remainingLiters, 2)} L</strong> de 15,1 L
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 mt-2 border-t border-slate-800/80 text-[11px] text-slate-400 font-mono">
            <span>Odômetro atual: <strong className="text-white">{currentOdometer ? formatNumber(currentOdometer, 0) : '83.712'} km</strong></span>
            <span className="text-slate-500">A barra e o ponteiro atualizam dinamicamente a cada KM</span>
          </div>
        </div>

      </div>
    </div>
  );
};
