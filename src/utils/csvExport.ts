import { CityRecord } from '../types';

/**
 * Exporta a lista de cidades filtradas para um arquivo CSV formatado com BOM UTF-8
 */
export function exportToCSV(records: CityRecord[], filename: string = 'marsil_consulta_pracas.csv'): void {
  if (!records || records.length === 0) {
    alert('Nenhum dado selecionado para exportação.');
    return;
  }

  // Cabeçalho exatamente nas especificações do sistema
  const headers = ['Regiao', 'Praca', 'Cidade', 'Filial', 'Data_Carregamento', 'Observacao'];

  const rows = records.map((record) => {
    return [
      escapeCSVValue(record.Regiao),
      escapeCSVValue(record.Praca),
      escapeCSVValue(record.Cidade),
      escapeCSVValue(record.Filial),
      escapeCSVValue(record.Data_Carregamento),
      escapeCSVValue(record.Observacao),
    ].join(';');
  });

  // BOM UTF-8 (\uFEFF) para garantir abertura correta no Excel sem desconfigurar acentos
  const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCSVValue(val: string | null | undefined): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).trim();
  if (str.includes(';') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}
