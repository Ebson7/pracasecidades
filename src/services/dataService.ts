import Papa from 'papaparse';
import { DATA_URL } from '../config';
import { SEED_CITIES_DATA } from '../data/seedData';
import { CityRecord } from '../types';

const STORAGE_KEY_DATA = 'marsil_cached_cities_v1';
const STORAGE_KEY_TIMESTAMP = 'marsil_cache_timestamp_v1';
const STORAGE_KEY_CUSTOM_URL = 'marsil_custom_sheet_url_v1';

export interface DataFetchResult {
  data: CityRecord[];
  lastUpdated: Date | null;
  isUsingCache: boolean;
  isSeedData: boolean;
  error?: string;
  sourceUrl: string;
}

/**
 * Retorna a URL efetiva para carregamento (prioriza URL personalizada salva pelo usuário se houver)
 */
export function getEffectiveDataUrl(): string {
  try {
    const custom = localStorage.getItem(STORAGE_KEY_CUSTOM_URL);
    if (custom && custom.trim().startsWith('http')) {
      return custom.trim();
    }
  } catch (e) {
    console.error('Erro ao ler custom url do storage', e);
  }
  return DATA_URL;
}

/**
 * Salva uma nova URL personalizada ou remove se vazia
 */
export function setCustomDataUrl(url: string | null): void {
  try {
    if (!url || !url.trim()) {
      localStorage.removeItem(STORAGE_KEY_CUSTOM_URL);
    } else {
      localStorage.setItem(STORAGE_KEY_CUSTOM_URL, url.trim());
    }
  } catch (e) {
    console.error('Erro ao salvar custom url', e);
  }
}

/**
 * Normaliza o cabeçalho do CSV para os nomes de campos esperados
 */
function normalizeRowData(row: Record<string, any>, index: number): CityRecord | null {
  // Procura chaves mesmo com variações de acentuação ou caixa
  const keys = Object.keys(row);
  
  const findValue = (possibleNames: string[]): string => {
    for (const name of possibleNames) {
      const match = keys.find(k => k.trim().toLowerCase() === name.toLowerCase());
      if (match && row[match] !== undefined && row[match] !== null) {
        return String(row[match]).trim();
      }
    }
    return '';
  };

  const cidade = findValue(['Cidade', 'Municipio', 'Município', 'Cidade / Município']);
  // Regra técnica: "ignorar linhas sem Cidade"
  if (!cidade) {
    return null;
  }

  const regiao = findValue(['Regiao', 'Região', 'Regiao/Rota', 'Região/Rota']);
  const praca = findValue(['Praca', 'Praça', 'Praca/Rota']);
  const filial = findValue(['Filial', 'Unidade', 'CD', 'Centro de Distribuição']);
  const dataCarregamento = findValue(['Data_Carregamento', 'Data Carregamento', 'Carregamento', 'Dia_Carregamento', 'Dia de Carregamento', 'Dia']);
  const observacao = findValue(['Observacao', 'Observação', 'Obs', 'Obs.', 'Observações', 'Observacoes']);

  return {
    id: `city-${index}-${cidade}-${praca}`.replace(/\s+/g, '-'),
    Cidade: cidade,
    Regiao: regiao || 'Geral',
    Praca: praca || cidade,
    Filial: filial || 'Boracéia',
    Data_Carregamento: dataCarregamento,
    Observacao: observacao,
  };
}

/**
 * Carrega os dados da fonte configurada, com fallback inteligente para localStorage e base semente
 */
