import React, { useState } from 'react';
import {
  Search,
  Filter,
  Edit2,
  Trash2,
  Download,
  Upload,
  RotateCcw,
  Plus,
  Gauge,
  Calendar,
  Fuel,
  Coins,
  FileSpreadsheet,
} from 'lucide-react';
import { ComputedFuelEntry, FuelType } from '../types/fuel';
import {
  formatDate,
  formatNumber,
  formatCurrency,
  FUEL_TYPE_LABELS,
  FUEL_TYPE_COLORS,
} from '../utils/formatters';

interface FuelTableProps {
  entries: ComputedFuelEntry[];
  onEdit: (entry: ComputedFuelEntry) => void;
  onDelete: (id: string) => void;
  onOpenNewModal: () => void;
  onLoadSamples: () => void;
  onClearAll: () => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
  onImportJSON: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FuelTable: React.FC<FuelTableProps> = ({
  entries,
  onEdit,
  onDelete,
  onOpenNewModal,
  onLoadSamples,
  onClearAll,
  onExportCSV,
  onExportJSON,
  onImportJSON,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFuelType, setSelectedFuelType] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<'all' | '30d' | '90d' | 'year'>('all');

  // Filter logic
  const filteredEntries = entries.filter(entry => {
    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchStation = entry.station?.toLowerCase().includes(term);
      const matchNotes = entry.notes?.toLowerCase().includes(term);
      const matchOdo = entry.odometer.toString().includes(term);
      if (!matchStation && !matchNotes && !matchOdo) return false;
    }

    // Fuel Type
    if (selectedFuelType !== 'all' && entry.fuelType !== selectedFuelType) {
      return false;
    }

    // Period
    if (periodFilter !== 'all') {
      const entryDate = new Date(entry.date + 'T00:00:00').getTime();
      const now = new Date().getTime();
      const diffDays = (now - entryDate) / (1000 * 60 * 60 * 24);

      if (periodFilter === '30d' && diffDays > 30) return false;
      if (periodFilter === '90d' && diffDays > 90) return false;
      if (periodFilter === 'year' && diffDays > 365) return false;
    }

    return true;
  });

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
      {/* Top Controls Toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-white">Histórico de Abastecimentos</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Consulte todas as médias, custos e quilometragens registradas
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <a
              href="/autokm.html"
              download="autokm.html"
              title="Baixar arquivo HTML único para abrir direto no navegador no computador ou celular"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:text-white bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/70 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Baixar Código HTML (.html)</span>
            </a>

            <button
              onClick={onExportCSV}
              title="Baixar planilha compatível com Excel (.csv)"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Planilha CSV</span>
            </button>

            <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-blue-400" />
              <span>Backup</span>
              <input
                type="file"
                accept=".json"
                onChange={onImportJSON}
                className="hidden"
              />
            </label>

            <button
              onClick={onOpenNewModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-500 hover:bg-emerald-400 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Novo Registro</span>
            </button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 pt-1">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por posto, observação ou km..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Period selector */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-950 border border-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setPeriodFilter('all')}
              className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap cursor-pointer ${
                periodFilter === 'all' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setPeriodFilter('30d')}
              className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap cursor-pointer ${
                periodFilter === '30d' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              30 dias
            </button>
            <button
              onClick={() => setPeriodFilter('90d')}
              className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap cursor-pointer ${
                periodFilter === '90d' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              90 dias
            </button>
            <button
              onClick={() => setPeriodFilter('year')}
              className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap cursor-pointer ${
                periodFilter === 'year' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Este ano
            </button>
          </div>

          {/* Fuel type selector */}
          <select
            value={selectedFuelType}
            onChange={e => setSelectedFuelType(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Todos os Combustíveis</option>
            {(Object.keys(FUEL_TYPE_LABELS) as FuelType[]).map(type => (
              <option key={type} value={type}>
                {FUEL_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Empty State */}
      {filteredEntries.length === 0 ? (
        <div className="p-12 text-center space-y-3">
          <Fuel className="w-10 h-10 text-slate-600 mx-auto" />
          <h4 className="text-sm font-semibold text-slate-300">Nenhum abastecimento encontrado</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {entries.length === 0
              ? 'Você ainda não registrou nenhum abastecimento. Comece adicionando o primeiro ou experimente carregar dados de teste.'
              : 'Nenhum resultado corresponde aos filtros aplicados.'}
          </p>
          {entries.length === 0 && (
            <div className="pt-2 flex justify-center gap-2">
              <button
                onClick={onOpenNewModal}
                className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-500 hover:bg-emerald-400 rounded-lg cursor-pointer transition-colors"
              >
                Cadastrar Primeiro
              </button>
              <button
                onClick={onLoadSamples}
                className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer transition-colors"
              >
                Carregar Exemplo
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[10px] font-semibold">
                  <th className="py-3 px-4">Data</th>
                  <th className="py-3 px-3">KM Inicial</th>
                  <th className="py-3 px-3">KM Atual</th>
                  <th className="py-3 px-3">KM Rodados</th>
                  <th className="py-3 px-3">Gasolina Consumida</th>
                  <th className="py-3 px-3">Litros / Total</th>
                  <th className="py-3 px-3 text-center">Consumo (km/L)</th>
                  <th className="py-3 px-3">Custo / Km</th>
                  <th className="py-3 px-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredEntries.map(entry => {
                  const fuelColor = FUEL_TYPE_COLORS[entry.fuelType] || FUEL_TYPE_COLORS.gasolina_comum;

                  return (
                    <tr
                      key={entry.id}
                      className="hover:bg-slate-850/40 transition-colors group"
                    >
                      {/* Date */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-medium text-white font-mono">{formatDate(entry.date)}</span>
                          {entry.isCurrentTank ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                              Gasolina Nova
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                              Ciclo Concluído
                            </span>
                          )}
                          {entry.isFullTank ? (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" title="Tanque ficou cheio (15,1 L)">
                              ⛽ Tanque Cheio (15,1L)
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-800 text-slate-400 border border-slate-700" title="Abastecimento parcial">
                              💧 Parcial
                            </span>
                          )}
                        </div>
                        {entry.station && (
                          <div className="text-[11px] text-slate-400 truncate max-w-[140px]" title={entry.station}>
                            {entry.station}
                          </div>
                        )}
                      </td>

                      {/* KM Inicial */}
                      <td className="py-3 px-3 whitespace-nowrap font-mono tabular-nums text-slate-300">
                        <div className="font-semibold text-white">
                          {formatNumber(entry.startKm, 0)} km
                        </div>
                        <div className="text-[10px] text-slate-500">ao abastecer</div>
                      </td>

                      {/* KM Atual */}
                      <td className="py-3 px-3 whitespace-nowrap font-mono tabular-nums">
                        <div className="font-semibold text-emerald-400">
                          {formatNumber(entry.currentKm, 0)} km
                        </div>
                        <div className="text-[10px] text-slate-500">painel da moto</div>
                      </td>

                      {/* KM Rodados */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {entry.distance > 0 ? (
                          <div>
                            <span className="font-mono font-bold text-emerald-400 tabular-nums text-sm">
                              +{formatNumber(entry.distance, 0)} km
                            </span>
                            {entry.daysSinceLast && (
                              <div className="text-[10px] text-slate-400 font-mono">
                                em {entry.daysSinceLast} dias
                              </div>
                            )}
                          </div>
                        ) : entry.isCurrentTank ? (
                          <span className="text-[11px] text-teal-300 font-mono font-medium">
                            0 km <span className="text-slate-500">(em uso)</span>
                          </span>
                        ) : (
                          <span className="text-slate-500 font-mono text-[11px]">0 km</span>
                        )}
                      </td>

                      {/* Gasolina Consumida */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {entry.isCurrentTank ? (
                          <div>
                            <span className="font-mono font-semibold text-teal-300 tabular-nums">
                              {formatNumber(entry.consumedLiters || 0, 2)} L
                            </span>
                            <div className={`text-[10px] font-mono ${entry.isFullTank ? 'text-emerald-300 font-semibold' : 'text-slate-400'}`}>
                              Resta: {formatNumber(entry.remainingLiters ?? entry.liters, 2)} L {entry.isFullTank ? '(de 15,1 L)' : `(de ${formatNumber(entry.liters, 2)} L)`}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <span className="font-mono font-semibold text-slate-200 tabular-nums">
                              {formatNumber(entry.liters, 2)} L
                            </span>
                            <div className="text-[10px] text-slate-500 font-mono">
                              tanque utilizado
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Litros / Total Pago */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-mono font-bold text-white tabular-nums">
                          {formatCurrency(entry.totalPrice)}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono tabular-nums">
                          {formatNumber(entry.liters, 2)} L a {formatCurrency(entry.pricePerLiter)}
                        </div>
                      </td>

                      {/* Média km/L */}
                      <td className="py-3 px-3 whitespace-nowrap text-center">
                        {entry.isCurrentTank ? (
                          <div className="inline-flex flex-col items-center px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/20 text-teal-300 font-mono text-[11px]">
                            <span className="font-semibold">Prev: ~{formatNumber(entry.estimatedRangeKm || 198, 0)} km</span>
                            <span className="text-[9px] text-slate-400">média ~33,2 km/L</span>
                          </div>
                        ) : entry.kmPerLiter !== undefined ? (
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-bold text-xs tabular-nums">
                            <span>{formatNumber(entry.kmPerLiter, 2)}</span>
                            <span className="text-[10px] font-normal text-emerald-500/80">km/L</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px] font-mono">--</span>
                        )}
                      </td>

                      {/* Cost per km */}
                      <td className="py-3 px-3 whitespace-nowrap font-mono tabular-nums">
                        {entry.isCurrentTank ? (
                          <div>
                            <span className="font-bold text-amber-400 font-mono">
                              {formatCurrency(entry.costPerKm || 0.22)} / km
                            </span>
                            <div className="text-[10px] text-slate-400 font-sans">
                              Gasto: {formatCurrency((entry.consumedLiters || 0) * (entry.pricePerLiter || 7.19))} ({formatNumber(entry.consumedLiters || 0, 2)} L)
                            </div>
                          </div>
                        ) : entry.costPerKm !== undefined ? (
                          <div>
                            <span className="font-semibold text-slate-200 font-mono">
                              {formatCurrency(entry.costPerKm)} / km
                            </span>
                            <div className="text-[10px] text-slate-500 font-sans">
                              Total: {formatCurrency(entry.totalPrice)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-xs font-mono">--</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onEdit(entry)}
                            title="Editar KM Inicial, KM Atual, litros ou valores"
                            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer border border-slate-700"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Editar</span>
                          </button>
                          <button
                            onClick={() => onDelete(entry.id)}
                            title="Excluir registro"
                            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile / Compact Cards View */}
          <div className="lg:hidden divide-y divide-slate-800">
            {filteredEntries.map(entry => (
              <div key={entry.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white text-sm font-mono">
                        {formatDate(entry.date)}
                      </span>
                      {entry.isCurrentTank ? (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                          Gasolina Nova
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                          Concluído
                        </span>
                      )}
                      {entry.isFullTank ? (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          ⛽ Tanque Cheio (15,1L)
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                          💧 Parcial
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {FUEL_TYPE_LABELS[entry.fuelType]} {entry.station ? `· ${entry.station}` : ''}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-bold text-white text-sm tabular-nums">
                      {formatCurrency(entry.totalPrice)}
                    </div>
                    <div className="text-xs text-slate-400 font-mono tabular-nums">
                      {formatNumber(entry.liters, 2)} L a {formatCurrency(entry.pricePerLiter)}
                    </div>
                  </div>
                </div>

                {/* KM & Consumo Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950/70 p-2.5 rounded-lg text-xs border border-slate-800/80">
                  <div>
                    <span className="text-[10px] text-slate-500 block">KM Inicial</span>
                    <span className="font-mono font-semibold text-slate-200 tabular-nums">
                      {formatNumber(entry.startKm, 0)} km
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 block">KM Atual</span>
                    <span className="font-mono font-semibold text-emerald-400 tabular-nums">
                      {formatNumber(entry.currentKm, 0)} km
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 block">KM Rodados</span>
                    <span className="font-mono font-bold text-white tabular-nums">
                      {entry.distance > 0 ? `+${formatNumber(entry.distance, 0)} km` : (entry.isCurrentTank ? '0 km (em uso)' : '0 km')}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 block">Gasolina Consumida</span>
                    <span className="font-mono font-bold text-teal-300 tabular-nums">
                      {entry.isCurrentTank
                        ? `${formatNumber(entry.consumedLiters || 0, 2)} L`
                        : `${formatNumber(entry.liters, 2)} L`}
                    </span>
                    {entry.isCurrentTank && (
                      <span className={`text-[9px] block font-mono ${entry.isFullTank ? 'text-emerald-300 font-semibold' : 'text-slate-400'}`}>
                        Resta: {formatNumber(entry.remainingLiters ?? entry.liters, 2)} L {entry.isFullTank ? '(de 15,1 L)' : ''}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Row with Actions */}
                <div className="flex items-center justify-between text-xs pt-1 text-slate-400">
                  <div className="text-[11px]">
                    {entry.isCurrentTank ? (
                      <span className="text-teal-300 font-mono">Prev. Autonomia: ~{formatNumber(entry.estimatedRangeKm || 198, 0)} km</span>
                    ) : (
                      <span className="text-emerald-400 font-mono font-semibold">Média: {entry.kmPerLiter !== undefined ? formatNumber(entry.kmPerLiter, 1) : '--'} km/L</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(entry)}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer border border-slate-700"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={() => onDelete(entry.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Table Footer Controls */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
            <span>
              Exibindo <strong>{filteredEntries.length}</strong> de <strong>{entries.length}</strong> abastecimento(s)
            </span>

            <div className="flex items-center gap-3">
              <button
                onClick={onLoadSamples}
                className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar Exemplos</span>
              </button>

              <button
                onClick={onClearAll}
                className="text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
              >
                Limpar Tudo
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
