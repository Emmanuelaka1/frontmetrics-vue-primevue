<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import TreeTable from 'primevue/treetable'
import Column from 'primevue/column'
import Badge from 'primevue/badge'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import Skeleton from 'primevue/skeleton'
import Message from 'primevue/message'
import { fetchAllMetrics, type RawMetric } from '../api'

interface TreeNode {
  key: string
  data: {
    name: string
    value?: number | string
    type?: string
    count?: number
    serviceName?: string
    isService?: boolean
    isMetricType?: boolean
    isMetric?: boolean
  }
  children?: TreeNode[]
}

const loading = ref(true)
const error = ref<string | null>(null)
const expandedKeys = ref<Record<string, boolean>>({})
const treeData = ref<TreeNode[]>([])

const loadMetricsTree = async () => {
  loading.value = true
  error.value = null
  
  try {
    const allMetrics = await fetchAllMetrics()
    treeData.value = buildTreeStructure(allMetrics)
    
    // Expand all nodes by default
    const keys: Record<string, boolean> = {}
    expandAllNodes(treeData.value, keys)
    expandedKeys.value = keys
    
  } catch (e: any) {
    error.value = e?.message ?? 'Erreur lors du chargement des métriques'
    console.error('Erreur TreeTable:', e)
  } finally {
    loading.value = false
  }
}

const buildTreeStructure = (services: { typeCarte: string; metrics: RawMetric[] }[]): TreeNode[] => {
  return services.map(service => {
    // Grouper les métriques par type
    const metricsByType: Record<string, RawMetric[]> = {}
    
    service.metrics.forEach(metric => {
      const type = metric.type || 'Autres'
      if (!metricsByType[type]) {
        metricsByType[type] = []
      }
      metricsByType[type].push(metric)
    })

    // Créer les nœuds enfants pour chaque type
    const typeNodes: TreeNode[] = Object.entries(metricsByType).map(([type, metrics]) => ({
      key: `${service.typeCarte}-${type}`,
      data: {
        name: type,
        count: metrics.length,
        serviceName: service.typeCarte,
        isMetricType: true
      },
      children: metrics.map((metric, index) => ({
        key: `${service.typeCarte}-${type}-${index}`,
        data: {
          name: metric.name,
          value: metric.value,
          type: metric.type,
          serviceName: service.typeCarte,
          isMetric: true
        }
      }))
    }))

    return {
      key: service.typeCarte,
      data: {
        name: service.typeCarte.replace('_', ' '),
        count: service.metrics.length,
        serviceName: service.typeCarte,
        isService: true
      },
      children: typeNodes
    }
  })
}

const expandAllNodes = (nodes: TreeNode[], keys: Record<string, boolean>) => {
  nodes.forEach(node => {
    keys[node.key] = true
    if (node.children) {
      expandAllNodes(node.children, keys)
    }
  })
}

const formatValue = (value: any): string => {
  if (typeof value === 'number') {
    if (value >= 1000) {
      return value.toLocaleString('fr-FR')
    }
    if (value < 1 && value > 0) {
      return value.toFixed(3)
    }
    if (value % 1 !== 0) {
      return value.toFixed(2)
    }
  }
  return String(value)
}

const getBadgeSeverity = (type?: string) => {
  const typeStr = type?.toLowerCase() || ''
  
  if (typeStr.includes('error')) return 'danger'
  if (typeStr.includes('delete')) return 'warning'
  if (typeStr.includes('fast') || typeStr.includes('performance')) return 'success'
  return 'info'
}

const getServiceBadgeSeverity = (serviceName: string) => {
  if (serviceName.includes('PERFORMANCE')) return 'success'
  if (serviceName.includes('DELETE')) return 'warning'
  return 'info'
}

const refresh = () => {
  loadMetricsTree()
}

const toggleAll = () => {
  const allExpanded = Object.keys(expandedKeys.value).length > 0
  if (allExpanded) {
    expandedKeys.value = {}
  } else {
    const keys: Record<string, boolean> = {}
    expandAllNodes(treeData.value, keys)
    expandedKeys.value = keys
  }
}

onMounted(() => {
  loadMetricsTree()
})
</script>

