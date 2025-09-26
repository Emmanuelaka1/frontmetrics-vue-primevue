// src/api.ts
export type RawMetric = { name: string; value: any; type?: string };

// TODO: remplace par l'URL de ton service REST
const BASE_URL = import.meta.env.VITE_METRICS_URL || 'http://localhost:8080/api/metrics';

export type MetricsResponse =
  | { typeCarte?: string; metrics?: RawMetric[]; items?: RawMetric[] }
  | RawMetric[];

// Types de cartes disponibles
export const CARD_TYPES = {
  PERFORMANCE_SERVICE: 'PERFORMANCE_SERVICE',
  DELETE_SERVICE: 'DELETE_SERVICE',
  DEFAULT: 'DEFAULT'
} as const;

export type CardType = keyof typeof CARD_TYPES;

// Récupérer les métriques pour un type de carte spécifique
export async function fetchMetricsByType(typeCarte: CardType): Promise<{ typeCarte: string; metrics: RawMetric[] }> {
  const url = `${BASE_URL}/${typeCarte}`;
  const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} - Erreur lors du chargement des métriques ${typeCarte}`);
  const data: MetricsResponse = await res.json();

  if (Array.isArray(data)) {
    return { typeCarte, metrics: data };
  }
  const arr = data.metrics ?? data.items;
  const responseTypeCarte = (data.typeCarte ?? typeCarte) as string;
  if (Array.isArray(arr)) return { typeCarte: responseTypeCarte, metrics: arr };

  const firstArray = Object.values(data).find(v => Array.isArray(v)) as RawMetric[] | undefined;
  return { typeCarte: responseTypeCarte, metrics: firstArray ?? [] };
}

// Récupérer toutes les métriques disponibles
export async function fetchAllMetrics(): Promise<{ typeCarte: string; metrics: RawMetric[] }[]> {
  const promises = Object.values(CARD_TYPES).map(type => 
    fetchMetricsByType(type as CardType).catch(error => {
      console.warn(`Erreur pour ${type}:`, error);
      return null;
    })
  );
  
  const results = await Promise.all(promises);
  return results.filter((result): result is { typeCarte: string; metrics: RawMetric[] } => result !== null);
}

// Fonction de compatibilité avec l'ancienne API
export async function fetchMetrics(): Promise<{ typeCarte: string; metrics: RawMetric[] }> {
  try {
    return await fetchMetricsByType('PERFORMANCE_SERVICE');
  } catch (error) {
    // Fallback vers l'ancien endpoint si le nouveau n'existe pas
    const res = await fetch(BASE_URL.replace('/api/metrics', '/metrics'), { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: MetricsResponse = await res.json();

    if (Array.isArray(data)) {
      return { typeCarte: 'DEFAULT', metrics: data };
    }
    const arr = data.metrics ?? data.items;
    const typeCarte = (data.typeCarte ?? 'DEFAULT') as string;
    if (Array.isArray(arr)) return { typeCarte, metrics: arr };

    const firstArray = Object.values(data).find(v => Array.isArray(v)) as RawMetric[] | undefined;
    return { typeCarte, metrics: firstArray ?? [] };
  }
}
