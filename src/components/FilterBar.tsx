import React, { useState } from 'react';
import { Filter, X, Download, ChevronDown, Check } from 'lucide-react';
import { FilterState } from '../types';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onClearFilters: () => void;
  onExportCSV: () => void;
  availableRegioes: string[];
  availablePracas: string[];
  availableFiliais: string[];
  resultCount: number;
}

const DIAS_OPTIONS = [
  { value: 'todos', label: 'Todos os dias' },
  { value: 'hoje', label: 'Carregam HOJE' },
  { value: 'segunda', label: 'Segunda-feira' },
  { value: 'terca', label: 'Terça-feira' },
  { value: 'quarta', label: 'Quarta-feira' },
  { value: 'quinta', label: 'Quinta-feira' },
  { value: 'sexta', label: 'Sexta-feira' },
  { value: 'sabado', label: 'Sábado' },
  { value: 'definir', label: 'A definir' },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  onExportCSV,
  availableRegioes,
  availablePracas,
  availableFiliais,
  resultCount,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const activeFiltersCount = [
    filters.regiao,
    filters.praca,
    filters.filial,
    filters.dia !== 'todos' ? filters.dia : '',
  ].filter(Boolean).length;

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200/80 shadow-xs p-3">
      {/* Linha principal: Filial Chips Rápidos + Botões de Filtros Avançados & Exportar */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {/* Filial Chips (São Paulo, Boracéia, Todas) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          <span className="text-xs font-semibold text-slate-500 mr-1 hidden sm:inline">Filial:</span>
          {['', 'Boracéia', 'São Paulo'].map((f) => {
            const isSelected = filters.filial === f;
            return (
              <button
                key={f || 'todas'}
                onClick={() => onFilterChange({ ...filters, filial: f })}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0 border ${
                  isSelected
                    ? 'bg-[#0B2A4A] text-white border-[#0B2A4A]'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
              >
                {f || 'Todas Filiais'}
              </button>
            );
          })}
        </div>

        {/* Botão de Filtros e Exportação */}
        <div className="flex items-center gap-1.5 ml-auto">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
              activeFiltersCount > 0
                ? 'bg-amber-50 text-amber-900 border-amber-300'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
            }`}
          >
            <Filter className="w-3.5 h-3.5 text-[#F28C28]" />
            <span>Filtros</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#F28C28] text-white text-[10px] flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            )}
            <ChevronDown className={`w-3 h-3 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
          </button>

          <button
            onClick={onExportCSV}
            title="Exportar dados filtrados para CSV"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Exportar</span>
          </button>
        </div>
      </div>

      {/* Painel de Filtros Avançados (Expansível) */}
      {showAdvanced && (
        <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs animate-in fade-in duration-150">
          {/* Região */}
          <div>
            <label className="block text-slate-500 font-medium mb-1">Região Comercial:</label>
            <select
              value={filters.regiao}
              onChange={(e) => onFilterChange({ ...filters, regiao: e.target.value })}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:border-[#F28C28] focus:ring-1 focus:ring-[#F28C28] outline-none cursor-pointer"
            >
              <option value="">Todas as Regiões</option>
              {availableRegioes.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Praça */}
          <div>
            <label className="block text-slate-500 font-medium mb-1">Praça de Destino:</label>
            <select
              value={filters.praca}
              onChange={(e) => onFilterChange({ ...filters, praca: e.target.value })}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:border-[#F28C28] focus:ring-1 focus:ring-[#F28C28] outline-none cursor-pointer"
            >
              <option value="">Todas as Praças</option>
              {availablePracas.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Dia de Carregamento */}
          <div>
            <label className="block text-slate-500 font-medium mb-1">Dia de Carregamento:</label>
            <select
              value={filters.dia}
              onChange={(e) => onFilterChange({ ...filters, dia: e.target.value })}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:border-[#F28C28] focus:ring-1 focus:ring-[#F28C28] outline-none cursor-pointer"
            >
              {DIAS_OPTIONS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          {/* Botão Limpar Filtros se houver ativos */}
          {activeFiltersCount > 0 && (
            <div className="sm:col-span-3 flex justify-end pt-1">
              <button
                onClick={onClearFilters}
                className="text-xs text-[#F28C28] hover:text-[#d47214] font-semibold flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                Limpar todos os filtros ({activeFiltersCount})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
