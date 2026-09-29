import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronRight, Building2, MapPin, Calendar, Copy, Check, AlertCircle } from 'lucide-react';
import { CityRecord } from '../types';
import { normalizeText, matchesQuery, formatPracaName } from '../utils/normalize';
import { parseLoadingDay } from '../utils/loadingDay';

interface PracasViewProps {
  cities: CityRecord[];
  selectedFilial?: string;
  onSelectFilial?: (filial: string) => void;
  referenceDate?: Date;
}

interface RegionGroup {
  regionName: string;
  pracas: {
    pracaName: string;
    cities: CityRecord[];
    filiais: string[];
    distinctDays: string[];
  }[];
}

export const PracasView: React.FC<PracasViewProps> = ({
  cities,
  selectedFilial = '',
  onSelectFilial,
  referenceDate,
}) => {
  const [search, setSearch] = useState('');
  const [expandedPracas, setExpandedPracas] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Agrupa cidades por Região e Praça
  const groupedData: RegionGroup[] = useMemo(() => {
    // Filtra pelo search e pela filial se houver
    let filtered = cities;
    if (selectedFilial) {
      filtered = filtered.filter((c) =>
        c.Filial.toLowerCase().includes(selectedFilial.toLowerCase())
      );
    }
    if (search.trim()) {
      filtered = filtered.filter(
        (c) =>
          matchesQuery(c.Praca, search) ||
          matchesQuery(c.Cidade, search) ||
          matchesQuery(c.Regiao, search)
      );
    }

    const regionsMap = new Map<string, Map<string, CityRecord[]>>();

    filtered.forEach((c) => {
      const reg = c.Regiao || 'Outras Regiões';
      const pra = c.Praca || c.Cidade;

      if (!regionsMap.has(reg)) {
        regionsMap.set(reg, new Map());
      }
      const pracasMap = regionsMap.get(reg)!;
      if (!pracasMap.has(pra)) {
        pracasMap.set(pra, []);
      }
      pracasMap.get(pra)!.push(c);
    });

    const result: RegionGroup[] = [];

    regionsMap.forEach((pracasMap, regionName) => {
      const pracasArr = Array.from(pracasMap.entries()).map(([pracaName, cityList]) => {
        const filiais = Array.from(new Set(cityList.map((c) => c.Filial))).filter(Boolean);
        const distinctDays = Array.from(
          new Set(cityList.map((c) => c.Data_Carregamento?.trim() || 'A definir'))
        );
        return {
          pracaName,
          cities: cityList,
          filiais,
          distinctDays,
        };
      });

      // Ordena praças pelo nome
      pracasArr.sort((a, b) => a.pracaName.localeCompare(b.pracaName, 'pt-BR'));

      result.push({
        regionName,
        pracas: pracasArr,
      });
    });

    // Ordena regiões pelo nome
    result.sort((a, b) => a.regionName.localeCompare(b.regionName, 'pt-BR'));

    return result;
  }, [cities, search]);

  const togglePraca = (pracaId: string) => {
    setExpandedPracas((prev) => ({
      ...prev,
      [pracaId]: !prev[pracaId],
    }));
  };

  const handleCopyCity = async (city: CityRecord) => {
    const text = `📍 Cidade: ${city.Cidade} | Praça: ${city.Praca} | Filial: ${city.Filial} | 🚚 Carregamento: ${city.Data_Carregamento || 'A definir'}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(city.id);
      setTimeout(() => setCopiedKey(null), 1800);
    } catch {
      // fallback
    }
  };

  const toggleAll = (expand: boolean) => {
    const newExpanded: Record<string, boolean> = {};
    if (expand) {
      groupedData.forEach((rg) => {
        rg.pracas.forEach((p) => {
          newExpanded[`${rg.regionName}-${p.pracaName}`] = true;
        });
      });
    }
    setExpandedPracas(newExpanded);
  };

  const totalPracas = useMemo(() => {
    return groupedData.reduce((acc, rg) => acc + rg.pracas.length, 0);
  }, [groupedData]);

  return (
    <div className="space-y-4">
      {/* Barra de Busca de Praça e Controles */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtrar praça ou cidade..."
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#0B2A4A] text-sm text-slate-800 outline-none transition"
          />
        </div>

        <div className="flex items-center justify-between w-full sm:w-auto gap-2">
          <span className="text-xs text-slate-500 font-medium">
            <strong>{totalPracas}</strong> praças encontradas
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => toggleAll(true)}
              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition"
            >
              Expandir todas
            </button>
            <button
              onClick={() => toggleAll(false)}
              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition"
            >
              Recolher
            </button>
          </div>
        </div>
      </div>

      {/* Lista Agrupada por Região */}
      {groupedData.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
          <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-800">Nenhuma praça encontrada</h3>
          <p className="text-xs text-slate-500 mt-1">Verifique a grafia ou limpe o termo de busca.</p>
        </div>
      ) : (
        groupedData.map((rg) => (
          <div key={rg.regionName} className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Cabeçalho da Região */}
            <div className="bg-slate-100/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-[#0B2A4A]">
                Região: {rg.regionName}
              </span>
              <span className="text-[11px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                {rg.pracas.length} {rg.pracas.length === 1 ? 'praça' : 'praças'}
              </span>
            </div>

            {/* Praças (Accordion) */}
            <div className="divide-y divide-slate-100">
              {rg.pracas.map((pr) => {
                const pracaKey = `${rg.regionName}-${pr.pracaName}`;
                const isExpanded = !!expandedPracas[pracaKey];

                return (
                  <div key={pr.pracaName} className="transition-colors hover:bg-slate-50/50">
                    {/* Botão Accordion da Praça */}
                    <button
                      onClick={() => togglePraca(pracaKey)}
                      className="w-full text-left p-3.5 flex items-start justify-between gap-3 cursor-pointer"
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="mt-0.5 text-slate-400">
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5 text-[#F28C28]" />
                          ) : (
                            <ChevronRight className="w-5 h-5" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-base font-bold text-slate-900 truncate">
                              {formatPracaName(pr.pracaName)}
                            </h4>
                            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-medium">
                              {pr.cities.length} {pr.cities.length === 1 ? 'cidade' : 'cidades'}
                            </span>
                            <span className="text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded font-medium">
                              Filial: {pr.filiais.join(' / ') || 'Boracéia'}
                            </span>
                          </div>

                          {/* Todos os dias de carregamento distintos presentes nessa praça */}
                          <div className="flex items-center gap-1.5 flex-wrap mt-2">
                            <span className="text-[11px] font-semibold text-slate-400">Dias:</span>
                            {pr.distinctDays.map((d, i) => {
                              const parsed = parseLoadingDay(d, referenceDate);
                              return (
                                <span
                                  key={i}
                                  className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border ${
                                    parsed.displayDays[0]?.colorClasses || 'bg-slate-100 text-slate-700 border-slate-200'
                                  }`}
                                >
                                  {d}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Detalhes expandidos: lista de todas as cidades dessa praça */}
                    {isExpanded && (
                      <div className="bg-slate-50/70 p-3.5 border-t border-slate-100">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                          Cidades desta praça e respectivos carregamentos:
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {pr.cities.map((city) => {
                            const parsedDay = parseLoadingDay(city.Data_Carregamento, referenceDate);
                            return (
                              <div
                                key={city.id}
                                className="bg-white p-2.5 rounded-lg border border-slate-200/90 shadow-2xs flex items-center justify-between gap-2"
                              >
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    <span className="font-bold text-slate-800 text-xs truncate">
                                      {city.Cidade}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                    <span
                                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                                        parsedDay.displayDays[0]?.colorClasses || 'bg-slate-100'
                                      }`}
                                    >
                                      {city.Data_Carregamento || 'A definir'}
                                    </span>
                                    {city.Observacao && (
                                      <span
                                        className="text-[10px] text-amber-700 bg-amber-50 px-1 py-0.5 rounded border border-amber-200 truncate max-w-[140px]"
                                        title={city.Observacao}
                                      >
                                        ⚠️ {city.Observacao}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <button
                                  onClick={() => handleCopyCity(city)}
                                  className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer shrink-0"
                                  title="Copiar dados da cidade"
                                >
                                  {copiedKey === city.id ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
};
