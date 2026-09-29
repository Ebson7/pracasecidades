/**
 * Normaliza uma string removendo acentos, convertendo para minúsculas e eliminando espaços sobressalentes.
 * Exemplo: "São José dos Campos" -> "sao jose dos campos"
 */
export function normalizeText(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Verifica se o termo de busca está contido no texto alvo, ignorando acentos e maiúsculas.
 * Também suporta busca por múltiplos termos (ex: "sao jose centro" encontra cidades que tenham essas palavras).
 */
export function matchesQuery(target: string | null | undefined, query: string): boolean {
  if (!query) return true;
  if (!target) return false;

  const normalizedTarget = normalizeText(target);
  const normalizedQuery = normalizeText(query);

  if (normalizedTarget.includes(normalizedQuery)) {
    return true;
  }

  // Verifica se todas as palavras da consulta estão no alvo
  const queryWords = normalizedQuery.split(/\s+/).filter(Boolean);
  if (queryWords.length > 1) {
    return queryWords.every((word) => normalizedTarget.includes(word));
  }

  return false;
}

/**
 * Formata o nome da praça garantindo que a palavra "Praça" não apareça duplicada.
 * Se o texto original já contiver "Praça", "Praça de ...", ou repetições,
 * limpa e exibe com apenas uma ocorrência elegante de "Praça".
 * Exemplo: "Praça de Andradina" -> "Praça de Andradina"
 *          "Praça Praça de Araçatuba" -> "Praça de Araçatuba"
 *          "Birigui" -> "Praça Birigui"
 */
export function formatPracaName(name: string | null | undefined): string {
  if (!name) return 'Praça';
  const trimmed = name.trim();
  const cleaned = trimmed.replace(/^(pra[cç]a\s*)+/i, '').trim();
  if (!cleaned) return 'Praça';
  return `Praça ${cleaned}`;
}
