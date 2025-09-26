<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import TreeTable from 'primevue/treetable'
import Column from 'primevue/column'
import Badge from 'primevue/badge'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import MultiSelect from 'primevue/multiselect'
import Toolbar from 'primevue/toolbar'
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
const sortField = ref('name')
const sortOrder = ref<1 | -1>(1)

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
    buildTreeData()
    
    // Expand all by default
    const keys: Record<string, boolean> = {}
    expandAllNodes(treeData.value, keys)
    expandedKeys.value = keys
    
  } catch (e: any) {
    error.value = e?.message ?? 'Erreur lors du chargement'
    console.error('Erreur TreeTable Avancée:', e)
  } finally {
    loading.value = false
  }
}

const buildTreeData = () => {
  treeData.value = rawData.value.map(service => {
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
        level: 'type' as const,
        severity: getBadgeSeverity(type)
      },
      children: metrics.map((metric, index) => ({
        key: `${service.typeCarte}-${type}-${index}`,
        data: {
          name: metric.name,
          value: metric.value,
          type: metric.type,
          serviceName: service.typeCarte,
          level: 'metric' as const,
          severity: getBadgeSeverity(metric.type)
        }
      }))
    }))

    return {
      key: service.typeCarte,
      data: {
        name: service.typeCarte.replace('_', ' '),
        count: service.metrics.length,
        serviceName: service.typeCarte,
        level: 'service' as const,
        severity: getServiceSeverity(service.typeCarte)
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

const getBadgeSeverity = (type?: string): 'success' | 'info' | 'warning' | 'danger' => {
  const typeStr = type?.toLowerCase() || ''
  
  if (typeStr.includes('error')) return 'danger'
  if (typeStr.includes('delete')) return 'warning' 
  if (typeStr.includes('fast') || typeStr.includes('performance')) return 'success'
  return 'info'
}

const getServiceSeverity = (service: string): 'success' | 'info' | 'warning' | 'danger' => {
  if (service.includes('PERFORMANCE')) return 'success'
  if (service.includes('DELETE')) return 'warning'
  return 'info'
}

const formatValue = (value: any): string => {
  if (typeof value === 'number') {
    if (value >= 1000) return value.toLocaleString('fr-FR')
    if (value < 1 && value > 0) return value.toFixed(3)
    if (value % 1 !== 0) return value.toFixed(2)
  }
  return String(value)
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

onMounted(() => {
  loadMetricsTree()
})
</script>

<template>
  <div class="p-4">
    <div class="flex justify-content-between align-items-center mb-4">
      <h2 class="flex align-items-center gap-2 m-0">
        <i class="pi pi-table text-primary"></i>
        TreeTable Avancée avec Badges
      </h2>
    </div>

    <!-- Toolbar avec filtres -->
    <Toolbar class="mb-4">
      <template #start>
        <div class="flex align-items-center gap-2">
          <span class="pi pi-search" />
          <InputText 
            v-model="globalFilter" 
            placeholder="Recherche globale..." 
            size="small"
            class="w-12rem"
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
            class="w-12rem"
          />
          
          <MultiSelect 
            v-model="selectedTypes"
            :options="typeOptions"
            option-label="label" 
            option-value="value"
            placeholder="Filtrer par types"
            size="small"
            class="w-12rem"
          />
        </div>
      </template>

      <template #end>
        <div class="flex gap-2">
          <Button 
            icon="pi pi-filter-slash"
            label="Effacer"
            @click="clearFilters"
            outlined
            size="small"
          />
          <Button 
            icon="pi pi-download"
            label="Export CSV"
            @click="exportData"
            size="small"
          />
          <Button 
            :icon="Object.keys(expandedKeys).length > 0 ? 'pi pi-minus-circle' : 'pi pi-plus-circle'"
            @click="toggleAll"
            outlined
            size="small"
          />
          <Button 
            icon="pi pi-refresh"
            @click="refresh"
            :loading="loading"
            size="small"
          />
        </div>
      </template>
    </Toolbar>

    <!-- TreeTable -->
    <TreeTable 
      :value="filteredTreeData"
      v-model:expandedKeys="expandedKeys"
      :globalFilter="globalFilter"
      class="surface-card"
      :loading="loading"
      showGridlines
      stripedRows
      responsiveLayout="scroll"
    >
      <Column field="name" header="Nom" expander style="min-width: 300px">
        <template #body="{ node }">
          <div class="flex align-items-center gap-2">
            <i v-if="node.data.level === 'service'" class="pi pi-server text-primary"></i>
            <i v-else-if="node.data.level === 'type'" class="pi pi-tags text-orange-500"></i>
            <i v-else class="pi pi-chart-line text-blue-500"></i>
            
            <span class="font-medium">{{ node.data.name }}</span>
            
            <Badge 
              v-if="node.data.count" 
              :value="node.data.count"
              :severity="node.data.severity"
              size="small"
            />

            <Tag
              v-if="node.data.level === 'service'"
              value="SERVICE"
              severity="info"
              size="small"
            />
          </div>
        </template>
      </Column>

      <Column field="value" header="Valeur" style="min-width: 120px">
        <template #body="{ node }">
          <div v-if="node.data.value !== undefined" class="flex align-items-center gap-2">
            <span class="font-semibold text-900">{{ formatValue(node.data.value) }}</span>
            <Badge 
              v-if="typeof node.data.value === 'number' && node.data.value > 1000"
              value="HIGH"
              severity="warning"
              size="small"
            />
          </div>
          <span v-else class="text-500">—</span>
        </template>
      </Column>

      <Column field="type" header="Type" style="min-width: 150px">
        <template #body="{ node }">
          <div class="flex align-items-center gap-2">
            <Tag 
              v-if="node.data.type" 
              :value="node.data.type"
              :severity="node.data.severity"
              size="small"
            />
            <span v-else-if="node.data.level === 'service'" class="text-500 font-italic">Service</span>
            <span v-else-if="node.data.level === 'type'" class="text-500 font-italic">Groupe</span>
            <span v-else class="text-500">—</span>

            <!-- Badge additionnel pour les erreurs -->
            <Badge 
              v-if="node.data.type?.toLowerCase().includes('error')"
              value="ERROR"
              severity="danger"
              size="small"
            />
          </div>
        </template>
      </Column>

      <Column header="Statut" style="min-width: 100px">
        <template #body="{ node }">
          <div class="flex gap-1">
            <Badge 
              v-if="node.data.level === 'metric' && typeof node.data.value === 'number'"
              :value="node.data.value > 100 ? 'OK' : 'LOW'"
              :severity="node.data.value > 100 ? 'success' : 'warning'"
              size="small"
            />
            
            <Badge 
              v-if="node.children && node.children.length > 5"
              value="FULL"
              severity="info"
              size="small"
            />
          </div>
        </template>
      </Column>

      <Column header="Actions" style="min-width: 120px">
        <template #body="{ node }">
          <div class="flex gap-1">
            <Button 
              v-if="node.data.level === 'metric'"
              icon="pi pi-eye" 
              severity="secondary"
              size="small"
              outlined
              v-tooltip.top="'Voir détails'"
            />
            <Button 
              v-if="node.data.level === 'service'"
              icon="pi pi-cog"
              severity="secondary" 
              size="small"
              outlined
              v-tooltip.top="'Configuration'"
            />
            <Button 
              v-if="node.data.level === 'type'"
              icon="pi pi-chart-bar"
              severity="secondary"
              size="small"
              outlined
              v-tooltip.top="'Graphique'"
            />
          </div>
        </template>
      </Column>
    </TreeTable>

    <div v-if="!loading && filteredTreeData.length === 0" class="text-center p-4">
      <i class="pi pi-info-circle text-3xl text-400 mb-3"></i>
      <p class="text-600">Aucune donnée ne correspond aux filtres appliqués.</p>
      <Button label="Effacer les filtres" @click="clearFilters" outlined />
    </div>
  </div>
</template>

<style scoped>
:deep(.p-treetable) {
  border-radius: 10px;
  overflow: hidden;
}

:deep(.p-treetable .p-treetable-thead > tr > th) {
  background: linear-gradient(135deg, var(--surface-100), var(--surface-200));
  border-color: var(--surface-300);
  font-weight: 600;
  color: var(--text-color);
}

:deep(.p-treetable .p-treetable-tbody > tr:hover) {
  background: var(--surface-50);
  transform: translateY(-1px);
  transition: all 0.2s ease;
}

:deep(.p-tag) {
  font-size: 0.7rem;
  font-weight: 500;
}

:deep(.p-badge) {
  font-size: 0.65rem;
  min-width: 1.4rem;
  font-weight: 600;
}

:deep(.p-toolbar) {
  border-radius: 8px;
  border: 1px solid var(--surface-200);
}

:deep(.p-multiselect) {
  border-color: var(--surface-300);
}
</style>