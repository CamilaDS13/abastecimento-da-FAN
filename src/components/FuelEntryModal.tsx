import React, { useState, useEffect } from 'react';
import { X, Fuel, Check, AlertTriangle, Navigation, Calendar, Gauge } from 'lucide-react';
import { FuelEntry, FuelType } from '../types/fuel';
import { FUEL_TYPE_LABELS, formatNumber } from '../utils/formatters';

interface FuelEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Omit<FuelEntry, 'id' | 'createdAt'>, editingId?: string) => void;
  editingEntry?: FuelEntry | null;
  lastOdometer?: number;
  lastPricePerLiter?: number;
  lastFuelType?: FuelType;
}

export const FuelEntryModal: React.FC<FuelEntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingEntry,
  lastOdometer = 87663,
  lastPricePerLiter,
  lastFuelType = 'gasolina_comum',
}) => {
  const today = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState<string>(today);
  const [startOdometer, setStartOdometer] = useState<string>('87663');
  const [currentOdometer, setCurrentOdometer] = useState<string>('87663');
  const [liters, setLiters] = useState<string>('');
  const [pricePerLiter, setPricePerLiter] = useState<string>('');
  const [totalPrice, setTotalPrice] = useState<string>('');
  const [fuelType, setFuelType] = useState<FuelType>(lastFuelType);
  const [isFullTank, setIsFullTank] = useState<boolean>(true);
  const [isCurrentTank, setIsCurrentTank] = useState<boolean>(false);
  const [manualTripDays, setManualTripDays] = useState<string>('');
  const [missedPrevious, setMissedPrevious] = useState<boolean>(false);
  const [station, setStation] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [lastEditedField, setLastEditedField] = useState<'liters' | 'price' | 'total'>('total');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Pre-fill when editing or opening
  useEffect(() => {
    if (editingEntry) {
      setDate(editingEntry.date);
      const start = editingEntry.startOdometer !== undefined ? editingEntry.startOdometer : editingEntry.odometer;
      const curr = editingEntry.currentOdometer !== undefined ? editingEntry.currentOdometer : (start + (editingEntry.manualTripKm || 0));
      setStartOdometer(start.toString());
      setCurrentOdometer(curr.toString());
      setLiters(editingEntry.liters.toString());
      setPricePerLiter(editingEntry.pricePerLiter.toString());
      setTotalPrice(editingEntry.totalPrice.toString());
      setFuelType(editingEntry.fuelType);
      setIsFullTank(editingEntry.isFullTank);
      setIsCurrentTank(!!editingEntry.isCurrentTank);
      setManualTripDays(editingEntry.manualTripDays !== undefined ? editingEntry.manualTripDays.toString() : '');
      setMissedPrevious(!!editingEntry.missedPrevious);
      setStation(editingEntry.station || '');
      setNotes(editingEntry.notes || '');
    } else {
      setDate(today);
      const baseOdo = lastOdometer > 0 ? lastOdometer : 87663;
      setStartOdometer(baseOdo.toString());
      setCurrentOdometer(baseOdo.toString());
      setLiters('');
      setPricePerLiter(lastPricePerLiter ? lastPricePerLiter.toFixed(2) : '7.19');
      setTotalPrice('');
      setFuelType(lastFuelType);
      setIsFullTank(true);
      setIsCurrentTank(true); // Novo abastecimento entra como gasolina nova
      setManualTripDays('');
      setMissedPrevious(false);
      setStation('');
      setNotes('');
    }
    setErrorMessage('');
  }, [editingEntry, isOpen, lastOdometer, lastPricePerLiter, lastFuelType]);

  // Dynamic automatic calculation of Liters, Price, or Total
  const handleLitersChange = (val: string) => {
    setLiters(val);
    setLastEditedField('liters');
    const l = parseFloat(val);
    const p = parseFloat(pricePerLiter);
    if (!isNaN(l) && !isNaN(p) && l > 0 && p > 0) {
      setTotalPrice((l * p).toFixed(2));
    }
  };

  const handlePriceChange = (val: string) => {
    setPricePerLiter(val);
    setLastEditedField('price');
    const p = parseFloat(val);
    const l = parseFloat(liters);
    const t = parseFloat(totalPrice);

    if (!isNaN(p) && p > 0) {
      if (lastEditedField === 'total' && !isNaN(t) && t > 0) {
        setLiters((t / p).toFixed(2));
      } else if (!isNaN(l) && l > 0) {
        setTotalPrice((l * p).toFixed(2));
      }
    }
  };

  const handleTotalChange = (val: string) => {
    setTotalPrice(val);
    setLastEditedField('total');
    const t = parseFloat(val);
    const p = parseFloat(pricePerLiter);
    if (!isNaN(t) && !isNaN(p) && t > 0 && p > 0) {
      setLiters((t / p).toFixed(2));
    }
  };

  // Cálculo ao vivo de Km Rodados e Consumo considerando se o tanque ficou cheio (Fan 2013 = 15,1L)
  const startNum = parseFloat(startOdometer) || 0;
  const currentNum = parseFloat(currentOdometer) || startNum;
  const kmRodadosAoVivo = Math.max(0, currentNum - startNum);
  const litrosNum = parseFloat(liters) || 0;
  const volumeInicialTanque = isFullTank ? 15.1 : litrosNum;
  const litrosConsumidosAoVivo = isCurrentTank 
    ? (kmRodadosAoVivo > 0 ? kmRodadosAoVivo / 33.2 : 0)
    : litrosNum;
  const litrosRestantesAoVivo = isCurrentTank 
    ? Math.max(0, volumeInicialTanque - litrosConsumidosAoVivo) 
    : 0;
  const autonomiaEstimadaAoVivo = isCurrentTank
    ? litrosRestantesAoVivo * 33.2
    : 0;
  const mediaKmlAoVivo = !isCurrentTank && kmRodadosAoVivo > 0 && litrosNum > 0 
    ? kmRodadosAoVivo / litrosNum 
    : 33.2;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const startVal = parseFloat(startOdometer);
    const currentVal = parseFloat(currentOdometer);
    const litNum = parseFloat(liters);
    const priceNum = parseFloat(pricePerLiter);
    const totalNum = parseFloat(totalPrice);
    const tripDaysNum = manualTripDays.trim() ? parseFloat(manualTripDays) : undefined;

    if (isNaN(startVal) || startVal <= 0) {
      setErrorMessage('Informe o KM Inicial do abastecimento.');
      return;
    }

    if (isNaN(currentVal) || currentVal < startVal) {
      setErrorMessage('O KM Atual não pode ser menor que o KM Inicial.');
      return;
    }

    if (isNaN(litNum) || litNum <= 0) {
      setErrorMessage('Informe a quantidade de litros abastecidos.');
      return;
    }

    if (isNaN(priceNum) || priceNum <= 0) {
      setErrorMessage('Informe o valor por litro.');
      return;
    }

    if (isNaN(totalNum) || totalNum <= 0) {
      setErrorMessage('Informe o valor total pago.');
      return;
    }

    const calculatedKm = Math.max(0, currentVal - startVal);

    onSave(
      {
        date,
        odometer: startVal,
        startOdometer: startVal,
        currentOdometer: currentVal,
        liters: litNum,
        pricePerLiter: priceNum,
        totalPrice: totalNum,
        fuelType,
        isFullTank,
        isCurrentTank,
        manualTripKm: calculatedKm,
        manualTripDays: tripDaysNum,
        missedPrevious,
        station: station.trim() || undefined,
        notes: notes.trim() || undefined,
      },
      editingEntry?.id
    );

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Fuel className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {editingEntry ? 'Editar Abastecimento' : 'Novo Abastecimento'}
              </h3>
              <p className="text-xs text-slate-400">
                Coloque o KM Inicial e o KM Atual para calcular quanto rodou e consumiu
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800/80 text-rose-200 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Situação: Gasolina Nova vs Concluído */}
          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Situação deste Combustível:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <label className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                isCurrentTank
                  ? 'bg-teal-950/60 border-teal-500/40 text-teal-200 font-semibold'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}>
                <input
                  type="radio"
                  name="statusTanque"
                  checked={isCurrentTank}
                  onChange={() => setIsCurrentTank(true)}
                  className="text-teal-500 focus:ring-teal-500"
                />
                <span>⛽ Gasolina Nova / Em Uso</span>
              </label>

              <label className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                !isCurrentTank
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200 font-semibold'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}>
                <input
                  type="radio"
                  name="statusTanque"
                  checked={!isCurrentTank}
                  onChange={() => setIsCurrentTank(false)}
                  className="text-emerald-500 focus:ring-emerald-500"
                />
                <span>✅ Ciclo Concluído (já rodei)</span>
              </label>
            </div>
          </div>

          {/* Marcador: O Tanque ficou Cheio? (Capacidade Fan 2013: 15,1 L) */}
          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <span>⛽ O Tanque ficou Cheio com este abastecimento?</span>
              </label>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                Capacidade: 15,1 L
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <label className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                isFullTank
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200 font-semibold shadow-sm shadow-emerald-500/10'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}>
                <input
                  type="radio"
                  name="tanqueCheio"
                  checked={isFullTank}
                  onChange={() => setIsFullTank(true)}
                  className="text-emerald-500 focus:ring-emerald-500"
                />
                <div>
                  <span className="block font-bold">Sim, Tanque Cheio (15,1 L)</span>
                  <span className="text-[10px] text-slate-400 block">Completou até a boca</span>
                </div>
              </label>

              <label className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                !isFullTank
                  ? 'bg-slate-800/80 border-slate-700 text-slate-200 font-semibold'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}>
                <input
                  type="radio"
                  name="tanqueCheio"
                  checked={!isFullTank}
                  onChange={() => setIsFullTank(false)}
                  className="text-slate-400 focus:ring-slate-500"
                />
                <div>
                  <span className="block font-medium">Não, Abastecimento Parcial</span>
                  <span className="text-[10px] text-slate-500 block">Coloquei apenas uma quantia</span>
                </div>
              </label>
            </div>
            <p className="text-[11px] text-slate-400 pt-0.5">
              {isFullTank
                ? '✅ Tanque Cheio (15,1 L): O cálculo considerará a capacidade total de 15,1 L no tanque para calcular a gasolina restante e a autonomia.'
                : '💧 Abastecimento Parcial: O cálculo considerará apenas os litros abastecidos nesta ocasião.'}
            </p>
          </div>

          {/* Row 1: Date & Fuel Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Data do Abastecimento
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Tipo de Combustível
              </label>
              <select
                value={fuelType}
                onChange={e => setFuelType(e.target.value as FuelType)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                {(Object.keys(FUEL_TYPE_LABELS) as FuelType[]).map(type => (
                  <option key={type} value={type}>
                    {FUEL_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: KM Inicial e KM Atual (SOLICITADO NO PRINT 3) */}
          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
              <Gauge className="w-4 h-4" />
              <span>Quilometragem no Painel da Moto</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-300 mb-1">
                  KM Inicial (ao abastecer)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    required
                    placeholder="Ex: 87663"
                    value={startOdometer}
                    onChange={e => setStartOdometer(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-750 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                  <span className="absolute right-3 top-2 text-xs text-slate-500">km</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-300 mb-1">
                  KM Atual (painel agora)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    required
                    placeholder="Ex: 87663"
                    value={currentOdometer}
                    onChange={e => setCurrentOdometer(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-750 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500 font-semibold text-emerald-300"
                  />
                  <span className="absolute right-3 top-2 text-xs text-slate-500">km</span>
                </div>
              </div>
            </div>

            {/* Resultado do cálculo em tempo real */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-xs">
              <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Km Rodados</span>
                <span className="font-mono font-bold text-emerald-400 text-base">
                  +{kmRodadosAoVivo} km
                </span>
              </div>

              <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">
                  {isCurrentTank ? 'Gasolina Consumida' : 'Consumo Calculado'}
                </span>
                <span className="font-mono font-bold text-teal-300 text-base">
                  {isCurrentTank 
                    ? `~${formatNumber(litrosConsumidosAoVivo, 2)} L` 
                    : `${formatNumber(mediaKmlAoVivo, 1)} km/L`}
                </span>
              </div>

              <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">
                  {isCurrentTank ? (isFullTank ? 'Resta no Tanque (15,1 L)' : 'Resta da Gasolina') : 'Status'}
                </span>
                <span className="font-mono font-bold text-amber-300 text-base">
                  {isCurrentTank 
                    ? `${formatNumber(litrosRestantesAoVivo, 2)} L (~${formatNumber(autonomiaEstimadaAoVivo, 0)} km)` 
                    : 'Concluído'}
                </span>
              </div>
            </div>
          </div>

          {/* Row 3: Litros, Preço/L, Total R$ (with auto-calc) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-xl">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Litros Abastecidos (L)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="Ex: 5.98"
                value={liters}
                onChange={e => handleLitersChange(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Preço / Litro (R$)
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-2 text-xs font-mono text-slate-500">R$</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Ex: 7.19"
                  value={pricePerLiter}
                  onChange={e => handlePriceChange(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-2 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Total Pago (R$)
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-2 text-xs font-mono text-slate-500">R$</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Ex: 42.99"
                  value={totalPrice}
                  onChange={e => handleTotalChange(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-2 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500 font-semibold text-emerald-400"
                />
              </div>
            </div>
          </div>

          {/* Duração em dias se for ciclo concluído */}
          {!isCurrentTank && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Duração deste ciclo em dias (opcional)</span>
              </label>
              <input
                type="number"
                step="1"
                placeholder="Ex: 8"
                value={manualTripDays}
                onChange={e => setManualTripDays(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          {/* Row 4: Posto e Observações */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Posto / Bandeira (opcional)
              </label>
              <input
                type="text"
                placeholder="Ex: Posto da Serra, Shell..."
                value={station}
                onChange={e => setStation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 placeholder:text-slate-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Observações (opcional)
              </label>
              <input
                type="text"
                placeholder="Ex: trajeto de trabalho, serra..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 placeholder:text-slate-600"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-slate-950 bg-emerald-500 hover:bg-emerald-400 rounded-lg shadow-sm transition-all cursor-pointer font-bold"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{editingEntry ? 'Salvar Alterações' : 'Registrar Abastecimento'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
