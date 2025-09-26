# TreeTable avec Badges - Guide Complet

## Vue d'ensemble

L'application intègre maintenant plusieurs composants TreeTable de PrimeVue avec des badges pour afficher les métriques de manière hiérarchique et organisée.

## Composants TreeTable

### 1. MetricsTreeTable.vue - Vue Arborescente Simple
**Fonctionnalités :**
- Structure hiérarchique : Service → Type → Métrique
- Badges pour compter les éléments
- Tags colorés selon la sévérité
- Boutons d'actions contextuels
- Expand/Collapse global

**Structure des données :**
```
SERVICE_PERFORMANCE
├── FastOperation (4 métriques)
│   ├── Number: 426
│   ├── Average: 0.136
│   ├── Max: 4
│   └── Min: 0
└── DELETE_SERVICE
    ├── Delete (4 métriques)
    │   ├── Number: 572
    │   ├── Average: 40.96
    │   ├── Max: 80
    │   └── Min: 16
    └── Delete_ERROR (4 métriques)
        ├── Number: 561
        ├── Average: 40.27
        ├── Max: 70
        └── Min: 15
```

### 2. FileExplorer.vue - Explorateur de Fichiers
**Fonctionnalités :**
- Structure de fichiers simulée (Applications, Cloud, Desktop)
- Badges pour le nombre d'éléments dans les dossiers
- Tags pour les types (Folder, Application, File)
- Icônes contextuelles
- Couleurs selon la taille des fichiers

### 3. AdvancedTreeTable.vue - TreeTable Avancée avec Filtres
**Fonctionnalités avancées :**
- **Filtrage** : MultiSelect pour services et types
- **Recherche globale** : InputText avec filtre temps réel
- **Export CSV** : Téléchargement des données filtrées
- **Badges multiples** : Statut, sévérité, compteurs
- **Toolbar** : Barre d'outils complète avec actions
- **Responsive** : Adaptation mobile et desktop

## Types de Badges Utilisés

### Badges de Comptage
```vue
<Badge 
  :value="node.data.count" 
  :severity="node.data.severity"
  size="small"
/>
```
- **Couleurs** : info (bleu), success (vert), warning (orange), danger (rouge)
- **Usage** : Nombre de métriques par service/type

### Tags de Classification
```vue
<Tag 
  :value="node.data.type"
  :severity="getBadgeSeverity(node.data.type)"
  size="small"
/>
```
- **Types** : SERVICE, GROUP, ERROR, DELETE, PERFORMANCE
- **Couleurs dynamiques** selon le contenu

### Badges de Statut
```vue
<Badge 
  :value="node.data.value > 100 ? 'OK' : 'LOW'"
  :severity="node.data.value > 100 ? 'success' : 'warning'"
  size="small"
/>
```
- **États** : OK, LOW, HIGH, FULL, ERROR
- **Logique conditionnelle** basée sur les valeurs

## Fonctions de Coloration

### Sévérité par Type
```typescript
const getBadgeSeverity = (type?: string) => {
  const typeStr = type?.toLowerCase() || ''
  
  if (typeStr.includes('error')) return 'danger'    // Rouge
  if (typeStr.includes('delete')) return 'warning'  // Orange
  if (typeStr.includes('fast')) return 'success'    // Vert
  return 'info'                                     // Bleu
}
```

### Sévérité par Service
```typescript
const getServiceSeverity = (service: string) => {
  if (service.includes('PERFORMANCE')) return 'success'  // Vert
  if (service.includes('DELETE')) return 'warning'       // Orange
  return 'info'                                          // Bleu par défaut
}
```

## Fonctionnalités Interactives

### Filtrage Avancé
- **Services** : MultiSelect pour choisir les services affichés
- **Types** : MultiSelect pour filtrer par type de métrique
- **Recherche** : InputText pour recherche textuelle globale
- **Bouton Clear** : Réinitialisation de tous les filtres

### Actions Contextuelles
```vue
<!-- Actions selon le niveau -->
<Button v-if="node.data.level === 'metric'" icon="pi pi-eye" />      <!-- Détails métrique -->
<Button v-if="node.data.level === 'service'" icon="pi pi-cog" />     <!-- Config service -->
<Button v-if="node.data.level === 'type'" icon="pi pi-chart-bar" />  <!-- Graphique type -->
```

### Export de Données
```typescript
const exportData = () => {
  const data = flattenTreeData(filteredTreeData.value)
  const csv = convertToCSV(data)
  downloadCSV(csv, 'metrics-export.csv')
}
```
- **Format CSV** avec colonnes : niveau, service, nom, valeur, type, catégorie
- **Données filtrées** : seules les données visibles sont exportées

## Styling et Personnalisation

### Styles CSS Personnalisés
```css
:deep(.p-treetable .p-treetable-thead > tr > th) {
  background: linear-gradient(135deg, var(--surface-100), var(--surface-200));
  border-color: var(--surface-300);
  font-weight: 600;
}

:deep(.p-treetable .p-treetable-tbody > tr:hover) {
  background: var(--surface-50);
  transform: translateY(-1px);
  transition: all 0.2s ease;
}
```

### Tailles des Badges
```css
:deep(.p-badge) {
  font-size: 0.65rem;
  min-width: 1.4rem;
  font-weight: 600;
}

:deep(.p-tag) {
  font-size: 0.7rem;
  font-weight: 500;
}
```

## Navigation par Onglets

L'application propose 5 vues différentes :

1. **Par service** - Vue classique avec sélecteur
2. **Vue d'ensemble** - Toutes les métriques dans des cartes
3. **Tree Simple** - TreeTable basique avec badges
4. **Explorateur** - Structure de fichiers avec badges
5. **Tree Avancée** - TreeTable avec filtres et export

## API et Types TypeScript

### Interface TreeNode
```typescript
interface TreeNode {
  key: string
  data: {
    name: string
    value?: number | string
    type?: string
    count?: number
    serviceName?: string
    level: 'service' | 'type' | 'metric'
    severity?: 'success' | 'info' | 'warning' | 'danger'
  }
  children?: TreeNode[]
}
```

### Fonctions de Construction
- `buildTreeStructure()` - Construit l'arbre depuis les données API
- `expandAllNodes()` - Étend tous les nœuds récursivement
- `flattenTreeData()` - Aplatit l'arbre pour l'export

## Utilisation

### Démarrage
```bash
cd frontmetrics-vue-primevue
npm run dev
```

### Navigation
- Cliquez sur les onglets pour changer de vue
- Utilisez les boutons "+/-" pour étendre/réduire
- Appliquez des filtres dans la vue avancée
- Exportez les données avec le bouton "Export CSV"

## Améliorations Possibles

1. **Tri par colonnes** - Ajouter le tri sur chaque colonne
2. **Sélection multiple** - Checkbox pour sélection de nœuds  
3. **Édition inline** - Modification des valeurs directement
4. **Graphiques intégrés** - Mini-charts dans les cellules
5. **Thèmes** - Basculement clair/sombre
6. **Lazy loading** - Chargement à la demande pour gros volumes
7. **Drag & Drop** - Réorganisation des nœuds
8. **Historique** - Comparaison avec les valeurs précédentes

Cette implémentation offre une base solide pour l'affichage hiérarchique de métriques avec une excellente expérience utilisateur grâce aux badges, filtres et actions contextuelles.