import React, { useState } from 'react';
import { X, RefreshCw, QrCode, Download, Copy, Check, Smartphone, Cloud, CheckCircle } from 'lucide-react';
import { FuelEntry } from '../types/fuel';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: FuelEntry[];
  cloudStatus: 'connected' | 'syncing' | 'offline';
  onForceSync: () => Promise<void>;
}

export const SyncModal: React.FC<SyncModalProps> = ({
  isOpen,
  onClose,
  entries,
  cloudStatus,
  onForceSync,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  if (!isOpen) return null;

  const getSyncUrl = () => {
    try {
      const jsonStr = JSON.stringify(entries);
      const base64 = btoa(unescape(encodeURIComponent(jsonStr)));
      if (typeof window !== 'undefined' && window.location.protocol.startsWith('http')) {
        return window.location.origin + window.location.pathname + '?sync=' + base64;
      }
    } catch (e) {
      console.warn(e);
    }
    return typeof window !== 'undefined' ? window.location.href : '';
  };

  const syncUrl = getSyncUrl();
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(syncUrl)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(syncUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  const handleCopyCode = () => {
    const jsonStr = JSON.stringify(entries, null, 2);
    navigator.clipboard.writeText(jsonStr).then(() => {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    });
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncSuccess(false);
    try {
      await onForceSync();
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDownloadHtml = () => {
    window.open('/autokm.html', '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 text-slate-100 shadow-2xl space-y-4 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Sincronização em Nuvem</h3>
              <p className="text-[11px] text-slate-400">PC e Celular atualizados em tempo real</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status da Nuvem em Destaque */}
        <div className="bg-gradient-to-r from-emerald-950/50 to-teal-950/50 border border-emerald-500/40 rounded-xl p-3.5 text-xs text-emerald-200/90 leading-relaxed space-y-2">
          <div className="flex items-center justify-between">
            <div className="font-bold flex items-center gap-1.5 text-emerald-300">
              <Cloud className="w-4 h-4" />
              <span>Sincronização em Nuvem Ativa</span>
            </div>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 font-bold">
              {cloudStatus === 'connected' ? 'Conectado' : cloudStatus === 'syncing' ? 'Salvando...' : 'Offline'}
            </span>
          </div>
          <p className="text-[11px] text-slate-300">
            Qualquer alteração feita no computador ou no celular é sincronizada automaticamente via banco de dados em nuvem.
          </p>

          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="w-full mt-1 py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Sincronizando agora...' : syncSuccess ? '✅ Sincronizado com Sucesso!' : '🔄 Forçar Sincronização Agora'}</span>
          </button>
        </div>

        {/* Opções de Acesso */}
        <div className="space-y-3">
          
          {/* Opção 1: QR Code */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-teal-400" />
                <span>1. Abrir no Celular via QR Code</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 font-bold">
                Câmera
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="bg-white p-2 rounded-lg shrink-0 shadow">
                <img
                  src={qrCodeUrl}
                  alt="QR Code"
                  className="w-32 h-32 object-contain"
                />
              </div>
              <div className="space-y-2 text-xs text-slate-300">
                <p className="text-[11px] text-slate-400">
                  Aponte a câmera do celular para este QR Code. A página abrirá no smartphone com todos os dados sincronizados.
                </p>
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-semibold rounded-lg border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Link Copiado!' : 'Copiar Link Direto'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Opção 2: Baixar HTML */}
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between gap-3 text-xs">
            <div>
              <strong className="text-white block text-xs">2. Arquivo HTML para GitHub</strong>
              <span className="text-[11px] text-slate-400">Abra ou salve o arquivo autokm.html</span>
            </div>
            <button
              onClick={handleDownloadHtml}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Abrir HTML</span>
            </button>
          </div>

          {/* Opção 3: Código de Backup */}
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between gap-3 text-xs">
            <div>
              <strong className="text-white block text-xs">3. Código de Backup Manual</strong>
              <span className="text-[11px] text-slate-400">Copie o JSON dos seus abastecimentos</span>
            </div>
            <button
              onClick={handleCopyCode}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copiado!' : 'Copiar'}</span>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
