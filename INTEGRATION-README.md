# FrontMetrics - Intégration des Services de Métriques

## Aperçu

Cette application Vue.js avec PrimeVue intègre les services de métriques pour afficher les données de performance des différents services.

## Services Intégrés

### 1. Service de Performance (`PERFORMANCE_SERVICE`)
- **Endpoint**: `GET http://localhost:8080/api/metrics/PERFORMANCE_SERVICE`
- **Métriques**: FastOperation (Number, Average, Max, Min)
- **Description**: Métriques de performance pour les opérations rapides

### 2. Service de Suppression (`DELETE_SERVICE`)
- **Endpoint**: `GET http://localhost:8080/api/metrics/DELETE_SERVICE`
- **Métriques**: Delete et Delete_ERROR (Number, Average, Max, Min)
- **Description**: Métriques pour les opérations de suppression et leurs erreurs

## Fonctionnalités

### Navigation par Onglets
- **Par service**: Sélection dynamique du type de service avec dropdown
- **Vue d'ensemble**: Affichage simultané de tous les services

### Composants

#### MetricsSelector
- Dropdown pour sélectionner le type de service
- Bouton de rafraîchissement
- Émission d'événements pour le changement de type

#### MetricsGrid
- Affichage groupé par type de métrique
- Gestion des états de chargement et d'erreur
- Support du nouveau système de sélection

#### MetricsOverview
- Vue d'ensemble de tous les services
- Cartes organisées par service
- Badges indiquant le nombre de métriques

#### MetricCard
- Affichage formaté des valeurs numériques
- Icônes contextuelles selon le type
- Tags colorés selon la sévérité
- Support des tailles (normale/petite)

## Configuration

### Variables d'Environnement
```bash
# URL de base pour l'API
VITE_METRICS_URL=http://localhost:8080/api/metrics

# Mode développement
VITE_DEV_MODE=true

# Intervalle de rafraîchissement
VITE_REFRESH_INTERVAL=30000
```

### Structure des Données

#### Format des Réponses API
```typescript
{
  "typeCarte": "PERFORMANCE_SERVICE",
  "metrics": [
    {
      "name": "Number",
      "value": 426,
      "type": "FastOperation"
    },
    {
      "name": "Average", 
      "value": 0.13615,
      "type": "FastOperation"
    }
  ]
}
```

#### Types TypeScript
```typescript
type RawMetric = { 
  name: string; 
  value: any; 
  type?: string 
};

type CardType = 'PERFORMANCE_SERVICE' | 'DELETE_SERVICE' | 'DEFAULT';
```

## API Functions

### `fetchMetricsByType(type: CardType)`
Récupère les métriques pour un type de service spécifique.

### `fetchAllMetrics()`
Récupère toutes les métriques de tous les services disponibles.

### `fetchMetrics()` (Rétrocompatibilité)
Fonction de compatibilité avec l'ancienne API.

## Utilisation

### Démarrage
```bash
npm install
npm run dev
```

### Build Production
```bash
npm run build
npm run preview
```

## Gestion des Erreurs

- **Timeout de connexion**: Messages d'erreur explicites
- **Services indisponibles**: Affichage conditionnel des services
- **Données manquantes**: Messages informatifs
- **Erreurs réseau**: Retry automatique avec gestion d'état

## Personnalisation

### Ajout d'un Nouveau Service

1. **Mettre à jour les constantes** dans `src/api.ts`:
```typescript
export const CARD_TYPES = {
  PERFORMANCE_SERVICE: 'PERFORMANCE_SERVICE',
  DELETE_SERVICE: 'DELETE_SERVICE',
  NEW_SERVICE: 'NEW_SERVICE', // Nouveau
  DEFAULT: 'DEFAULT'
} as const;
```

2. **Ajouter l'option** dans `MetricsSelector.vue`:
```typescript
const cardTypeOptions = [
  // ... autres options
  { label: 'Nouveau Service', value: 'NEW_SERVICE' }
];
```

3. **Endpoint Backend**: Assurer que `GET /api/metrics/NEW_SERVICE` retourne le format attendu.

## Technologies Utilisées

- **Vue 3** (Composition API)
- **TypeScript** 
- **PrimeVue 4** (UI Components)
- **Vite** (Build Tool)
- **Axios** (HTTP Client)

## Notes de Développement

- Les métriques sont groupées par `type` pour un affichage organisé
- Support de la rétrocompatibilité avec l'ancienne API
- Formatage intelligent des nombres (séparateurs de milliers, décimales)
- Icônes contextuelles selon le type de métrique
- Responsive design avec PrimeFlex

## Prochaines Étapes

1. Ajouter la mise à jour automatique périodique
2. Implémenter la persistance des préférences utilisateur
3. Ajouter des graphiques avec Chart.js
4. Intégrer des alertes en temps réel
5. Optimiser les performances avec la mise en cache