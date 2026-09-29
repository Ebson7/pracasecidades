import React, { useState } from 'react';
import { Download, Smartphone, X, Share, PlusSquare, Check } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'header' | 'banner' | 'inline';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'header' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [dismissedBanner, setDismissedBanner] = useState(() => {
    try {
      return localStorage.getItem('marsil_dismiss_pwa_banner') === 'true';
    } catch {
      return false;
    }
  });

  // Se já estiver rodando como aplicativo instalado (standalone), não precisa exibir o botão
  if (isInstalled) {
    return null;
  }

  const handleDismiss = () => {
    setDismissedBanner(true);
    try {
      localStorage.setItem('marsil_dismiss_pwa_banner', 'true');
    } catch {
      // ignore
    }
  };

  // 1. Variante: Banner Superior / Destaque Mobile
  if (variant === 'banner') {
    if (dismissedBanner) return null;

    return (
      <>
        <div className="w-full bg-gradient-to-r from-[#0B2A4A] to-[#123a63] text-white p-3 sm:p-3.5 rounded-2xl shadow-sm border border-white/10 flex items-center justify-between gap-3 transition-all">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#F28C28] text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-black uppercase tracking-wider text-[#F28C28] block">
                Instale no Celular (PWA)
              </span>
              <p className="text-xs text-slate-200 truncate">
                Acesse mais rápido direto da sua tela inicial e consulte offline
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {isInstallable && (
              <button
                onClick={install}
                className="px-3 py-1.5 rounded-lg bg-[#F28C28] hover:bg-[#d47214] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Instalar</span>
              </button>
            )}

            {isIOS && (
              <button
                onClick={() => setShowIOSModal(true)}
                className="px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1.5 border border-white/20 cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5 text-[#F28C28]" />
                <span>Instalar no iPhone</span>
              </button>
            )}

            <button
              onClick={handleDismiss}
              title="Dispensar aviso"
              className="p-1 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal de Instruções iOS */}
        {showIOSModal && (
          <IOSInstallModal onClose={() => setShowIOSModal(false)} />
        )}
      </>
    );
  }

  // 2. Variante: Botão no Cabeçalho (Header)
  return (
    <>
      {isInstallable && (
        <button
          onClick={install}
          title="Instalar aplicativo Marsil no dispositivo"
          className="flex items-center gap-1.5 h-10 px-3 rounded-lg bg-[#F28C28] hover:bg-[#d47214] active:bg-[#c2650d] text-white text-xs font-bold transition shadow-xs cursor-pointer touch-manipulation animate-pulse"
        >
          <Download className="w-4 h-4 text-white" />
          <span className="hidden sm:inline">Instalar App</span>
        </button>
      )}

      {isIOS && (
        <button
          onClick={() => setShowIOSModal(true)}
          title="Instalar na tela de início do iPhone"
          className="flex items-center gap-1.5 h-10 px-2.5 sm:px-3 rounded-lg bg-white/15 hover:bg-white/20 text-white text-xs font-semibold transition border border-white/15 cursor-pointer touch-manipulation"
        >
          <Smartphone className="w-4 h-4 text-[#F28C28]" />
          <span className="hidden sm:inline">Instalar no iOS</span>
        </button>
      )}

      {showIOSModal && (
        <IOSInstallModal onClose={() => setShowIOSModal(false)} />
      )}
    </>
  );
};

// Modal explicativo com o passo a passo nativo para iOS Safari
const IOSInstallModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 text-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0B2A4A] text-[#F28C28] flex items-center justify-center">
              <Smartphone className="w-4 h-4 text-[#F28C28]" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Instalar no iPhone / iPad
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="p-1.5 rounded-lg bg-blue-100 text-blue-800 shrink-0">
              <Share className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-slate-900 font-bold block">1. Toque em Compartilhar</strong>
              No navegador Safari do iPhone, toque no botão central de <strong>Compartilhar</strong> (ícone com quadrado e seta para cima).
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800 shrink-0">
              <PlusSquare className="w-4 h-4 text-[#F28C28]" />
            </div>
            <div>
              <strong className="text-slate-900 font-bold block">2. Adicionar à Tela de Início</strong>
              Role as opções para baixo e selecione <strong>"Adicionar à Tela de Início"</strong>.
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 shrink-0">
              <Check className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-slate-900 font-bold block">3. Confirmar</strong>
              Toque em <strong>"Adicionar"</strong> no canto superior direito para abrir o app direto como aplicativo nativo.
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-[#0B2A4A] text-white text-xs font-bold hover:bg-[#071d33] transition cursor-pointer"
        >
          Entendido
        </button>
      </div>
    </div>
  );
};
