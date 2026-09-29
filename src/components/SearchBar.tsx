import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  onClear: () => void;
  resultCount: number;
  totalCount: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onClear,
}) => {
  return (
    <div className="w-full">
      <div className="relative flex items-center">
        <div className="absolute left-3.5 text-slate-400 pointer-events-none">
          <Search className="w-5 h-5 text-[#0B2A4A]/60" />
        </div>

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Digite a cidade ou praça (ex: ribeirao, jau, sao jose)..."
          className="w-full h-13 pl-11 pr-11 bg-white rounded-xl border-2 border-slate-200 focus:border-[#F28C28] focus:ring-4 focus:ring-[#F28C28]/15 text-slate-800 placeholder-slate-400 text-base font-medium shadow-sm transition-all outline-none"
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
        />

        {value && (
          <button
            onClick={onClear}
            className="absolute right-3 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            title="Limpar busca"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Sugestões rápidas de pesquisa quando o campo está vazio */}
      {!value && (
        <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1 text-xs text-slate-500 no-scrollbar">
          <span className="shrink-0 font-medium text-slate-400">Exemplos:</span>
          {['Bauru', 'Jaú', 'Campinas', 'Ribeirão Preto', 'Santos', 'São Paulo', 'São José'].map((item) => (
            <button
              key={item}
              onClick={() => onChange(item)}
              className="shrink-0 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition cursor-pointer"
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
