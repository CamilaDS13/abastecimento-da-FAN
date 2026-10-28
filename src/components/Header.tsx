import React from 'react';
import { Fuel, Plus, Calculator, BarChart3, ListFilter, ArrowLeftRight, Smartphone } from 'lucide-react';

interface HeaderProps {
  activeTab: 'dashboard' | 'entries' | 'simulator' | 'calculator';
  setActiveTab: (tab: 'dashboard' | 'entries' | 'simulator' | 'calculator') => void;
  onOpenNewModal: () => void;
  onOpenSyncModal: () => void;
  entryCount: number;
  cloudStatus?: 'connected' | 'syncing' | 'offline';
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewModal,
  onOpenSyncModal,
  entryCount,
  cloudStatus = 'connected',
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4 sm:gap-8">
          {/* Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/10">
              <Fuel className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5 whitespace-nowrap">
                AutoKm <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-1.5 py-0.5 rounded">🏍️ Fan 2013</span>
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2 text-sm font-medium">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Painel Geral</span>
            </button>

            <button
              onClick={() => setActiveTab('entries')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'entries'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <ListFilter className="w-4 h-4" />
              <span>Abastecimentos</span>
              <span className="text-xs font-mono px-1.5 py-0.2 rounded-full bg-slate-700/60 text-slate-300">
                {entryCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'simulator'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>Simulador Km & Dias</span>
            </button>

            <button
              onClick={() => setActiveTab('calculator')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'calculator'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>Etanol vs Gasolina</span>
            </button>
          </nav>

          {/* Primary Action Button & Cloud Indicator */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Cloud Status Badge Clickable */}
            <button 
              onClick={onOpenSyncModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border bg-slate-900 hover:bg-slate-850 border-slate-800 transition cursor-pointer" 
              title="Clique para ver status e sincronização em tempo real"
            >
              <span className={`w-2 h-2 rounded-full ${cloudStatus === 'syncing' ? 'bg-amber-400 animate-pulse' : cloudStatus === 'connected' ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
              <span className="text-slate-300 font-mono text-[11px] hidden sm:inline">
                {cloudStatus === 'syncing' ? 'Nuvem: Salvando' : cloudStatus === 'connected' ? 'Nuvem: Conectada' : 'Nuvem: Offline'}
              </span>
            </button>

            {/* Sincronização Button */}
            <button
              onClick={onOpenSyncModal}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-teal-300 border border-teal-500/40 hover:border-teal-400 font-semibold px-3 py-2 rounded-xl text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
              title="Sincronizar Celular e Computador"
            >
              <span>📲</span>
              <span className="hidden sm:inline">Sincronização</span>
              <span className="sm:hidden">Sync</span>
            </button>

            <button
              onClick={onOpenNewModal}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-4 py-2 rounded-lg text-sm shadow-sm transition-all duration-150 active:scale-95 whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Abastecer</span>
              <span className="sm:hidden">Novo</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around py-2.5 border-t border-slate-900 text-xs">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded ${
              activeTab === 'dashboard' ? 'text-emerald-400 font-semibold' : 'text-slate-400'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Painel</span>
          </button>
          <button
            onClick={() => setActiveTab('entries')}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded ${
              activeTab === 'entries' ? 'text-emerald-400 font-semibold' : 'text-slate-400'
            }`}
          >
            <ListFilter className="w-4 h-4" />
            <span>Histórico ({entryCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded ${
              activeTab === 'simulator' ? 'text-emerald-400 font-semibold' : 'text-slate-400'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Simulador</span>
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded ${
              activeTab === 'calculator' ? 'text-emerald-400 font-semibold' : 'text-slate-400'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>Álcool/Gas</span>
          </button>
          <button
            onClick={onOpenSyncModal}
            className="flex flex-col items-center gap-1 py-1 px-2 rounded text-teal-400 font-semibold cursor-pointer"
          >
            <Smartphone className="w-4 h-4" />
            <span>Sync</span>
          </button>
        </div>
      </div>
    </header>
  );
};
