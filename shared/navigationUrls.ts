export type NavigationValue = string | number | null | undefined;

/** Construit une URL interne stable en ignorant les paramètres absents. */
export function buildNavigationUrl(path: string, params: Record<string, NavigationValue> = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined && value !== "") search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `${path}?${query}` : path;
}

/** Lit un paramètre d’URL uniquement s’il appartient à l’ensemble autorisé. */
export function readAllowedNavigationValue<T extends string>(search: string, key: string, allowed: readonly T[], fallback: T): T {
  const value = new URLSearchParams(search).get(key);
  return value && (allowed as readonly string[]).includes(value) ? value as T : fallback;
}

/** Lit un indice non négatif, avec une valeur de repli déterministe. */
export function readNavigationIndex(search: string, key: string, fallback = 0) {
  const value = Number(new URLSearchParams(search).get(key));
  return Number.isInteger(value) && value >= 0 ? value : fallback;
}
