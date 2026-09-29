import React, { useState } from 'react';
import { Building2, MapPin, Copy, Check, ChevronDown, ChevronUp, Calendar, Info } from 'lucide-react';
import { CityRecord } from '../types';
import { parseLoadingDay } from '../utils/loadingDay';
import { formatPracaName } from '../utils/normalize';

interface PracaSummaryCardProps {
  pracaName: string;
  cities: CityRecord[];
  referenceDate?: Date;
}

export const PracaSummaryCard: React.FC<PracaSummaryCardProps> = ({
  pracaName,
  cities,
  referenceDate,
}) => {
  const [expanded, setExpanded] = useState(true);
  const [copied, setCopied] = useState(false);

  if (!cities || cities.length === 0) return null;

  const regiao = cities[0].Regiao;
  const filiais = Array.from(new Set(cities.map(c => c.Filial))).filter(Boolean);
  
  // Coleta todos os dias distintos presentes nessa praça
  const distinctDaysMap = new Map<string, string>();
  cities.forEach(c => {
    const raw = c.Data_Carregamento?.trim() || 'A definir';
    if (!distinctDaysMap.has(raw)) {
      distinctDaysMap.set(raw, raw);
    }
  });
  const distinctDays = Array.from(distinctDaysMap.values());

  const handleCopyPracaSummary = async () => {
    let text = `📦 PRAÇA: ${pracaName.toUpperCase()} (${regiao}) | Filial: ${filiais.join(', ')}\n`;
    text += `Cidades (${cities.length}):\n`;
    cities.forEach(c => {
      text += `• ${c.Cidade}: ${c.Data_Carregamento || 'A definir'}\n`;
    });
    
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#0B2A4A]/5 to-[#0B2A4A]/10 border-2 border-[#0B2A4A]/20 rounded-2xl p-4 shadow-sm mb-4">
      {/* Cabeçalho da Praça Encontrada */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="px-2 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#0B2A4A] text-white">
              Praça Encontrada
            </span>
            <span className="text-xs font-semibold text-slate-600">
              Região: <strong className="text-slate-900">{regiao}</strong>
            </span>
          </div>

          <h2 className="text-xl font-extrabold text-[#0B2A4A] tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#F28C28]" />
            {formatPracaName(pracaName)}
          </h2>

          <p className="text-xs text-slate-600 mt-1">
            Composta por <strong className="text-slate-900">{cities.length}</strong> {cities.length === 1 ? 'cidade' : 'cidades'} • Filial {filiais.join(' / ')}
          </p>
        </div>

        {/* Ações */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopyPracaSummary}
            className="h-9 px-3 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-2xs flex items-center gap-1.5 transition cursor-pointer"
            title="Copiar resumo da praça com todas as cidades"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copiar Praça</span>
              </>
            )}
          </button>

          <button
            onClick={() => setExpanded(!expanded)}
            className="h-9 w-9 flex items-center justify-center rounded-lg bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 transition cursor-pointer"
            title={expanded ? 'Recolher cidades' : 'Expandir cidades'}
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Dias de Carregamento Distintos na Praça */}
      <div className="mt-3 pt-3 border-t border-[#0B2A4A]/10 flex items-center gap-2 flex-wrap">
        <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-[#F28C28]" />
          Dias de Carregamento na Praça:
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {distinctDays.map((day, idx) => {
            const parsed = parseLoadingDay(day, referenceDate);
            return (
              <span
                key={idx}
                className="px-2 py-0.5 rounded text-xs font-bold bg-white text-slate-800 border border-slate-200 shadow-2xs"
              >
                {day}
              </span>
            );
          })}
        </div>
      </div>

      {/* Cidades da Praça (Expansível) */}
      {expanded && (
        <div className="mt-3.5 pt-3 border-t border-[#0B2A4A]/10">
          <span className="text-xs font-bold text-slate-700 block mb-2">
            Cidades integradas a esta praça:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {cities.map((city) => {
              const day = parseLoadingDay(city.Data_Carregamento, referenceDate);
              return (
                <div
                  key={city.id}
                  className="bg-white/90 p-2.5 rounded-lg border border-slate-200/80 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="min-w-0">
                    <span className="font-bold text-slate-800 block truncate">{city.Cidade}</span>
                    <span className="text-[11px] text-slate-500 truncate block">
                      {city.Data_Carregamento || 'A definir'}
                    </span>
                  </div>
                  {day.isToday && (
                    <span className="shrink-0 text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.5 rounded">
                      HOJE
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
