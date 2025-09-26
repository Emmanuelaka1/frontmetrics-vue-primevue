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
    level: 'service' | 'type' | 'metric'
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
    
    // Expand all by default
    const keys: Record<string, boolean> = {}
    expandAllNodes(treeData.value, keys)
    expandedKeys.value = keys
    
  } catch (e: any) {
    error.value = e?.message ?? 'Erreur lors du chargement'
    console.error('Erreur Premium TreeTable:', e)
  } finally {
    loading.value = false
  }
}

const buildTreeStructure = (services: { typeCarte: string; metrics: RawMetric[] }[]): TreeNode[] => {
  return services.map(service => {
    const metricsByType: Record<string, RawMetric[]> = {}
    
    service.metrics.forEach(metric => {
      const type = metric.type || 'Autres'
      if (!metricsByType[type]) {
        metricsByType[type] = []
      }
      metricsByType[type].push(metric)
    })

    const typeNodes: TreeNode[] = Object.entries(metricsByType).map(([type, metrics]) => ({
      key: `${service.typeCarte}-${type}`,
      data: {
        name: type,
        count: metrics.length,
        serviceName: service.typeCarte,
        level: 'type'
      },
      children: metrics.map((metric, index) => ({
        key: `${service.typeCarte}-${type}-${index}`,
        data: {
          name: metric.name,
          value: metric.value,
          type: metric.type,
          serviceName: service.typeCarte,
          level: 'metric'
        }
      }))
    }))

    return {
      key: service.typeCarte,
      data: {
        name: service.typeCarte.replace('_', ' '),
        count: service.metrics.length,
        serviceName: service.typeCarte,
        level: 'service'
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
    if (value >= 1000) return value.toLocaleString('fr-FR')
    if (value < 1 && value > 0) return value.toFixed(3)
    if (value % 1 !== 0) return value.toFixed(2)
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
  <div class="premium-container">
    <!-- Header avec design premium -->
    <div class="premium-header">
      <div class="header-content">
        <div class="header-icon">
          <i class="pi pi-sitemap"></i>
        </div>
        <h2 class="header-title">Vue Arborescence des Métriques</h2>
      </div>
      
      <div class="header-actions">
        <Button
          icon="pi pi-plus-circle"
          label="Tout Déplier"
          @click="toggleAll"
          class="premium-btn secondary"
          size="small"
        />
        <Button
          icon="pi pi-refresh"
          label="Actualiser"
          @click="refresh"
          :loading="loading"
          class="premium-btn primary"
          size="small"
        />
      </div>
    </div>

    <!-- Message d'erreur -->
    <Message v-if="error" severity="error" :closable="false" class="premium-message error-msg">
      {{ error }}
    </Message>

    <!-- Loading state -->
    <div v-if="loading" class="loading-container">
      <div class="loading-header">
        <Skeleton width="240px" height="28px" class="premium-skeleton" />
        <Skeleton width="80px" height="24px" class="premium-skeleton" />
      </div>
      <Skeleton width="100%" height="450px" class="premium-skeleton table-skeleton" />
    </div>

    <!-- TreeTable Premium -->
    <div v-else class="table-container">
      <TreeTable 
        :value="treeData"
        v-model:expandedKeys="expandedKeys"
        class="premium-treetable"
        :loading="loading"
        showGridlines
        stripedRows
        responsiveLayout="scroll"
      >
        <Column field="name" header="Nom" expander :style="{ width: '40%', minWidth: '320px' }">
          <template #body="{ node }">
            <div class="name-cell">
              <!-- Icônes avec design premium -->
              <div class="node-icon" :class="`icon-${node.data.level}`">
                <i v-if="node.data.level === 'service'" class="pi pi-server"></i>
                <i v-else-if="node.data.level === 'type'" class="pi pi-tags"></i>
                <i v-else class="pi pi-chart-line"></i>
              </div>
              
              <span class="node-name">{{ node.data.name }}</span>
              
              <!-- Badge premium -->
              <Badge 
                v-if="node.data.count" 
                :value="node.data.count" 
                :severity="node.data.level === 'service' ? getServiceBadgeSeverity(node.data.serviceName!) : 'info'"
                class="premium-badge"
              />
            </div>
          </template>
        </Column>

        <Column field="value" header="Valeur" :style="{ width: '25%', textAlign: 'right' }">
          <template #body="{ node }">
            <div class="value-cell">
              <span v-if="node.data.value !== undefined" class="metric-value">
                {{ formatValue(node.data.value) }}
              </span>
              <span v-else class="no-value">—</span>
            </div>
          </template>
        </Column>

        <Column field="type" header="Type" :style="{ width: '20%' }">
          <template #body="{ node }">
            <div class="type-cell">
              <Tag 
                v-if="node.data.type" 
                :value="node.data.type" 
                :severity="getBadgeSeverity(node.data.type)"
                class="premium-tag"
              />
              <span v-else-if="node.data.level === 'service'" class="level-label">Service</span>
              <span v-else-if="node.data.level === 'type'" class="level-label">Groupe</span>
              <span v-else class="no-value">—</span>
            </div>
          </template>
        </Column>

        <Column header="Actions" :style="{ width: '15%', textAlign: 'center' }">
          <template #body="{ node }">
            <div class="actions-cell">
              <Button 
                v-if="node.data.level === 'metric'"
                icon="pi pi-chart-bar" 
                severity="secondary" 
                size="small"
                class="premium-action-btn"
                v-tooltip.top="'Voir le graphique'"
              />
              <Button 
                v-if="node.data.level === 'service'"
                icon="pi pi-cog" 
                severity="secondary" 
                size="small"
                class="premium-action-btn"
                v-tooltip.top="'Configuration'"
              />
            </div>
          </template>
        </Column>
      </TreeTable>
    </div>

    <!-- Empty state -->
    <div v-if="!loading && treeData.length === 0" class="empty-state">
      <div class="empty-content">
        <i class="pi pi-info-circle empty-icon"></i>
        <h3 class="empty-title">Aucune métrique disponible</h3>
        <p class="empty-desc">Les données de métriques ne sont pas encore disponibles.</p>
        <Button label="Réessayer" @click="refresh" class="premium-btn primary" />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Container principal */
.premium-container {
  padding: 2rem;
  background: linear-gradient(135deg, #fafbfc 0%, #f4f6f8 100%);
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Header premium */
.premium-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.5rem 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  border: 1px solid #e2e8f0;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon {
  width: 3rem;
  height: 3rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.25);
}

.header-title {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  letter-spacing: -0.025em;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

/* Boutons premium */
:deep(.premium-btn) {
  border-radius: 10px !important;
  font-weight: 600 !important;
  font-size: 0.875rem !important;
  padding: 0.75rem 1.25rem !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  border: none !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
}

:deep(.premium-btn.primary) {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
  color: white !important;
}

:deep(.premium-btn.primary:hover) {
  transform: translateY(-2px) !important;
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.35) !important;
}

:deep(.premium-btn.secondary) {
  background: white !important;
  color: #64748b !important;
  border: 1.5px solid #e2e8f0 !important;
}

:deep(.premium-btn.secondary:hover) {
  background: #f8fafc !important;
  border-color: #cbd5e1 !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
}

/* Container du tableau */
.table-container {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
}

/* TreeTable premium */
:deep(.premium-treetable) {
  border: none !important;
}

:deep(.premium-treetable .p-treetable-thead > tr > th) {
  background: #cecece  !important;
  border: none !important;
  border-bottom: 1px solid #e2e8f0 !important;
  font-weight: 600 !important;
  font-size: 0.875rem !important;
  color: #475569 !important;
  padding: 1.05rem 1.2rem !important;
  text-transform: uppercase !important;
  letter-spacing: 0.05em !important;
}

:deep(.premium-treetable .p-treetable-tbody > tr) {
  transition: all 0.3s ease !important;
  border-collapse: separate !important;
}

:deep(.premium-treetable .p-treetable-tbody > tr:hover) {
  background: #93bbe3  !important;
  transform: scale(1.005) !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06) !important;
}

:deep(.premium-treetable .p-treetable-tbody > tr > td) {
  padding: 0.5rem 2rem 0.5rem 1.5rem !important;
  border-left: none !important;
  border-right: none !important;
  vertical-align: middle !important;
  position: relative !important;
}

/* Bordures alternatives avec pseudo-éléments */
:deep(.premium-treetable .p-treetable-tbody > tr > td:first-child::before) {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1;
}

:deep(.premium-treetable .p-treetable-tbody > tr > td:first-child::after) {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1;
}

:deep(.premium-treetable .p-treetable-toggler) {
  color: #3b82f6 !important;
  width: 2rem !important;
  height: 2rem !important;
  border-radius: 8px !important;
  transition: all 0.2s ease !important;
  margin-right: 0.5rem !important;
}

:deep(.premium-treetable .p-treetable-toggler:hover) {
  background: #3b82f6 !important;
  color: white !important;
  transform: scale(1.1) !important;
}

/* Cellules personnalisées */
.name-cell {
  display: flex;
  align-items: center;
  gap: 0.875rem;
}

.node-icon {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  color: white;
  font-weight: 500;
}

.icon-service {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
}

.icon-type {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.25);
}

.icon-metric {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
}

.node-name {
  font-weight: 600;
  font-size: 0.925rem;
  color: #1e293b;
}

.value-cell {
  text-align: right;
}

.metric-value {
  font-weight: 700;
  font-size: 0.925rem;
  color: #0f172a;
  font-variant-numeric: tabular-nums;
}

.no-value, .level-label {
  color: #94a3b8;
  font-size: 0.875rem;
  font-style: italic;
}

.type-cell, .actions-cell {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Badges et tags premium */
:deep(.premium-badge) {
  font-size: 0.75rem !important;
  font-weight: 700 !important;
  padding: 0.375rem 0.75rem !important;
  border-radius: 8px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
  letter-spacing: 0.025em !important;
}

:deep(.premium-tag) {
  font-size: 0.8rem !important;
  font-weight: 600 !important;
  padding: 0.4rem 0.875rem !important;
  border-radius: 8px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
  letter-spacing: 0.01em !important;
}

/* Boutons d'actions premium */
:deep(.premium-action-btn) {
  width: 2.25rem !important;
  height: 2.25rem !important;
  border-radius: 8px !important;
  transition: all 0.3s ease !important;
  border: 1.5px solid #e2e8f0 !important;
  background: white !important;
}

:deep(.premium-action-btn:hover) {
  transform: translateY(-2px) scale(1.05) !important;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
  background: #10b981 !important;
  border-color: #10b981 !important;
  color: white !important;
}

/* Loading state */
.loading-container {
  padding: 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
}

.loading-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

:deep(.premium-skeleton) {
  border-radius: 8px !important;
}

.table-skeleton {
  border-radius: 12px !important;
}

/* Empty state */
.empty-state {
  padding: 4rem 2rem;
  text-align: center;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
}

.empty-content {
  max-width: 400px;
  margin: 0 auto;
}

.empty-icon {
  font-size: 4rem;
  color: #cbd5e1;
  margin-bottom: 1.5rem;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.75rem 0;
}

.empty-desc {
  color: #64748b;
  margin-bottom: 2rem;
  line-height: 1.6;
}

/* Message premium */
:deep(.premium-message) {
  border-radius: 12px !important;
  border: 1px solid #fed7d7 !important;
  font-weight: 500 !important;
  margin-bottom: 2rem !important;
}

.error-msg {
  background: linear-gradient(135deg, #fef2f2 0%, #fef7f7 100%) !important;
}

/* Responsive */
@media (max-width: 768px) {
  .premium-container {
    padding: 1rem;
  }
  
  .premium-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .header-title {
    font-size: 1.5rem;
  }
}
</style>