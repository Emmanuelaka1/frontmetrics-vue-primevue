<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import TreeTable from 'primevue/treetable'
import Column from 'primevue/column'
import Badge from 'primevue/badge'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import Skeleton from 'primevue/skeleton'
import Message from 'primevue/message'
import InputText from 'primevue/inputtext'
import MultiSelect from 'primevue/multiselect'
import Toolbar from 'primevue/toolbar'
import { fetchAllMetrics, type RawMetric } from '../api'
import { MetricsUtils } from '../utils/MetricsUtils'
import '../styles/PremiumTreeTable.css'

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

const loading = ref(true)
const error = ref<string | null>(null)
const expandedKeys = ref<Record<string, boolean>>({})
const globalFilter = ref('')
const selectedServices = ref<string[]>([])
const selectedTypes = ref<string[]>([])

const rawData = ref<{ typeCarte: string; metrics: RawMetric[] }[]>([])
const treeData = ref<TreeNode[]>([])

// Options pour les filtres
const serviceOptions = computed(() => 
  [...new Set(rawData.value.map(s => s.typeCarte))].map(service => ({
    label: service.replace('_', ' '),
    value: service
  }))
)

const typeOptions = computed(() => {
  const types = new Set<string>()
  rawData.value.forEach(service => {
    service.metrics.forEach(metric => {
      if (metric.type) types.add(metric.type)
    })
  })
  return Array.from(types).map(type => ({
    label: type,
    value: type
  }))
})

// Données filtrées
const filteredTreeData = computed(() => {
  let filtered = [...treeData.value]

  // Filtre par services sélectionnés
  if (selectedServices.value.length > 0) {
    filtered = filtered.filter(node => 
      selectedServices.value.includes(node.data.serviceName!)
    )
  }

  // Filtre par types sélectionnés
  if (selectedTypes.value.length > 0) {
    filtered = filtered.map(serviceNode => ({
      ...serviceNode,
      children: serviceNode.children?.filter(typeNode => 
        typeNode.children?.some(metricNode => 
          selectedTypes.value.includes(metricNode.data.type!)
        )
      ).map(typeNode => ({
        ...typeNode,
        children: typeNode.children?.filter(metricNode => 
          selectedTypes.value.includes(metricNode.data.type!)
        )
      }))
    })).filter(node => node.children && node.children.length > 0)
  }

  return filtered
})

