import React from 'react';
import { Building2, Factory, Layers, CheckCircle2, ChevronRight } from 'lucide-react';
import { CityRecord } from '../types';

interface FilialSelectorProps {
  selectedFilial: string;
  onSelectFilial: (filial: string) => void;
  cities: CityRecord[];
}

export const FilialSelector: React.FC<FilialSelectorProps> = ({
  selectedFilial,
  onSelectFilial,
  cities,
}) => {
  // Contadores dinâmicos de cidades por filial
  const counts = React.useMemo(() => {
    let boraceia = 0;
    let saoPaulo = 0;

    cities.forEach((c) => {
      const f = (c.Filial || '').toLowerCase();
      if (f.includes('borac') || f.includes('matriz')) {
        boraceia++;
      } else if (f.includes('paulo') || f.includes('sp')) {
        saoPaulo++;
      }
    });

    return {
      total: cities.length,
      boraceia,
      saoPaulo,
    };
  }, [cities]);

  const options = [
    {
      id: '',
      label: 'Todas as Filiais',
      sublabel: 'Visão Geral SP',
      count: counts.total,
      icon: Layers,
      color: 'slate',
    },
    {
      id: 'Boracéia',
      label: 'Filial Boracéia',
      sublabel: 'Matriz / Interior',
      count: counts.boraceia,
      icon: Factory,
      color: 'sky',
    },
    {
      id: 'São Paulo',
      label: 'Filial São Paulo',
      sublabel: 'Capital & Região',
      count: counts.saoPaulo,
      icon: Building2,
      color: 'emerald',
    },
  ];

  return (
    <div className="w-full bg-white rounded-2xl border-2 border-slate-200/90 shadow-sm p-3.5 sm:p-4 transition-all">
      {/* Cabeçalho do Filtro em Destaque */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#0B2A4A] text-[#F28C28] flex items-center justify-center font-bold text-sm shadow-xs">
            🏢
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-[#0B2A4A] tracking-tight uppercase flex items-center gap-1.5">
              Filial de Saída do RCA
              <span className="text-[10px] font-bold text-[#F28C28] bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full lowercase">
                origem do carregamento
              </span>
            </h2>
            <p className="text-[11px] text-slate-500">
              Selecione sua base para filtrar automaticamente rotas, praças e prazos
            </p>
          </div>
        </div>

        {selectedFilial && (
          <button
            onClick={() => onSelectFilial('')}
            className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 underline cursor-pointer shrink-0"
          >
            Limpar seleção
          </button>
        )}
      </div>

      {/* Grid de Seleção em Destaque — 3 Cards Touch Grandes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {options.map((opt) => {
          const isSelected =
            opt.id === ''
              ? !selectedFilial
              : selectedFilial.toLowerCase().includes(opt.id.toLowerCase());

          const IconComponent = opt.icon;

          return (
            <button
              key={opt.id || 'todas'}
              type="button"
              onClick={() => onSelectFilial(opt.id)}
              className={`relative min-h-[58px] p-3 rounded-xl border-2 text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                isSelected
                  ? 'bg-gradient-to-br from-[#0B2A4A] to-[#082038] text-white border-[#0B2A4A] shadow-md ring-2 ring-[#F28C28]/60 scale-[1.01]'
                  : 'bg-slate-50/70 hover:bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-[#F28C28] text-white shadow-2xs'
                      : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                </div>

                <div className="min-w-0">
                  <span
                    className={`block text-xs font-black truncate leading-tight ${
                      isSelected ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {opt.label}
                  </span>
                  <span
                    className={`block text-[11px] truncate ${
                      isSelected ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    {opt.sublabel}
                  </span>
                </div>
              </div>

              {/* Contador de Cidades & Indicador Ativo */}
              <div className="text-right shrink-0 flex flex-col items-end">
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    isSelected
                      ? 'bg-white/20 text-white border border-white/20'
                      : 'bg-slate-200/70 text-slate-700'
                  }`}
                >
                  {opt.count} {opt.count === 1 ? 'cid' : 'cidades'}
                </span>
                {isSelected && (
                  <span className="flex items-center gap-1 text-[10px] text-[#F28C28] font-black uppercase mt-1">
                    <CheckCircle2 className="w-3 h-3 text-[#F28C28]" /> Ativa
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
