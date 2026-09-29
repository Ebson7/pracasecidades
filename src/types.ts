export type FilialType = 'Boracéia' | 'São Paulo' | string;

export type WeekdayKey = 
  | 'segunda' 
  | 'terca' 
  | 'quarta' 
  | 'quinta' 
  | 'sexta' 
  | 'sabado' 
  | 'domingo';

export interface CityRecord {
  id: string;
  Regiao: string;
  Praca: string;
  Cidade: string;
  Filial: string;
  Data_Carregamento: string;
  Observacao: string;
}

export interface DayBadgeInfo {
  name: string;
  key: WeekdayKey | 'outro' | 'definir';
  colorClasses: string;
}

export interface ParsedLoadingDay {
  type: 'weekday' | 'multi_weekday' | 'date' | 'undefined' | 'custom';
  raw: string;
  displayDays: DayBadgeInfo[];
  nextDateFormatted?: string; // e.g. "30/09 (Amanhã)" or "HOJE"
  nextDateObj?: Date;
  daysRemaining?: number;
  isToday?: boolean;
  customText?: string;
}

export interface PracaGroup {
  praca: string;
  regiao: string;
  filiais: string[];
  cities: CityRecord[];
  distinctDays: ParsedLoadingDay[];
}

export interface FilterState {
  searchQuery: string;
  regiao: string;
  praca: string;
  filial: string;
  dia: string; // 'todos' | 'hoje' | WeekdayKey | 'definir'
}

export type ActiveTab = 'cidades' | 'pracas' | 'dias';