export async function fetchCitiesData(forceRefresh: boolean = false): Promise<DataFetchResult> {
  const currentUrl = getEffectiveDataUrl();
  const isPlaceholderUrl = !currentUrl || currentUrl.includes('COLE_AQUI_O_LINK_CSV_DO_GOOGLE_SHEETS');

  // Se não foi forçado o refresh, verifica primeiro o cache do localStorage
  if (!forceRefresh) {
    try {
      const cachedRaw = localStorage.getItem(STORAGE_KEY_DATA);
      const cachedTime = localStorage.getItem(STORAGE_KEY_TIMESTAMP);
      if (cachedRaw && cachedTime) {
        const parsed = JSON.parse(cachedRaw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return {
            data: parsed,
            lastUpdated: new Date(cachedTime),
            isUsingCache: true,
            isSeedData: false,
            sourceUrl: currentUrl,
          };
        }
      }
    } catch (e) {
      console.warn('Erro ao restaurar cache do localStorage:', e);
    }
  }

  // Se a URL ainda for o placeholder inicial e não tivermos cache, usa a base de semente ilustrativa
  if (isPlaceholderUrl) {
    return {
      data: SEED_CITIES_DATA,
      lastUpdated: new Date(),
      isUsingCache: false,
      isSeedData: true,
      sourceUrl: currentUrl,
    };
  }

  // Prepara a URL com cache buster para garantir dados em tempo real quando solicitado
  let requestUrl = currentUrl;
  const separator = requestUrl.includes('?') ? '&' : '?';
  requestUrl += `${separator}t=${Date.now()}`;

  try {
    const response = await fetch(requestUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/csv, text/plain, */*',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Erro na conexão com a planilha (${response.status}: ${response.statusText})`);
    }

    const csvText = await response.text();
    if (!csvText || !csvText.trim()) {
      throw new Error('A planilha retornou um conteúdo vazio.');
    }

    // Processa com PapaParse
    const parseResult = Papa.parse<Record<string, string>>(csvText, {
      header: true,
      skipEmptyLines: true,
      transform: (value) => value.trim(),
    });

    if (parseResult.errors && parseResult.errors.length > 0 && (!parseResult.data || parseResult.data.length === 0)) {
      throw new Error(`Erro ao interpretar o CSV: ${parseResult.errors[0].message}`);
    }

    const validRecords: CityRecord[] = [];
    parseResult.data.forEach((row, idx) => {
      const normalized = normalizeRowData(row, idx);
      if (normalized) {
        validRecords.push(normalized);
      }
    });

    if (validRecords.length === 0) {
      throw new Error('Nenhuma cidade válida foi encontrada no CSV fornecido.');
    }

    // Salva no localStorage com data da sincronização
    const now = new Date();
    try {
      localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(validRecords));
      localStorage.setItem(STORAGE_KEY_TIMESTAMP, now.toISOString());
    } catch (storageError) {
      console.warn('Não foi possível salvar cache no localStorage:', storageError);
    }

    return {
      data: validRecords,
      lastUpdated: now,
      isUsingCache: false,
      isSeedData: false,
      sourceUrl: currentUrl,
    };
  } catch (error: any) {
    console.error('Falha ao buscar CSV remoto:', error);

    // Tenta fallback para cache local em caso de erro na rede
    try {
      const cachedRaw = localStorage.getItem(STORAGE_KEY_DATA);
      const cachedTime = localStorage.getItem(STORAGE_KEY_TIMESTAMP);
      if (cachedRaw && cachedTime) {
        const parsed = JSON.parse(cachedRaw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return {
            data: parsed,
            lastUpdated: new Date(cachedTime),
            isUsingCache: true,
            isSeedData: false,
            error: error?.message || 'Falha na conexão com a planilha. Exibindo dados locais em cache.',
            sourceUrl: currentUrl,
          };
        }
      }
    } catch (e) {
      // Ignora erro do localStorage
    }

    // Se nem o cache existe, recorre à base SEED para que o RCA consiga utilizar o app
    return {
      data: SEED_CITIES_DATA,
      lastUpdated: new Date(),
      isUsingCache: false,
      isSeedData: true,
      error: `Não foi possível carregar a planilha online: ${error?.message || 'Erro desconhecido'}. Exibindo dados de contingência.`,
      sourceUrl: currentUrl,
    };
  }
}
