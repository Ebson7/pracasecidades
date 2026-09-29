import { DayBadgeInfo, ParsedLoadingDay, WeekdayKey } from '../types';
import { normalizeText } from './normalize';

// Mapeamento de cores obrigatórias para os dias da semana
export const WEEKDAY_COLORS: Record<WeekdayKey, string> = {
  segunda: 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950/60 dark:text-blue-200 dark:border-blue-800',
  terca: 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/60 dark:text-purple-200 dark:border-purple-800',
  quarta: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-800',
  quinta: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-800',
  sexta: 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-800',
  sabado: 'bg-slate-700 text-white border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700',
  domingo: 'bg-zinc-200 text-zinc-800 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700',
};

export const WEEKDAY_LABELS: Record<WeekdayKey, string> = {
  segunda: 'Segunda-feira',
  terca: 'Terça-feira',
  quarta: 'Quarta-feira',
  quinta: 'Quinta-feira',
  sexta: 'Sexta-feira',
  sabado: 'Sábado',
  domingo: 'Domingo',
};

// Dia da semana JS: 0=Domingo, 1=Segunda, 2=Terça, 3=Quarta, 4=Quinta, 5=Sexta, 6=Sábado
export const WEEKDAY_TO_JS_DAY: Record<WeekdayKey, number> = {
  domingo: 0,
  segunda: 1,
  terca: 2,
  quarta: 3,
  quinta: 4,
  sexta: 5,
  sabado: 6,
};

const JS_DAY_TO_WEEKDAY: Record<number, WeekdayKey> = {
  0: 'domingo',
  1: 'segunda',
  2: 'terca',
  3: 'quarta',
  4: 'quinta',
  5: 'sexta',
  6: 'sabado',
};

/**
 * Converte qualquer variação de texto para uma chave de dia da semana válida
 */
export function identifyWeekday(text: string): WeekdayKey | null {
  const norm = normalizeText(text);

  if (/^(seg|segunda|segunda-feira|segunda feira|2a|2ª|segundona)/.test(norm)) return 'segunda';
  if (/^(ter|terca|terça|terca-feira|terça-feira|terca feira|3a|3ª)/.test(norm)) return 'terca';
  if (/^(qua|quarta|quarta-feira|quarta feira|4a|4ª)/.test(norm)) return 'quarta';
  if (/^(qui|quinta|quinta-feira|quinta feira|5a|5ª)/.test(norm)) return 'quinta';
  if (/^(sex|sexta|sexta-feira|sexta feira|6a|6ª|sextou)/.test(norm)) return 'sexta';
  if (/^(sab|sabado|sábado|sabado-feira|sabado feira)/.test(norm)) return 'sabado';
  if (/^(dom|domingo)/.test(norm)) return 'domingo';

  return null;
}

/**
 * Calcula a próxima ocorrência da data para um determinado dia da semana.
 * Se hoje for o dia especificado, retorna a data de hoje com diasRestantes = 0.
 */
export function getNextDateForWeekday(targetJsDay: number, referenceDate: Date = new Date()): { date: Date; daysRemaining: number } {
  const currentDay = referenceDate.getDay();
  let daysUntil = (targetJsDay - currentDay + 7) % 7;
  
  // Se for hoje (daysUntil === 0), é hoje mesmo!
  const targetDate = new Date(referenceDate);
  targetDate.setDate(referenceDate.getDate() + daysUntil);
  targetDate.setHours(0, 0, 0, 0);

  return { date: targetDate, daysRemaining: daysUntil };
}

/**
 * Formata data no formato DD/MM
 */
export function formatDateDDMM(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
}

/**
 * Formata data no formato DD/MM/AAAA
 */
export function formatDateFull(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Interpreta uma data específica no formato DD/MM/AAAA ou DD/MM
 */
function tryParseSpecificDate(text: string, referenceDate: Date = new Date()): { date: Date; daysRemaining: number } | null {
  const trimmed = text.trim();
  // Regex para DD/MM/AAAA ou DD/MM
  const match = trimmed.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/);
  if (!match) return null;

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10) - 1;
  const currentYear = referenceDate.getFullYear();
  let year = match[3] ? parseInt(match[3], 10) : currentYear;
  if (year < 100) year += 2000;

  const targetDate = new Date(year, month, day);
  if (isNaN(targetDate.getTime())) return null;

  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  const daysRemaining = Math.round(diffTime / (1000 * 60 * 60 * 24));

  return { date: targetDate, daysRemaining };
}

/**
 * Analisa e processa o valor livre da coluna Data_Carregamento
 */
