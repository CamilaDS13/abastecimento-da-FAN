import React, { useState, useEffect, useMemo } from 'react';
import { FuelEntry, ComputedFuelEntry } from './types/fuel';
import { computeFuelEntries, calculateVehicleStats } from './utils/calculations';
import { USER_REAL_ENTRIES, SAMPLE_FUEL_ENTRIES } from './utils/sampleData';
import { Header } from './components/Header';
import { SummaryCards } from './components/SummaryCards';
import { ConsumptionChart } from './components/ConsumptionChart';
import { TripSimulator } from './components/TripSimulator';
import { EthanolVsGasCalculator } from './components/EthanolVsGasCalculator';
import { FuelEntryModal } from './components/FuelEntryModal';
import { SyncModal } from './components/SyncModal';
import { FuelTable } from './components/FuelTable';
import { FuelGaugePanel } from './components/FuelGaugePanel';
import { OilChangeCard } from './components/OilChangeCard';
import { formatNumber, formatCurrency, formatDate } from './utils/formatters';
import {
  Plus,
  HelpCircle,
  Lightbulb,
  ArrowRight,
  TrendingDown,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Car,
  SlidersHorizontal,
  Navigation,
  Calendar,
  Fuel,
  Coins,
  Gauge,
  Bell,
} from 'lucide-react';

import { syncToCloud, subscribeToCloud } from './services/firebase';

const STORAGE_KEY = 'autokm_entries_v5';

