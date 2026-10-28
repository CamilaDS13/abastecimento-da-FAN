import React, { useState } from 'react';
import { Droplet, Wrench, AlertTriangle, CheckCircle2, Clock, Calendar } from 'lucide-react';
import { formatNumber } from '../utils/formatters';

interface OilChangeCardProps {
  currentOdometer?: number;
}

export const OilChangeCard: React.FC<OilChangeCardProps> = ({
  currentOdometer = 83712,
}) => {
  const [metaKm, setMetaKm] = useState<number>(() => {
    const saved = localStorage.getItem('autokm_meta_oleo');
    return saved ? parseFloat(saved) : 84400;
  });

  const [lastChangeKm, setLastChangeKm] = useState<number>(() => {
    const saved = localStorage.getItem('autokm_ultima_troca_oleo');
    return saved ? parseFloat(saved) : 83400;
  });

  const [isEditing, setIsEditing] = useState(false);
  const [inputMeta, setInputMeta] = useState(metaKm.toString());

  const kmRestante = Math.max(0, metaKm - currentOdometer);
  const diasUteisRestantes = Math.round(kmRestante / 33); // 33 km/dia útil de trabalho

  const dataPrevista = new Date();
  dataPrevista.setDate(dataPrevista.getDate() + diasUteisRestantes);
  const dataFormatada = dataPrevista.toLocaleDateString('pt-BR');

  // Percentual de vida útil do óleo rodado
  const totalCiclo = Math.max(100, metaKm - lastChangeKm);
  const jaRodado = Math.max(0, currentOdometer - lastChangeKm);
  const percentualRodado = Math.min(100, Math.max(0, Math.round((jaRodado / totalCiclo) * 100)));

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(inputMeta);
    if (!isNaN(val) && val > 0) {
      setMetaKm(val);
      localStorage.setItem('autokm_meta_oleo', val.toString());
      setIsEditing(false);
    }
  };

  const isUrgente = kmRestante <= 100;
  const isVencido = kmRestante <= 0;

  return (
    <div className="bg-gradient-to-br from-slate-900/90 via-slate-900 to-amber-950/20 border border-amber-500/30 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-2xl text-amber-400 shrink-0">
            🛢️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white">Controle de Troca de Óleo</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                Fan 2013 (10W-30)
              </span>
            </div>
            <p className="text-xs text-slate-400">Acompanhamento preventivo do motor com alerta de quilometragem.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <form onSubmit={handleSalvar} className="flex items-center gap-2">
              <input
                type="number"
                value={inputMeta}
                onChange={e => setInputMeta(e.target.value)}
                className="w-28 bg-slate-950 border border-amber-500/50 rounded-lg px-2.5 py-1 text-xs font-mono text-white focus:outline-none"
              />
              <button
                type="submit"
                className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg cursor-pointer transition-colors"
              >
                Salvar
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-2 py-1 bg-slate-800 text-slate-400 text-xs rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
            </form>
          ) : (
            <button
              onClick={() => {
                setInputMeta(metaKm.toString());
                setIsEditing(true);
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Wrench className="w-3.5 h-3.5 text-amber-400" />
              <span>Ajustar KM da Troca</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        {/* Próxima Troca Prevista */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-xs text-slate-400 font-medium">Próxima Troca Prevista:</span>
          <div className="mt-1">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-400">
              {formatNumber(metaKm, 0)} km
            </div>
            <div className="text-xs text-slate-400 mt-0.5">Odômetro do painel da moto</div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 text-xs text-slate-300 flex justify-between font-mono">
            <span>KM Atual:</span>
            <strong className="text-white">{formatNumber(currentOdometer, 0)} km</strong>
          </div>
        </div>

        {/* Faltam X KM / Dias */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-xs text-slate-400 font-medium">Faltam para Trocar:</span>
          <div className="mt-1">
            {isVencido ? (
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-rose-500 animate-pulse flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-rose-500" />
                <span>TROCAR AGORA!</span>
              </div>
            ) : (
              <div className={`text-2xl sm:text-3xl font-extrabold font-mono ${isUrgente ? 'text-amber-400' : 'text-emerald-400'}`}>
                {formatNumber(kmRestante, 0)} km
              </div>
            )}
            <div className="text-xs text-teal-300 mt-0.5 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{isVencido ? 'Quilometragem atingida!' : `~${diasUteisRestantes} dias úteis de trabalho (33 km/dia)`}</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 text-xs text-slate-400 flex justify-between font-mono">
            <span>Data prevista:</span>
            <strong className="text-amber-300">{dataFormatada}</strong>
          </div>
        </div>

        {/* Especificações da Fan 2013 */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-xs text-slate-400 font-medium">Especificação Recomendada:</span>
          <div className="space-y-1 mt-1 text-xs text-slate-300">
            <div>Óleo: <strong className="text-white font-mono">SAE 10W-30 JASO MA</strong></div>
            <div>Capacidade: <strong className="text-amber-300 font-mono">1.000 ml</strong> (troca com filtro/dreno)</div>
            <div>Intervalo seguro: <strong className="text-emerald-400 font-mono">a cada 1.000 km</strong></div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
            Dica: Checar o nível na vareta toda semana.
          </div>
        </div>
      </div>

      {/* Barra de Progresso Visual */}
      <div className="mt-5 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">Última troca (~{formatNumber(lastChangeKm, 0)} km)</span>
          <span className={`font-bold ${isVencido ? 'text-rose-400' : 'text-amber-400'}`}>
            {percentualRodado}% rodados ({formatNumber(kmRestante, 0)} km restantes)
          </span>
          <span className="text-white font-bold">Meta: {formatNumber(metaKm, 0)} km</span>
        </div>
        <div className="relative w-full bg-slate-950 rounded-full h-3 border border-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 shadow-md ${
              isVencido
                ? 'bg-rose-500'
                : 'bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500'
            }`}
            style={{ width: `${percentualRodado}%` }}
          />
        </div>
      </div>
    </div>
  );
};