<template>
  <div class="p-4">
    <div class="flex justify-content-between align-items-center mb-4">
      <h2 class="flex align-items-center gap-2 m-0">
        <i class="pi pi-sitemap text-primary"></i>
        Vue Arborescente des Métriques
      </h2>
      
      <div class="flex gap-2">
        <Button
          icon="pi pi-plus-circle"
          label="Tout Déplier"
          @click="toggleAll"
          outlined
          size="small"
        />
        <Button
          icon="pi pi-refresh"
          label="Actualiser"
          @click="refresh"
          :loading="loading"
          size="small"
        />
      </div>
    </div>

    <Message v-if="error" severity="error" :closable="false" class="mb-3">
      {{ error }}
    </Message>

    <div v-if="loading" class="surface-card border-round p-4">
      <div class="flex align-items-center gap-2 mb-3">
        <Skeleton width="200px" height="20px" />
        <Skeleton width="60px" height="20px" />
      </div>
      <Skeleton width="100%" height="300px" />
    </div>

    <TreeTable 
      v-else
      :value="treeData"
      v-model:expandedKeys="expandedKeys"
      class="surface-card"
      :loading="loading"
      showGridlines
      stripedRows
    >
      <Column field="name" header="Nom" expander style="width: 40%">
        <template #body="{ node }">
          <div class="flex align-items-center gap-2">
            <!-- Icône selon le type de nœud -->
            <i v-if="node.data.isService" class="pi pi-server text-primary"></i>
            <i v-else-if="node.data.isMetricType" class="pi pi-tags text-orange-500"></i>
            <i v-else-if="node.data.isMetric" class="pi pi-chart-line text-blue-500"></i>
            
            <span class="font-medium">{{ node.data.name }}</span>
            
            <!-- Badge pour le nombre d'éléments -->
            <Badge 
              v-if="node.data.count" 
              :value="node.data.count" 
              :severity="node.data.isService ? getServiceBadgeSeverity(node.data.serviceName) : 'info'"
              size="small"
            />
          </div>
        </template>
      </Column>

      <Column field="value" header="Valeur" style="width: 25%">
        <template #body="{ node }">
          <div v-if="node.data.value !== undefined" class="flex align-items-center gap-2">
            <span class="font-semibold text-900">{{ formatValue(node.data.value) }}</span>
          </div>
          <span v-else class="text-500">—</span>
        </template>
      </Column>

      <Column field="type" header="Type" style="width: 20%">
        <template #body="{ node }">
          <Tag 
            v-if="node.data.type" 
            :value="node.data.type" 
            :severity="getBadgeSeverity(node.data.type)"
            size="small"
          />
          <span v-else-if="node.data.isService" class="text-500 font-italic">Service</span>
          <span v-else-if="node.data.isMetricType" class="text-500 font-italic">Groupe</span>
          <span v-else class="text-500">—</span>
        </template>
      </Column>

      <Column header="Actions" style="width: 15%">
        <template #body="{ node }">
          <div class="flex gap-1">
            <Button 
              v-if="node.data.isMetric"
              icon="pi pi-chart-bar" 
              severity="secondary" 
              size="small"
              outlined
              v-tooltip.top="'Voir le graphique'"
            />
            <Button 
              v-if="node.data.isService"
              icon="pi pi-cog" 
              severity="secondary" 
              size="small"
              outlined
              v-tooltip.top="'Configuration'"
            />
          </div>
        </template>
      </Column>
    </TreeTable>

    <div v-if="!loading && treeData.length === 0" class="text-center p-4">
      <Message severity="info" :closable="false">
        Aucune métrique disponible.
      </Message>
    </div>
  </div>
</template>

<style scoped>
/* Boutons modernes */
:deep(.modern-button) {
  border-radius: 8px !important;
  font-weight: 500 !important;
  font-size: 0.875rem !important;
  transition: all 0.2s ease !important;
  border: 1.5px solid var(--surface-300) !important;
}

:deep(.modern-button:hover) {
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}

:deep(.modern-button.primary) {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
  border-color: #10b981 !important;
  color: white !important;
}

/* TreeTable moderne */
:deep(.modern-treetable) {
  border-radius: 12px !important;
  overflow: hidden !important;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08) !important;
  border: 1px solid var(--border-color) !important;
}

:deep(.modern-treetable .p-treetable-thead > tr > th) {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
  border-color: var(--border-color) !important;
  font-weight: 600 !important;
  font-size: 0.875rem !important;
  color: var(--text-color) !important;
  padding: 1rem !important;
  letter-spacing: -0.01em !important;
}

:deep(.modern-treetable .p-treetable-tbody > tr) {
  border-color: var(--surface-200) !important;
  transition: all 0.2s ease !important;
}

:deep(.modern-treetable .p-treetable-tbody > tr:hover) {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05) !important;
}

:deep(.modern-treetable .p-treetable-tbody > tr > td) {
  padding: 0.875rem 1rem !important;
  vertical-align: middle !important;
  border-color: var(--surface-200) !important;
}

:deep(.modern-treetable .p-treetable-toggler) {
  color: var(--primary-color) !important;
  width: 1.5rem !important;
  height: 1.5rem !important;
  border-radius: 6px !important;
  transition: all 0.2s ease !important;
}

:deep(.modern-treetable .p-treetable-toggler:hover) {
  background: var(--primary-color) !important;
  color: white !important;
}

/* Badges modernes */
:deep(.modern-badge) {
  font-size: 0.75rem !important;
  font-weight: 600 !important;
  padding: 0.25rem 0.5rem !important;
  border-radius: 6px !important;
  min-width: 1.5rem !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
}

/* Tags modernes */
:deep(.modern-tag) {
  font-size: 0.75rem !important;
  font-weight: 500 !important;
  padding: 0.25rem 0.75rem !important;
  border-radius: 6px !important;
  letter-spacing: 0.01em !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
}

/* Messages modernes */
:deep(.modern-message) {
  border-radius: 10px !important;
  border: 1px solid var(--border-color) !important;
  font-weight: 500 !important;
}

/* Boutons d'actions */
:deep(.action-button) {
  width: 2rem !important;
  height: 2rem !important;
  border-radius: 6px !important;
  transition: all 0.2s ease !important;
  border-color: var(--surface-300) !important;
}

:deep(.action-button:hover) {
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
  background: var(--primary-color) !important;
  border-color: var(--primary-color) !important;
  color: white !important;
}

/* Skeleton amélioré */
:deep(.p-skeleton) {
  background: linear-gradient(90deg, var(--surface-200) 25%, var(--surface-100) 50%, var(--surface-200) 75%) !important;
  background-size: 200% 100% !important;
  animation: loading 1.5s infinite !important;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Variables CSS pour la cohérence */
.text-color { color: var(--text-color); }
.text-color-secondary { color: var(--text-color-secondary); }
</style>