export default function App() {
  const [entries, setEntries] = useState<FuelEntry[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: FuelEntry[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length >= 2) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to read from localStorage:', e);
    }
    return USER_REAL_ENTRIES;
  });

  const [cloudStatus, setCloudStatus] = useState<'connected' | 'syncing' | 'offline'>('connected');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'entries' | 'simulator' | 'calculator'>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<FuelEntry | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Quick odometer calibration modal
  const [isOdometerModalOpen, setIsOdometerModalOpen] = useState(false);
  const [targetOdometer, setTargetOdometer] = useState<string>('');

  const handleForceSync = async () => {
    setCloudStatus('syncing');
    try {
      const ok = await syncToCloud({ registros: entries });
      setCloudStatus(ok ? 'connected' : 'offline');
      showToast(ok ? '✅ Nuvem sincronizada com sucesso!' : '⚠️ Erro ao sincronizar com a nuvem');
    } catch (e) {
      setCloudStatus('offline');
      showToast('⚠️ Erro ao conectar com a nuvem');
    }
  };

  // Sincronização em tempo real via Firestore (Nuvem)
  useEffect(() => {
    const unsubscribe = subscribeToCloud((cloudData) => {
      if (cloudData?.registros && Array.isArray(cloudData.registros) && cloudData.registros.length > 0) {
        setEntries((prev) => {
          if (JSON.stringify(prev) !== JSON.stringify(cloudData.registros)) {
            showToast('☁️ Dados sincronizados da Nuvem!');
            return cloudData.registros;
          }
          return prev;
        });
        setCloudStatus('connected');
      }
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Salva no localStorage e envia para a Nuvem ao alterar
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
      setCloudStatus('syncing');
      syncToCloud({ registros: entries }).then((ok) => {
        setCloudStatus(ok ? 'connected' : 'offline');
      });
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [entries]);

  // Temporary toast notifier
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Computed metrics and overall statistics
  const computedEntries: ComputedFuelEntry[] = useMemo(() => {
    return computeFuelEntries(entries);
  }, [entries]);

  const stats = useMemo(() => {
    return calculateVehicleStats(entries);
  }, [entries]);

  // Latest odometer and price info for smart suggestions
  const latestEntry = useMemo(() => {
    if (entries.length === 0) return null;
    return [...entries].sort((a, b) => b.odometer - a.odometer)[0];
  }, [entries]);

  // Previsão dinâmica para o banner (Fan 2013: 15,1L de capacidade)
  const bannerForecast = useMemo(() => {
    const activeEntry = computedEntries[0];
    const tankCapacity = 15.1;
    let initialFuel = 5.98;
    if (activeEntry) {
      if (activeEntry.isFullTank) {
        initialFuel = tankCapacity;
      } else if (activeEntry.liters && activeEntry.liters > 0) {
        initialFuel = activeEntry.liters;
      }
    }
    const currentKmDriven = (activeEntry?.currentKm && activeEntry?.startKm && activeEntry.currentKm > activeEntry.startKm)
      ? (activeEntry.currentKm - activeEntry.startKm)
      : (activeEntry?.distance || 0);
    const avgKmPerLiter = stats.overallKmPerLiter || 33.2;
    const fuelConsumed = avgKmPerLiter > 0 ? (currentKmDriven / avgKmPerLiter) : 0;
    const remainingLiters = Math.max(0, initialFuel - fuelConsumed);
    const remainingPct = Math.min(100, Math.round((remainingLiters / tankCapacity) * 100));
    const estimatedKm = remainingLiters * avgKmPerLiter;
    const dailyCommute = 33; // 33 km/dia útil informado pelo usuário
    const daysRemaining = Math.max(1, Math.round(estimatedKm / dailyCommute));

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysRemaining);
    const dateStr = futureDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

    return {
      remainingLiters,
      remainingPct,
      daysRemaining,
      estimatedKm,
      dateStr,
      fuelConsumed,
      currentKmDriven,
      currentOdometer: activeEntry?.currentOdometer || activeEntry?.currentKm,
    };
  }, [computedEntries, stats]);


  // Handlers
  const handleSaveEntry = (
    entryData: Omit<FuelEntry, 'id' | 'createdAt'>,
    editingId?: string
  ) => {
    if (editingId) {
      setEntries(prev =>
        prev.map(item =>
          item.id === editingId
            ? { ...item, ...entryData }
            : item
        )
      );
      showToast('Abastecimento atualizado com sucesso!');
    } else {
      const newEntry: FuelEntry = {
        ...entryData,
        id: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        createdAt: Date.now(),
      };
      setEntries(prev => [newEntry, ...prev]);
      showToast('Abastecimento registrado com sucesso!');
    }
    setEditingEntry(null);
  };

  const handleEdit = (entry: ComputedFuelEntry) => {
    setEditingEntry(entry);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este registro de abastecimento?')) {
      setEntries(prev => prev.filter(e => e.id !== id));
      showToast('Registro excluído com sucesso.');
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Atenção: deseja realmente limpar todos os registros?')) {
      setEntries([]);
      showToast('Todos os registros foram removidos.');
    }
  };

  const handleLoadSamples = () => {
    setEntries(USER_REAL_ENTRIES);
    showToast('Dados de 18 a 26 de Outubro restaurados!');
  };

  // Calibrate base odometer
  const handleCalibrateOdometer = (e: React.FormEvent) => {
    e.preventDefault();
    const newCurrentOdo = parseFloat(targetOdometer);
    if (isNaN(newCurrentOdo) || newCurrentOdo <= 0) {
      alert('Informe uma quilometragem válida.');
      return;
    }

    if (entries.length >= 2) {
      // Find latest entry and compute delta offset
      const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date) || a.odometer - b.odometer);
      const currentLatest = sorted[sorted.length - 1].odometer;
      const delta = newCurrentOdo - currentLatest;

      const shifted = entries.map(entry => ({
        ...entry,
        odometer: Math.max(1, Math.round(entry.odometer + delta)),
      }));

      setEntries(shifted);
      showToast(`Odômetro ajustado para ${newCurrentOdo.toLocaleString('pt-BR')} km!`);
    } else if (entries.length === 1) {
      setEntries(prev => [{ ...prev[0], odometer: newCurrentOdo }]);
      showToast(`Odômetro ajustado para ${newCurrentOdo.toLocaleString('pt-BR')} km!`);
    }

    setIsOdometerModalOpen(false);
  };

  const handleExportCSV = () => {
    if (computedEntries.length === 0) {
      alert('Não há dados para exportar.');
      return;
    }

    const headers = [
      'Data',
      'Odômetro (km)',
      'Km Rodados',
      'Litros',
      'Preço por Litro (R$)',
      'Total Pago (R$)',
      'Consumo Médio (km/L)',
      'Custo por Km (R$/km)',
      'Dias desde anterior',
      'Tipo Combustível',
      'Tanque Cheio',
      'Posto',
      'Observações',
    ];

    const rows = computedEntries.map(e => [
      e.date,
      e.odometer,
      e.distance ?? '',
      e.liters.toFixed(2).replace('.', ','),
      e.pricePerLiter.toFixed(2).replace('.', ','),
      e.totalPrice.toFixed(2).replace('.', ','),
      e.kmPerLiter ? e.kmPerLiter.toFixed(2).replace('.', ',') : '',
      e.costPerKm ? e.costPerKm.toFixed(2).replace('.', ',') : '',
      e.daysSinceLast ?? '',
      e.fuelType,
      e.isFullTank ? 'Sim' : 'Não',
      `"${(e.station || '').replace(/"/g, '""')}"`,
      `"${(e.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `autokm_abastecimentos_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Planilha CSV gerada com sucesso!');
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(entries, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `autokm_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Backup JSON exportado com sucesso!');
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          setEntries(parsed);
          showToast(`${parsed.length} abastecimentos importados com sucesso!`);
        } else {
          alert('Arquivo JSON inválido. Certifique-se de que é um backup do AutoKm.');
        }
      } catch (err) {
        alert('Erro ao processar o arquivo JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewModal={() => {
          setEditingEntry(null);
          setIsModalOpen(true);
        }}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        entryCount={entries.length}
        cloudStatus={cloudStatus}
      />

      {/* Main Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Toast alert banner */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-slate-950 font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 text-sm transition-all animate-bounce">
            <CheckCircle className="w-4 h-4 stroke-[2.5]" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Real User Journey Spotlight Banner */}
        <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  🏍️ HONDA FAN 2013 (Tanque ~15,1L)
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  CICLO ENCERRADO
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  GASOLINA NOVA
                </span>
              </div>

              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Média da Fan 2013:</span>
                  <span className="font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                    33,2 km/L
                  </span>
                </h2>
              </div>

              {/* Painel: Previsão e Nível do Tanque com Mostrador PGM-FI e Barrinha Visual */}
              <div className="max-w-4xl my-2">
                <FuelGaugePanel
                  daysRemaining={bannerForecast.daysRemaining}
                  estimatedKm={bannerForecast.estimatedKm}
                  dateStr={bannerForecast.dateStr}
                  remainingLiters={bannerForecast.remainingLiters}
                  remainingPct={bannerForecast.remainingPct}
                  tankCapacity={15.1}
                  consumedLiters={bannerForecast.fuelConsumed}
                  currentKmDriven={bannerForecast.currentKmDriven}
                  currentOdometer={bannerForecast.currentOdometer}
                  onUpdateCurrentOdometer={(newOdo) => {
                    setEntries(prev => {
                      const copy = [...prev];
                      if (copy.length > 0) {
                        copy[0] = {
                          ...copy[0],
                          currentOdometer: newOdo,
                        };
                      }
                      return copy;
                    });
                    showToast(`Odômetro atualizado para ${newOdo.toLocaleString('pt-BR')} km! Barrinha e previsão recalculadas.`);
                  }}
                />
              </div>

              {/* Sub-metrics tags */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-0.5">
                <div className="flex items-center gap-1.5 font-mono">
                  <Navigation className="w-3.5 h-3.5 text-blue-400" />
                  <span>Rodados no ciclo anterior: <strong className="text-white">231 km</strong></span>
                </div>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <div className="flex items-center gap-1.5 font-mono">
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  <span>Custo real: <strong className="text-amber-400">R$ 0,22 / km</strong></span>
                </div>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <div className="flex items-center gap-1.5 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-teal-400" />
                  <span>Ritmo: <strong className="text-teal-300">28,9 km/dia (~R$ 6,25/dia)</strong></span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
              <button
                onClick={() => {
                  const currOdo = latestEntry ? (latestEntry.currentOdometer || latestEntry.odometer) : 83712;
                  setTargetOdometer(currOdo.toString());
                  setIsOdometerModalOpen(true);
                }}
                className="flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold text-teal-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-teal-500/40 rounded-xl transition-all cursor-pointer whitespace-nowrap shadow-sm active:scale-95"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-teal-400" />
                <span>Ajustar Odômetro do Painel</span>
              </button>

              <button
                onClick={() => setActiveTab('simulator')}
                className="flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Simular Próximos Trajetos</span>
              </button>
            </div>
          </div>
        </div>

        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <SummaryCards stats={stats} />

            {/* Quick Simulation Banner */}
            <div className="bg-gradient-to-r from-emerald-950/30 via-slate-900 to-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Simulador com seus dados: "Coloquei X valor, quantos km e dias rende?"</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                    Com a sua média real de{' '}
                    <strong className="text-emerald-300 font-mono">
                      {stats.overallKmPerLiter > 0 ? `${formatNumber(stats.overallKmPerLiter, 1)} km/L` : '38,6 km/L'}
                    </strong>
                    , descubra exatamente quantos km e dias renderá seu próximo abastecimento de combustível a R$ 7,19/L!
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('simulator')}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-emerald-300 hover:text-white bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-700/60 rounded-lg transition-colors whitespace-nowrap cursor-pointer shrink-0"
              >
                <span>Abrir Simulador</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Chart */}
            <ConsumptionChart entries={computedEntries} />

            {/* Recent entries preview */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-white">Abastecimentos Registrados</h3>
                  <p className="text-xs text-slate-400">
                    Acompanhamento do histórico de gastos e rendimento
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('entries')}
                  className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium cursor-pointer"
                >
                  <span>Ver tabela detalhada</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <FuelTable
                entries={computedEntries}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onOpenNewModal={() => {
                  setEditingEntry(null);
                  setIsModalOpen(true);
                }}
                onLoadSamples={handleLoadSamples}
                onClearAll={handleClearAll}
                onExportCSV={handleExportCSV}
                onExportJSON={handleExportJSON}
                onImportJSON={handleImportJSON}
              />
            </div>
          </div>
        )}

        {/* TAB 2: ENTRIES TABLE */}
        {activeTab === 'entries' && (
          <div className="space-y-4">
            <FuelTable
              entries={computedEntries}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onOpenNewModal={() => {
                setEditingEntry(null);
                setIsModalOpen(true);
              }}
              onLoadSamples={handleLoadSamples}
              onClearAll={handleClearAll}
              onExportCSV={handleExportCSV}
              onExportJSON={handleExportJSON}
              onImportJSON={handleImportJSON}
            />
          </div>
        )}

        {/* TAB 3: SIMULATOR */}
        {activeTab === 'simulator' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Simulador de Quilometragem & Autonomia
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Calcule a relação entre valor abastecido (R$), consumo por litro (km/L) e dias de autonomia.
              </p>
            </div>

            <TripSimulator
              stats={stats}
              latestPricePerLiter={latestEntry?.pricePerLiter || 7.19}
            />
          </div>
        )}

        {/* TAB 4: ETHANOL VS GAS */}
        {activeTab === 'calculator' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Calculadora de Paridade: Etanol vs Gasolina
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Descubra em segundos qual dos dois combustíveis compensa mais no posto hoje.
              </p>
            </div>

            <EthanolVsGasCalculator
              latestGasPrice={latestEntry?.pricePerLiter || 7.19}
            />
          </div>
        )}

        {/* Card de Controle de Troca de Óleo da Fan 2013 */}
        <OilChangeCard currentOdometer={bannerForecast.currentOdometer || 83712} />

        {/* Eco Driving Tips footer card */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 text-xs text-slate-400 space-y-2">
          <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span>Como o AutoKm calculou seus dados?</span>
          </div>
          <p className="leading-relaxed">
            • <strong>Distância percorrida:</strong> 66 km (descida de serra) + 165 km (5 dias × 33 km ida e volta ao trabalho) = <strong>231 km</strong>.<br />
            • <strong>Litros consumidos:</strong> R$ 42,99 ÷ R$ 7,19 = <strong>5,98 Litros</strong> (em torno de 6L e pouco).<br />
            • <strong>Consumo médio:</strong> 231 km ÷ 5,98 L = <strong>38,6 km/L</strong>.<br />
            • <strong>Custo do km:</strong> R$ 42,99 ÷ 231 km = <strong>R$ 0,186 / km (~R$ 0,19/km)</strong>.<br />
            • <strong>Autonomia:</strong> 231 km rodados ao longo de <strong>8 dias</strong> (média de 28,9 km por dia com gasto médio de ~R$ 5,37/dia).
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>AutoKm © 2026 — Controle inteligente de consumo, combustível e médias.</span>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Dados salvos localmente no seu navegador</span>
          </div>
        </div>
      </footer>

      {/* New / Edit Entry Modal */}
      <FuelEntryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEntry(null);
        }}
        onSave={handleSaveEntry}
        editingEntry={editingEntry}
        lastOdometer={latestEntry?.odometer}
        lastPricePerLiter={latestEntry?.pricePerLiter || 7.19}
        lastFuelType={latestEntry?.fuelType || 'gasolina_comum'}
      />

      {/* Odometer Quick Calibration Modal */}
      {isOdometerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
              <span>Ajustar Odômetro do seu Veículo</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Coloque exatamente a quilometragem atual que está marcando no painel do seu carro ou moto hoje (26/10). O abastecimento anterior se ajustará automaticamente mantendo os 231 km rodados!
            </p>

            <form onSubmit={handleCalibrateOdometer} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Odômetro Atual (km no painel)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    required
                    placeholder="Ex: 83712"
                    value={targetOdometer}
                    onChange={e => setTargetOdometer(e.target.value)}
                    className="w-full bg-slate-950 border border-teal-500/50 rounded-xl px-4 py-3 text-xl font-bold text-teal-300 font-mono focus:outline-none focus:border-teal-400"
                  />
                  <span className="absolute right-4 top-3.5 text-xs text-slate-400 font-mono">km</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-300 block mb-1.5">Atalhos rápidos para somar km:</span>
                <div className="grid grid-cols-4 gap-2 text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => {
                      const cur = parseFloat(targetOdometer) || 83712;
                      setTargetOdometer(Math.round(cur + 5).toString());
                    }}
                    className="py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold transition-all cursor-pointer"
                  >
                    +5 km
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const cur = parseFloat(targetOdometer) || 83712;
                      setTargetOdometer(Math.round(cur + 10).toString());
                    }}
                    className="py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold transition-all cursor-pointer"
                  >
                    +10 km
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const cur = parseFloat(targetOdometer) || 83712;
                      setTargetOdometer(Math.round(cur + 33).toString());
                    }}
                    className="py-2 rounded-lg bg-teal-950 hover:bg-teal-900 text-teal-300 border border-teal-700 font-bold transition-all cursor-pointer"
                    title="1 dia de trabalho"
                  >
                    +33 km
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const cur = parseFloat(targetOdometer) || 83712;
                      setTargetOdometer(Math.round(cur + 66).toString());
                    }}
                    className="py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold transition-all cursor-pointer"
                  >
                    +66 km
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsOdometerModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-500 hover:bg-emerald-400 rounded-lg transition-colors cursor-pointer"
                >
                  Aplicar Quilometragem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Sincronização em Nuvem (QR Code, Backup e Sincronização) */}
      <SyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        entries={entries}
        cloudStatus={cloudStatus}
        onForceSync={handleForceSync}
      />
    </div>
  );
}
