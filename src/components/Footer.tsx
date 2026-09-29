import React from 'react';
import { Database, Clock, Smartphone, ShieldCheck, RefreshCw } from 'lucide-react';
import { formatDateFull } from '../utils/loadingDay';

interface FooterProps {
  lastUpdated: Date | null;
  totalCities: number;
  isUsingCache: boolean;
  isSeedData: boolean;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  lastUpdated,
  totalCities,
  isUsingCache,
  isSeedData,
  onRefresh,
  isRefreshing,
}) => {
  const formatTime = (date: Date | null): string => {
    if (!date) return '--/--/---- --:--';
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    const hr = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${d}/${m}/${y} ${hr}:${min}`;
  };

  const formatShortTime = (date: Date | null): string => {
    if (!date) return '--/-- --:--';
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const hr = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${d}/${m} ${hr}:${min}`;
  };

  return (
    <footer className="mt-8 border-t border-slate-200/80 bg-white/80 backdrop-blur-xs py-6 px-4 text-slate-500 text-xs">
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Aviso de Cache Offline se ativo */}
        {isUsingCache && lastUpdated && (
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                Exibindo dados salvos de <strong>{formatShortTime(lastUpdated)}</strong> (Modo Offline)
              </span>
            </div>
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="text-xs font-bold text-blue-700 hover:text-blue-900 underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              Tentar reconectar
            </button>
          </div>
        )}

        {/* Linha Principal de Informações */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="space-y-1">
            <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
              <span className="font-bold text-slate-800">
                Marsil | Consulta de Praças e Carregamento
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600 font-medium">
                Total: <strong className="text-slate-900">{totalCities}</strong> cidades carregadas
              </span>
            </div>

            <div className="flex items-center gap-1.5 justify-center sm:justify-start text-slate-500">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>
                Dados atualizados em: <strong className="text-slate-700">{formatTime(lastUpdated)}</strong>
              </span>
            </div>
          </div>

          {/* Dica para RCA (Mobile App) */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-[11px]">
            <Smartphone className="w-4 h-4 text-[#F28C28] shrink-0" />
            <span>
              <strong>Dica RCA:</strong> No navegador do celular, clique em <em>Compartilhar &gt; Adicionar à Tela Inicial</em>.
            </span>
          </div>
        </div>

        {/* Assinatura */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 flex-wrap gap-2">
          <span>Sistema de Roteirização e Carregamento Marsil</span>
          <span>Filiais Boracéia e São Paulo</span>
        </div>
      </div>
    </footer>
  );
};
