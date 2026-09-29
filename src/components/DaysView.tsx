import React, { useState, useMemo } from 'react';
import { Calendar, Truck, Sparkles, Building2, MapPin, Copy, Check, Filter } from 'lucide-react';
import { CityRecord, WeekdayKey } from '../types';
import { WEEKDAY_COLORS, WEEKDAY_LABELS, getTodayWeekdayKey, parseLoadingDay } from '../utils/loadingDay';
import { matchesQuery, formatPracaName } from '../utils/normalize';

interface DaysViewProps {
  cities: CityRecord[];
  selectedFilial?: string;
  onSelectFilial?: (filial: string) => void;
  referenceDate?: Date;
}

const WEEKDAYS: { key: WeekdayKey; label: string; short: string }[] = [
  { key: 'segunda', label: 'Segunda-feira', short: 'Seg' },
  { key: 'terca', label: 'Terça-feira', short: 'Ter' },
  { key: 'quarta', label: 'Quarta-feira', short: 'Qua' },
  { key: 'quinta', label: 'Quinta-feira', short: 'Qui' },
  { key: 'sexta', label: 'Sexta-feira', short: 'Sex' },
  { key: 'sabado', label: 'Sábado', short: 'Sáb' },
];

export const DaysView: React.FC<DaysViewProps> = ({
  cities,
  selectedFilial = '',
  onSelectFilial,
  referenceDate = new Date(),
}) => {
  const todayKey = getTodayWeekdayKey(referenceDate);
  const [selectedDay, setSelectedDay] = useState<WeekdayKey | 'todos'>(
    WEEKDAYS.some((w) => w.key === todayKey) ? todayKey : 'segunda'
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Mapeia cada cidade para os dias em que ela carrega
  const citiesByDay = useMemo(() => {
    const map: Record<WeekdayKey, CityRecord[]> = {
      segunda: [],
      terca: [],
      quarta: [],
      quinta: [],
      sexta: [],
      sabado: [],
      domingo: [],
    };

    cities.forEach((city) => {
      // Aplica filtro de filial se selecionada
      if (selectedFilial && !city.Filial.toLowerCase().includes(selectedFilial.toLowerCase())) {
        return;
      }

      const parsed = parseLoadingDay(city.Data_Carregamento, referenceDate);
      parsed.displayDays.forEach((badge) => {
        if (badge.key in map) {
          map[badge.key as WeekdayKey].push(city);
        }
      });
    });

    return map;
  }, [cities, selectedFilial, referenceDate]);

  // Cidades do dia selecionado com filtro de filial
  const activeCities = useMemo(() => {
    let list = selectedDay === 'todos' ? cities : (citiesByDay[selectedDay] || []);
    if (selectedFilial) {
      list = list.filter((c) => c.Filial.toLowerCase().includes(selectedFilial.toLowerCase()));
    }
    return list;
  }, [cities, citiesByDay, selectedDay, selectedFilial]);

  // Agrupa cidades do dia por Praça
  const pracasForActiveDay = useMemo(() => {
    const map = new Map<string, { praca: string; regiao: string; filial: string; cities: CityRecord[] }>();

    activeCities.forEach((city) => {
      const p = city.Praca || city.Cidade;
      if (!map.has(p)) {
        map.set(p, {
          praca: p,
          regiao: city.Regiao,
          filial: city.Filial,
          cities: [],
        });
      }
      map.get(p)!.cities.push(city);
    });

    return Array.from(map.values()).sort((a, b) => a.praca.localeCompare(b.praca, 'pt-BR'));
  }, [activeCities]);

  const handleCopyCity = async (city: CityRecord) => {
    const text = `📍 Cidade: ${city.Cidade} | Praça: ${city.Praca} | Filial: ${city.Filial} | 🚚 Carregamento: ${city.Data_Carregamento || 'A definir'}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(city.id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // fallback
    }
  };

  return (
    <div className="space-y-4">
      {/* Seletor de Dia da Semana (Mobile First) */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-[#F28C28]" />
            Selecione o Dia de Carregamento:
          </span>

          {/* Filtro rápido por filial */}
          <div className="flex items-center gap-1 text-xs">
            <Filter className="w-3 h-3 text-slate-400" />
            <select
              value={selectedFilial}
              onChange={(e) => onSelectFilial && onSelectFilial(e.target.value)}
              className="h-7 px-2 rounded border border-slate-200 bg-slate-50 text-slate-700 text-xs font-semibold outline-none focus:border-[#0B2A4A]"
            >
              <option value="">Todas as Filiais</option>
              <option value="Boracéia">Filial Boracéia</option>
              <option value="São Paulo">Filial São Paulo</option>
            </select>
          </div>
        </div>

        {/* Botões dos Dias de Segunda a Sábado */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {WEEKDAYS.map((w) => {
            const isToday = w.key === todayKey;
            const isSelected = selectedDay === w.key;
            const count = citiesByDay[w.key]?.length || 0;

            return (
              <button
                key={w.key}
                onClick={() => setSelectedDay(w.key)}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer relative flex flex-col items-center justify-center ${
                  isSelected
                    ? 'bg-[#0B2A4A] text-white border-[#0B2A4A] shadow-md ring-2 ring-[#0B2A4A]/20 scale-[1.02]'
                    : isToday
                    ? 'bg-amber-50 hover:bg-amber-100 text-amber-950 border-amber-300'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {/* Selo HOJE */}
                {isToday && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#F28C28] text-white shadow-2xs">
                    Hoje
                  </span>
                )}

                <span className="text-xs font-bold block">{w.short}</span>
                <span className={`text-[10px] block mt-0.5 ${isSelected ? 'text-slate-200' : 'text-slate-500'}`}>
                  {count} {count === 1 ? 'cid' : 'cidades'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Resumo do dia ativo */}
      <div className="bg-gradient-to-r from-slate-100 to-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">
              {selectedDay !== 'todos' ? WEEKDAY_LABELS[selectedDay] : 'Todos os Dias'}
            </h3>
            {selectedDay === todayKey && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-[#F28C28] text-white flex items-center gap-1 shadow-2xs">
                <Sparkles className="w-3 h-3 fill-current" />
                HOJE
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            <strong>{activeCities.length}</strong> cidades programadas em <strong>{pracasForActiveDay.length}</strong> praças
          </p>
          <div className="mt-1 text-[11px] text-amber-900 bg-amber-50/90 border border-amber-200 px-2.5 py-1 rounded-lg inline-flex items-center gap-1.5 flex-wrap font-medium">
            <span>🚚 <strong>Dia que carrega</strong></span>
            <span>• ⏰ Fechamento: <strong>12:00 SP</strong> / <strong>11:30 BC</strong></span>
            <span>• 📦 Entregas a partir do dia seguinte</span>
          </div>
        </div>

        {selectedDay !== 'todos' && (
          <span
            className={`px-3 py-1 rounded-lg text-xs font-bold border ${WEEKDAY_COLORS[selectedDay]}`}
          >
            {WEEKDAY_LABELS[selectedDay]}
          </span>
        )}
      </div>

      {/* Lista de Praças e Cidades Carregando no Dia */}
      {pracasForActiveDay.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h4 className="text-base font-bold text-slate-800">Nenhum carregamento programado</h4>
          <p className="text-xs text-slate-500 mt-1">
            Não há cidades com rota configurada para {selectedDay !== 'todos' ? WEEKDAY_LABELS[selectedDay] : 'este dia'} com os filtros atuais.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {pracasForActiveDay.map((pGroup) => (
            <div
              key={pGroup.praca}
              className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between"
            >
              {/* Topo da Praça */}
              <div className="p-3.5 bg-slate-50/80 border-b border-slate-100 flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-[#0B2A4A]" />
                    {formatPracaName(pGroup.praca)}
                  </h4>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Região: {pGroup.regiao} • Filial: {pGroup.filial}
                  </span>
                </div>

                <span className="text-xs font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                  {pGroup.cities.length} {pGroup.cities.length === 1 ? 'cidade' : 'cidades'}
                </span>
              </div>

              {/* Lista de cidades dessa praça */}
              <div className="p-3 divide-y divide-slate-100">
                {pGroup.cities.map((city) => (
                  <div key={city.id} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-800 block truncate">
                        {city.Cidade}
                      </span>
                      {city.Observacao && (
                        <span className="text-[11px] text-amber-700 block truncate" title={city.Observacao}>
                          ⚠️ {city.Observacao}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleCopyCity(city)}
                      className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer shrink-0"
                      title="Copiar dados para WhatsApp"
                    >
                      {copiedId === city.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
