import React from 'react';
import { RefreshCw, Database, Settings2, Sparkles, MapPin, Truck } from 'lucide-react';
import { ActiveTab } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  isUsingCache: boolean;
  isSeedData: boolean;
  lastUpdated: Date | null;
  onOpenConfig: () => void;
  totalCities: number;
  selectedFilial?: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onRefresh,
  isRefreshing,
  isUsingCache,
  isSeedData,
  lastUpdated,
  onOpenConfig,
  totalCities,
  selectedFilial,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#0B2A4A] text-white shadow-md">
      {/* Barra superior de status e marca */}
      <div className="max-w-5xl mx-auto px-4 pt-3 pb-2.5">
        <div className="flex items-center justify-between gap-3">
          {/* Logo e Nome */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-[#F28C28] flex items-center justify-center text-white shadow-sm font-black text-lg tracking-wider shrink-0 ring-2 ring-white/10">
              M
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg md:text-xl font-bold tracking-tight text-white leading-tight truncate">
                  Marsil <span className="text-[#F28C28] font-extrabold">|</span> Praças
                </h1>
                {selectedFilial && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-[#F28C28] text-white shadow-xs">
                    {selectedFilial}
                  </span>
                )}
                {isSeedData ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-200 border border-amber-400/30">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    Demo
                  </span>
                ) : isUsingCache ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/20 text-blue-200 border border-blue-400/30">
                    <Database className="w-3 h-3 text-blue-300" />
                    Offline
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Ao vivo
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 truncate hidden sm:block">
                Consulta de Carregamento para Representantes Comerciais (RCAs)
              </p>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Botão de Instalação PWA */}
            <PWAInstallButton variant="header" />

            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Atualizar dados da planilha agora"
              className="flex items-center gap-1.5 h-10 px-3 rounded-lg bg-white/10 hover:bg-white/15 active:bg-white/20 text-white text-xs font-semibold transition border border-white/10 disabled:opacity-50 touch-manipulation cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 text-[#F28C28] ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">Atualizar</span>
            </button>

            <button
              onClick={onOpenConfig}
              title="Configurar Link da Planilha Google Sheets"
              className="h-10 w-10 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white transition border border-white/10 touch-manipulation cursor-pointer"
            >
              <Settings2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Navegação por Abas (Mobile First Touch) */}
      <div className="border-t border-white/10 bg-[#082038]">
        <div className="max-w-5xl mx-auto px-2 flex">
          <button
            onClick={() => setActiveTab('cidades')}
            className={`flex-1 py-3 text-center text-sm font-semibold transition relative flex items-center justify-center gap-2 touch-manipulation cursor-pointer ${
              activeTab === 'cidades'
                ? 'text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapPin className={`w-4 h-4 ${activeTab === 'cidades' ? 'text-[#F28C28]' : 'text-slate-400'}`} />
            <span>Cidades</span>
            <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${activeTab === 'cidades' ? 'bg-[#F28C28] text-white' : 'bg-white/10 text-slate-400'}`}>
              {totalCities}
            </span>
            {activeTab === 'cidades' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F28C28]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('pracas')}
            className={`flex-1 py-3 text-center text-sm font-semibold transition relative flex items-center justify-center gap-2 touch-manipulation cursor-pointer ${
              activeTab === 'pracas'
                ? 'text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Por Praça</span>
            {activeTab === 'pracas' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F28C28]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('dias')}
            className={`flex-1 py-3 text-center text-sm font-semibold transition relative flex items-center justify-center gap-2 touch-manipulation cursor-pointer ${
              activeTab === 'dias'
                ? 'text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Truck className={`w-4 h-4 ${activeTab === 'dias' ? 'text-[#F28C28]' : 'text-slate-400'}`} />
            <span>Por Dia</span>
            {activeTab === 'dias' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F28C28]" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
