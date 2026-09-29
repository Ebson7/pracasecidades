import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { FilterBar } from './components/FilterBar';
import { FilialSelector } from './components/FilialSelector';
import { OperationalNotice } from './components/OperationalNotice';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { CityCard } from './components/CityCard';
import { PracaSummaryCard } from './components/PracaSummaryCard';
import { PracasView } from './components/PracasView';
import { DaysView } from './components/DaysView';
import { ConfigModal } from './components/ConfigModal';
import { Footer } from './components/Footer';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { EmptyState } from './components/EmptyState';
import { ErrorAlert } from './components/ErrorAlert';
import { ActiveTab, CityRecord, FilterState, WeekdayKey } from './types';
import { fetchCitiesData } from './services/dataService';
import { normalizeText, matchesQuery } from './utils/normalize';
import { exportToCSV } from './utils/csvExport';
import { parseLoadingDay, getTodayWeekdayKey } from './utils/loadingDay';
import { Truck, Sparkles, AlertCircle, MapPin, Building2 } from 'lucide-react';

export default function App() {
  const [cities, setCities] = useState<CityRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isUsingCache, setIsUsingCache] = useState<boolean>(false);
  const [isSeedData, setIsSeedData] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<ActiveTab>('cidades');
  const [configModalOpen, setConfigModalOpen] = useState<boolean>(false);

  // Filtros - Inicializa filial a partir da preferência salva do RCA
  const [filters, setFilters] = useState<FilterState>(() => {
    let savedFilial = '';
    try {
      savedFilial = localStorage.getItem('marsil_selected_filial_v1') || '';
    } catch (e) {
      // ignore
    }
    return {
      searchQuery: '',
      regiao: '',
      praca: '',
      filial: savedFilial,
      dia: 'todos',
    };
  });

  // Atualiza filial e salva preferência para as próximas sessões do RCA
  const handleSelectFilial = useCallback((filial: string) => {
    setFilters((prev) => ({ ...prev, filial, praca: '' }));
    try {
      if (filial) {
        localStorage.setItem('marsil_selected_filial_v1', filial);
      } else {
        localStorage.removeItem('marsil_selected_filial_v1');
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Carrega dados iniciais
  const loadData = useCallback(async (forceRefresh: boolean = false) => {
    if (forceRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(undefined);

    try {
      const result = await fetchCitiesData(forceRefresh);
      setCities(result.data);
      setLastUpdated(result.lastUpdated);
      setIsUsingCache(result.isUsingCache);
      setIsSeedData(result.isSeedData);
      if (result.error) {
        setError(result.error);
      }
    } catch (err: any) {
      setError(err?.message || 'Erro inesperado ao consultar a base de dados.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData(false);
  }, [loadData]);

  // Lista de Regiões Únicas
  const availableRegioes = useMemo(() => {
    const set = new Set<string>();
    cities.forEach((c) => {
      if (c.Regiao) set.add(c.Regiao);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [cities]);

  // Lista de Praças Únicas (filtráveis por região selecionada)
  const availablePracas = useMemo(() => {
    const set = new Set<string>();
    cities.forEach((c) => {
      if (!filters.regiao || c.Regiao === filters.regiao) {
        if (c.Praca) set.add(c.Praca);
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [cities, filters.regiao]);

  // Lista de Filiais Únicas
  const availableFiliais = useMemo(() => {
    const set = new Set<string>();
    cities.forEach((c) => {
      if (c.Filial) set.add(c.Filial);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [cities]);

  // Hoje para referências de carregamento
  const todayKey = useMemo(() => getTodayWeekdayKey(), []);

  // Cidades Filtradas
  const filteredCities = useMemo(() => {
    const query = filters.searchQuery.trim();

    return cities.filter((city) => {
      // 1. Busca por texto (Cidade, Praça ou Região, sem acento e case insensitive)
      if (query) {
        const matchCity = matchesQuery(city.Cidade, query);
        const matchPraca = matchesQuery(city.Praca, query);
        const matchRegiao = matchesQuery(city.Regiao, query);
        if (!matchCity && !matchPraca && !matchRegiao) {
          return false;
        }
      }

      // 2. Filtro de Região
      if (filters.regiao && city.Regiao !== filters.regiao) {
        return false;
      }

      // 3. Filtro de Praça
      if (filters.praca && city.Praca !== filters.praca) {
        return false;
      }

      // 4. Filtro de Filial
      if (filters.filial && !city.Filial.toLowerCase().includes(filters.filial.toLowerCase())) {
        return false;
      }

      // 5. Filtro de Dia de Carregamento
      if (filters.dia && filters.dia !== 'todos') {
        const parsed = parseLoadingDay(city.Data_Carregamento);

        if (filters.dia === 'hoje') {
          if (!parsed.isToday) return false;
        } else if (filters.dia === 'definir') {
          if (parsed.type !== 'undefined') return false;
        } else {
          // Verifica se o dia selecionado está nos badges
          const hasDay = parsed.displayDays.some((d) => d.key === filters.dia);
          if (!hasDay) return false;
        }
      }

      return true;
    });
  }, [cities, filters]);

  // Praças que bateram exatamente ou fortemente na busca para exibir o card de resumo
  const matchedPracas = useMemo(() => {
    const query = filters.searchQuery.trim();
    if (!query || query.length < 2) return [];

    const normalizedQuery = normalizeText(query);
    const pracaMap = new Map<string, CityRecord[]>();

    cities.forEach((city) => {
      const normPraca = normalizeText(city.Praca);
      if (normPraca.includes(normalizedQuery)) {
        const existing = pracaMap.get(city.Praca) || [];
        existing.push(city);
        pracaMap.set(city.Praca, existing);
      }
    });

    return Array.from(pracaMap.entries()).map(([pracaName, pracaCities]) => ({
      pracaName,
      cities: pracaCities,
    }));
  }, [cities, filters.searchQuery]);

  // Total de cidades carregando hoje na base
  const totalLoadingToday = useMemo(() => {
    return cities.filter((c) => {
      const p = parseLoadingDay(c.Data_Carregamento);
      return p.isToday;
    }).length;
  }, [cities]);

  // Limpar todos os filtros
  const handleClearFilters = () => {
    setFilters({
      searchQuery: '',
      regiao: '',
      praca: '',
      filial: '',
      dia: 'todos',
    });
  };

  // Exportar resultado filtrado para CSV
  const handleExportCSV = () => {
    exportToCSV(filteredCities, `marsil_cidades_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Cabeçalho Fixo com Ações e Abas */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRefresh={() => loadData(true)}
        isRefreshing={isRefreshing}
        isUsingCache={isUsingCache}
        isSeedData={isSeedData}
        lastUpdated={lastUpdated}
        onOpenConfig={() => setConfigModalOpen(true)}
        totalCities={cities.length}
        selectedFilial={filters.filial}
      />

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-4 space-y-4">
        {/* Banner de Instalação PWA (Dispensável) */}
        <PWAInstallButton variant="banner" />

        {/* Banner Informativo quando em Modo Demonstração (Link ainda não configurado) */}
        {isSeedData && !loading && (
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 flex items-start justify-between gap-3 text-amber-900 text-xs shadow-2xs">
            <div className="flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Base demonstrativa ativa:</strong> A constante <code>DATA_URL</code> em <code>src/config.ts</code> ainda está com o link padrão. Para conectar sua planilha oficial do Google Sheets, clique ao lado ou edite o código.
              </div>
            </div>
            <button
              onClick={() => setConfigModalOpen(true)}
              className="shrink-0 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold transition cursor-pointer text-xs"
            >
              Conectar Link
            </button>
          </div>
        )}

        {/* Mensagem de Erro com Ação de Retry */}
        {error && (
          <ErrorAlert
            message={error}
            onRetry={() => loadData(true)}
            isRetrying={isRefreshing}
            onOpenSettings={() => setConfigModalOpen(true)}
          />
        )}

        {/* FILTRO DE FILIAL EM DESTAQUE (BORACÉIA / SÃO PAULO / TODAS) */}
        {!loading && cities.length > 0 && (
          <FilialSelector
            selectedFilial={filters.filial}
            onSelectFilial={handleSelectFilial}
            cities={cities}
          />
        )}

        {/* REGRA OPERACIONAL EM DESTAQUE: DIA DA PRAÇA, FECHAMENTOS E ENTREGAS */}
        {!loading && cities.length > 0 && (
          <OperationalNotice selectedFilial={filters.filial} />
        )}

        {/* ABA: CIDADES (Busca Principal e Filtros) */}
        {activeTab === 'cidades' && (
          <div className="space-y-4">
            {/* Campo de Busca Grande no Topo */}
            <SearchBar
              value={filters.searchQuery}
              onChange={(val) => setFilters((prev) => ({ ...prev, searchQuery: val }))}
              onClear={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
              resultCount={filteredCities.length}
              totalCount={cities.length}
            />

            {/* Barra de Filtros (Chips, Filiais, Dias e Exportação) */}
            <FilterBar
              filters={filters}
              onFilterChange={setFilters}
              onClearFilters={handleClearFilters}
              onExportCSV={handleExportCSV}
              availableRegioes={availableRegioes}
              availablePracas={availablePracas}
              availableFiliais={availableFiliais}
              resultCount={filteredCities.length}
            />

            {/* Banner Rápido: Carregamentos de HOJE */}
            {filters.dia !== 'hoje' && totalLoadingToday > 0 && !filters.searchQuery && (
              <div
                onClick={() => setFilters((prev) => ({ ...prev, dia: 'hoje' }))}
                className="bg-gradient-to-r from-amber-500 to-[#F28C28] text-white p-3 rounded-xl shadow-xs flex items-center justify-between gap-3 cursor-pointer hover:opacity-95 transition"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-white/20 rounded-lg">
                    <Truck className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider block">
                      Carregamento Hoje
                    </span>
                    <span className="text-xs text-white/90">
                      <strong>{totalLoadingToday}</strong> cidades têm saída programada para hoje
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold underline bg-white/10 px-2.5 py-1 rounded-lg">
                  Ver cidades &rarr;
                </span>
              </div>
            )}

            {/* Estado Carregando (Skeleton) */}
            {loading ? (
              <LoadingSkeleton />
            ) : (
              <>
                {/* Se a busca bateu no nome de uma ou mais praças, exibe o card da praça no topo */}
                {matchedPracas.length > 0 && (
                  <div className="space-y-3">
                    {matchedPracas.map((mp) => (
                      <PracaSummaryCard
                        key={mp.pracaName}
                        pracaName={mp.pracaName}
                        cities={mp.cities}
                      />
                    ))}
                  </div>
                )}

                {/* Lista de Cidades Encontradas */}
                {filteredCities.length === 0 ? (
                  <EmptyState
                    searchQuery={filters.searchQuery}
                    hasFilters={Boolean(filters.regiao || filters.praca || filters.filial || filters.dia !== 'todos')}
                    onClearFilters={handleClearFilters}
                  />
                ) : (
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2 px-1">
                      <span>
                        Exibindo <strong>{filteredCities.length}</strong> de {cities.length} cidades
                      </span>
                      {filteredCities.length > 0 && (
                        <span className="text-[11px] text-slate-400">
                          Clique em "Copiar" para enviar no WhatsApp
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {filteredCities.map((city) => (
                        <CityCard key={city.id} city={city} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ABA: PRAÇAS (Visão por Praça e Região com Accordion) */}
        {activeTab === 'pracas' && (
          <div>
            {loading ? (
              <LoadingSkeleton />
            ) : (
              <PracasView
                cities={cities}
                selectedFilial={filters.filial}
                onSelectFilial={handleSelectFilial}
              />
            )}
          </div>
        )}

        {/* ABA: POR DIA (Visão de Segunda a Sábado com Destaque para Hoje) */}
        {activeTab === 'dias' && (
          <div>
            {loading ? (
              <LoadingSkeleton />
            ) : (
              <DaysView
                cities={cities}
                selectedFilial={filters.filial}
                onSelectFilial={handleSelectFilial}
              />
            )}
          </div>
        )}
      </main>

      {/* Modal de Configuração e Instruções da Planilha */}
      <ConfigModal
        isOpen={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
        onApplyAndRefresh={() => loadData(true)}
      />

      {/* Rodapé com Status de Atualização, Cidades e Modo Offline */}
      <Footer
        lastUpdated={lastUpdated}
        totalCities={cities.length}
        isUsingCache={isUsingCache}
        isSeedData={isSeedData}
        onRefresh={() => loadData(true)}
        isRefreshing={isRefreshing}
      />

      {/* Indicador de Status Offline */}
      <OfflineIndicator />
    </div>
  );
}