const loadMetricsTree = async () => {
  loading.value = true
  error.value = null
  
  try {
    rawData.value = await fetchAllMetrics()
    treeData.value = buildTreeStructure(rawData.value)
    
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

const refresh = () => {
  loadMetricsTree()
}

const toggleAll = () => {
  const allExpanded = Object.keys(expandedKeys.value).length > 0
  if (allExpanded) {
    expandedKeys.value = {}
  } else {
    const keys: Record<string, boolean> = {}
    expandAllNodes(filteredTreeData.value, keys)
    expandedKeys.value = keys
  }
}

const clearFilters = () => {
  selectedServices.value = []
  selectedTypes.value = []
  globalFilter.value = ''
}

const exportData = () => {
  const data = flattenTreeData(filteredTreeData.value)
  const csv = convertToCSV(data)
  downloadCSV(csv, 'metrics-export.csv')
}

const flattenTreeData = (nodes: TreeNode[]): any[] => {
  const result: any[] = []
  
  const traverse = (node: TreeNode, level: number = 0) => {
    result.push({
      niveau: level,
      service: node.data.serviceName,
      nom: node.data.name,
      valeur: node.data.value || '',
      type: node.data.type || '',
      categorie: node.data.level
    })
    
    if (node.children) {
      node.children.forEach(child => traverse(child, level + 1))
    }
  }
  
  nodes.forEach(node => traverse(node))
  return result
}

const convertToCSV = (data: any[]): string => {
  if (data.length === 0) return ''
  
  const headers = Object.keys(data[0])
  const csvHeaders = headers.join(',')
  
  const csvRows = data.map(row => 
    headers.map(header => {
      const value = row[header]
      return typeof value === 'string' && value.includes(',') ? `"${value}"` : value
    }).join(',')
  )
  
  return [csvHeaders, ...csvRows].join('\n')
}

const downloadCSV = (csv: string, filename: string) => {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
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
        <h2 class="header-title">Métriques</h2>
      </div>
      
      <div class="header-actions">
        <Button
          icon="pi pi-refresh"
          label="Actualiser"
          @click="refresh"
          :loading="loading"
          class="premium-btn primary"
        />
      </div>
    </div>

    <!-- Message d'erreur -->
    <Message v-if="error" severity="error" :closable="false" class="premium-message error-msg">
      {{ error }}
    </Message>

    <!-- Toolbar avec filtres premium -->
    <Toolbar class="premium-toolbar mb-4">
      <template #start>
        <div class="flex align-items-center gap-2">
          <i class="pi pi-search text-primary"></i>
          <InputText 
            v-model="globalFilter" 
            placeholder="Recherche globale..." 
            size="small"
            class="premium-input"
          />
        </div>
      </template>

      <template #center>
        <div class="flex align-items-center gap-3">
          <MultiSelect 
            v-model="selectedServices"
            :options="serviceOptions"
            option-label="label"
            option-value="value"
            placeholder="Filtrer par services"
            size="small"
            class="premium-multiselect"
          />
          
          <MultiSelect 
            v-model="selectedTypes"
            :options="typeOptions"
            option-label="label" 
            option-value="value"
            placeholder="Filtrer par types"
            size="small"
            class="premium-multiselect"
          />
        </div>
      </template>

      <template #end>
        <div class="flex gap-2">
          <Button 
            icon="pi pi-filter-slash"
            label="Effacer"
            @click="clearFilters"
            severity="contrast"
          />
          <Button 
            icon="pi pi-download"
            label="Export CSV"
            @click="exportData"
            severity="success"

          />
          <Button 
            :icon="Object.keys(expandedKeys).length > 0 ? 'pi pi-minus-circle' : 'pi pi-plus-circle'"
            label="Tout Déplier"
            @click="toggleAll"
            :severity="Object.keys(expandedKeys).length > 0 ? 'danger' : 'info'"
          />
        </div>
      </template>
    </Toolbar>

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
        :value="filteredTreeData"
        v-model:expandedKeys="expandedKeys"
        :globalFilter="globalFilter"
        class="premium-treetable"
        :loading="loading"
        showGridlines
        stripedRows
        responsiveLayout="scroll"
      >
        <Column field="name" header="Libelle" expander :style="{ width: '40%', minWidth: '320px' }">
          <template #body="{ node }">
            <div class="name-cell">
              <!-- Icônes avec design premium -->
              <div 
                class="node-icon" 
                :class="`icon-${node.data.level}`"
                :style="node.data.level === 'metric' ? 
                  `background: ${MetricsUtils.getMetricConfig(node.data.name).background}; box-shadow: 0 4px 12px ${MetricsUtils.getMetricConfig(node.data.name).shadow};` : 
                  ''"
              >
                <i 
                  v-if="node.data.level === 'service'" 
                  class="pi pi-server"
                ></i>
                <i 
                  v-else-if="node.data.level === 'type'" 
                  class="pi pi-tags"
                ></i>
                <i 
                  v-else 
                  :class="MetricsUtils.getMetricConfig(node.data.name).icon"
                ></i>
              </div>
              
              <span class="node-name">{{ node.data.name }}</span>
              
            
            </div>
          </template>
        </Column>

        <Column field="value" header="Valeur" :style="{ width: '25%', textAlign: 'right' }">
          <template #body="{ node }">
            <div class="value-cell">
              <span v-if="node.data.value !== undefined" class="metric-value">
                {{ formatValue(node.data.value)}}
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
                :severity="MetricsUtils.getBadgeSeverity(node.data.type)"
                class="premium-tag"
              />
              <span v-else-if="node.data.level === 'service'" class="level-label">Service</span>
              <span v-else-if="node.data.level === 'type'" class="level-label">Groupe</span>
              <span v-else class="no-value">—</span>
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

    <!-- No results after filtering -->
    <div v-if="!loading && treeData.length > 0 && filteredTreeData.length === 0" class="empty-state">
      <div class="empty-content">
        <i class="pi pi-filter empty-icon"></i>
        <h3 class="empty-title">Aucun résultat</h3>
        <p class="empty-desc">Aucune donnée ne correspond aux filtres appliqués.</p>
        <Button label="Effacer les filtres" @click="clearFilters" class="premium-btn secondary" />
      </div>
    </div>
  </div>
</template>