export function parseLoadingDay(rawText: string | null | undefined, referenceDate: Date = new Date()): ParsedLoadingDay {
  const raw = (rawText || '').trim();

  // 1. Vazio ou nulo -> A definir
  if (!raw || raw.toLowerCase() === 'a definir' || raw.toLowerCase() === 'indefinido') {
    return {
      type: 'undefined',
      raw: raw || 'A definir',
      displayDays: [
        {
          name: 'A definir',
          key: 'definir',
          colorClasses: 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
        },
      ],
      customText: 'A definir',
    };
  }

  // 2. Tenta verificar se é uma data específica (DD/MM/AAAA ou DD/MM)
  const specificDate = tryParseSpecificDate(raw, referenceDate);
  if (specificDate) {
    const formatted = formatDateDDMM(specificDate.date);
    const fullFormatted = formatDateFull(specificDate.date);
    const { daysRemaining } = specificDate;

    let relativeLabel = '';
    let isToday = false;

    if (daysRemaining === 0) {
      relativeLabel = 'HOJE';
      isToday = true;
    } else if (daysRemaining === 1) {
      relativeLabel = 'Amanhã';
    } else if (daysRemaining > 1) {
      relativeLabel = `em ${daysRemaining} dias`;
    } else if (daysRemaining === -1) {
      relativeLabel = 'Ontem';
    } else {
      relativeLabel = `passou há ${Math.abs(daysRemaining)} dias`;
    }

    return {
      type: 'date',
      raw,
      displayDays: [
        {
          name: formatted,
          key: 'outro',
          colorClasses: 'bg-teal-100 text-teal-900 border-teal-300 dark:bg-teal-950/60 dark:text-teal-200 dark:border-teal-800',
        },
      ],
      nextDateFormatted: `${formatted} (${relativeLabel})`,
      nextDateObj: specificDate.date,
      daysRemaining,
      isToday,
      customText: fullFormatted,
    };
  }

  // 3. Testa se contém múltiplos dias separados por "/", "e", ",", "+"
  // Ex: "Segunda-feira / Quinta-feira", "Terça e Sexta"
  const tokens = raw
    .split(/[\/,+&]|(?:\s+e\s+)/i)
    .map((t) => t.trim())
    .filter(Boolean);

  const matchedWeekdays: WeekdayKey[] = [];
  for (const token of tokens) {
    const key = identifyWeekday(token);
    if (key && !matchedWeekdays.includes(key)) {
      matchedWeekdays.push(key);
    }
  }

  if (matchedWeekdays.length > 0) {
    // Calculamos a próxima data entre os dias encontrados
    let earliestDaysRemaining = 999;
    let earliestDate: Date = referenceDate;
    let closestWeekdayKey: WeekdayKey = matchedWeekdays[0];

    for (const dayKey of matchedWeekdays) {
      const jsDay = WEEKDAY_TO_JS_DAY[dayKey];
      const { date, daysRemaining } = getNextDateForWeekday(jsDay, referenceDate);
      if (daysRemaining < earliestDaysRemaining) {
        earliestDaysRemaining = daysRemaining;
        earliestDate = date;
        closestWeekdayKey = dayKey;
      }
    }

    const isToday = earliestDaysRemaining === 0;
    let nextFormatted = '';
    if (isToday) {
      nextFormatted = `HOJE (${WEEKDAY_LABELS[closestWeekdayKey].split('-')[0]})`;
    } else if (earliestDaysRemaining === 1) {
      nextFormatted = `${formatDateDDMM(earliestDate)} (Amanhã • ${WEEKDAY_LABELS[closestWeekdayKey].split('-')[0]})`;
    } else {
      nextFormatted = `${formatDateDDMM(earliestDate)} (${WEEKDAY_LABELS[closestWeekdayKey].split('-')[0]})`;
    }

    const displayDays: DayBadgeInfo[] = matchedWeekdays.map((key) => ({
      name: WEEKDAY_LABELS[key],
      key,
      colorClasses: WEEKDAY_COLORS[key],
    }));

    return {
      type: matchedWeekdays.length > 1 ? 'multi_weekday' : 'weekday',
      raw,
      displayDays,
      nextDateFormatted: nextFormatted,
      nextDateObj: earliestDate,
      daysRemaining: earliestDaysRemaining,
      isToday,
    };
  }

  // 4. Qualquer outro texto livre (ex.: "Suspenso até 10/10", "A combinar", "Apenas quinzenal")
  return {
    type: 'custom',
    raw,
    displayDays: [
      {
        name: raw,
        key: 'outro',
        colorClasses: 'bg-indigo-50 text-indigo-900 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-200 dark:border-indigo-800',
      },
    ],
    customText: raw,
  };
}

/**
 * Retorna a chave do dia de hoje para comparações
 */
export function getTodayWeekdayKey(refDate: Date = new Date()): WeekdayKey {
  return JS_DAY_TO_WEEKDAY[refDate.getDay()];
}
