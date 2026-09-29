import React, { useState } from 'react';
import { Copy, Check, MapPin, Building2, Calendar, AlertCircle, Share2, Sparkles } from 'lucide-react';
import { CityRecord } from '../types';
import { parseLoadingDay } from '../utils/loadingDay';
import { formatPracaName } from '../utils/normalize';

interface CityCardProps {
  city: CityRecord;
  referenceDate?: Date;
}

export const CityCard: React.FC<CityCardProps> = ({ city, referenceDate }) => {
  const [copied, setCopied] = useState(false);
  const parsedDay = parseLoadingDay(city.Data_Carregamento, referenceDate);
  const formattedPraca = formatPracaName(city.Praca);

  const getShareText = (): string => {
    let diaTexto = city.Data_Carregamento?.trim() || 'A definir';
    if (parsedDay.nextDateFormatted) {
      diaTexto = `${diaTexto} (próx.: ${parsedDay.nextDateFormatted})`;
    }
    let text = `📍 Cidade: ${city.Cidade} | ${formattedPraca} | Filial: ${city.Filial} | 🚚 Carregamento: ${diaTexto} (Fechamento: 12h SP / 11h30 BC) | 📦 Entrega a partir do dia seguinte`;
    if (city.Observacao?.trim()) {
      text += ` | ⚠️ Obs: ${city.Observacao.trim()}`;
    }
    return text;
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = getShareText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback para input temporário
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isFilialBoraceia = city.Filial.toLowerCase().includes('borac') || city.Filial.toLowerCase().includes('matriz');

  return (
    <div className={`bg-white rounded-xl border transition-all duration-150 p-4 shadow-xs hover:shadow-md flex flex-col justify-between relative group ${
      parsedDay.isToday ? 'border-amber-400/90 ring-2 ring-amber-400/20' : 'border-slate-200 hover:border-slate-300'
    }`}>
      {/* Selo HOJE em destaque no topo se o carregamento for hoje */}
      {parsedDay.isToday && (
        <div className="absolute -top-2.5 right-4 bg-[#F28C28] text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
          <Sparkles className="w-3 h-3 fill-current" />
          Carrega HOJE
        </div>
      )}

      <div>
        {/* Cabeçalho do Card: Cidade e Botão Copiar */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-slate-900 leading-snug group-hover:text-[#0B2A4A] transition-colors truncate">
              {city.Cidade}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-semibold text-slate-700 truncate">{formattedPraca}</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500 truncate">{city.Regiao}</span>
            </div>
          </div>

          <button
            onClick={handleCopy}
            className={`p-2 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0 flex items-center gap-1 ${
              copied
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
            title="Copiar dados para enviar ao cliente no WhatsApp"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 text-[11px] font-bold">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] hidden sm:inline">Copiar</span>
              </>
            )}
          </button>
        </div>

        {/* Filial Marsil */}
        <div className="mt-2.5 flex items-center gap-1.5 text-xs font-medium">
          <Building2 className={`w-3.5 h-3.5 ${isFilialBoraceia ? 'text-blue-600' : 'text-emerald-600'}`} />
          <span className="text-slate-500">Filial:</span>
          <span className={`px-2 py-0.5 rounded-md font-semibold text-[11px] ${
            isFilialBoraceia 
              ? 'bg-blue-50 text-blue-800 border border-blue-200/80' 
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200/80'
          }`}>
            {city.Filial}
          </span>
        </div>

        {/* Informações de Carregamento */}
        <div className="mt-3.5 pt-3 border-t border-slate-100">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                Dia de Carregamento
              </span>

              {/* Badges dos Dias */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {parsedDay.displayDays.map((badge, idx) => (
                  <span
                    key={idx}
                    className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${badge.colorClasses}`}
                  >
                    <Calendar className="w-3.5 h-3.5 mr-1 opacity-80" />
                    {badge.name}
                  </span>
                ))}
              </div>

              {/* Lembrete de Fechamento e Entrega em Destaque */}
              <div className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1 flex-wrap font-medium">
                <span className="text-amber-800 font-semibold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                  Fechamento: 12h SP | 11h30 BC
                </span>
                <span>• Entrega a partir do dia seguinte</span>
              </div>
            </div>

            {/* Próxima Data Calculada */}
            {parsedDay.nextDateFormatted && (
              <div className="text-right">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                  Próxima saída
                </span>
                <span className={`text-xs font-bold ${parsedDay.isToday ? 'text-[#F28C28]' : 'text-slate-700'}`}>
                  {parsedDay.nextDateFormatted}
                </span>
              </div>
            )}
          </div>

          {/* Observação (se houver) */}
          {city.Observacao && city.Observacao.trim().length > 0 && (
            <div className="mt-2.5 p-2 rounded-lg bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-start gap-1.5 leading-relaxed">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <strong className="font-semibold">Obs:</strong> {city.Observacao.trim()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
