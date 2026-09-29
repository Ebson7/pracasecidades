import React from 'react';
import { SearchX, PhoneCall, RotateCcw } from 'lucide-react';

interface EmptyStateProps {
  searchQuery: string;
  hasFilters: boolean;
  onClearFilters: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  searchQuery,
  hasFilters,
  onClearFilters,
}) => {
  return (
    <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center max-w-md mx-auto my-6 shadow-xs">
      <div className="w-14 h-14 rounded-2xl bg-amber-50 text-[#F28C28] flex items-center justify-center mx-auto mb-3.5 shadow-2xs">
        <SearchX className="w-7 h-7" />
      </div>

      <h3 className="text-lg font-bold text-slate-900 mb-1">
        Cidade não encontrada
      </h3>

      <p className="text-sm text-slate-600 mb-5 leading-relaxed">
        {searchQuery ? (
          <>
            Nenhum resultado para <strong className="text-slate-900">"{searchQuery}"</strong>. Confira a grafia ou fale com a Logística.
          </>
        ) : (
          'Nenhuma cidade corresponde aos filtros selecionados. Tente ajustar os parâmetros ou fale com a Logística.'
        )}
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
        {(searchQuery || hasFilters) && (
          <button
            onClick={onClearFilters}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Limpar busca e filtros
          </button>
        )}

        <a
          href="https://api.whatsapp.com/send?text=Olá,%20gostaria%20de%20consultar%20uma%20cidade%20que%20não%20encontrei%20no%20app%20Marsil."
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#0B2A4A] hover:bg-[#082038] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
        >
          <PhoneCall className="w-3.5 h-3.5 text-[#F28C28]" />
          Falar com a Logística
        </a>
      </div>
    </div>
  );
};
