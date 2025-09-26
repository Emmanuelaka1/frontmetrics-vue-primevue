<script setup lang="ts">
import { ref, onMounted } from 'vue'
import TreeTable from 'primevue/treetable'
import Column from 'primevue/column'
import Badge from 'primevue/badge'
import Tag from 'primevue/tag'
import Button from 'primevue/button'

interface FileNode {
  key: string
  data: {
    name: string
    size: string
    type: 'Folder' | 'Application' | 'File'
    isExpanded?: boolean
  }
  children?: FileNode[]
}

const expandedKeys = ref<Record<string, boolean>>({})

// Simulation de données similaires à votre image
const fileSystem = ref<FileNode[]>([
  {
    key: 'applications',
    data: {
      name: 'Applications',
      size: '100kb',
      type: 'Folder'
    },
    children: [
      {
        key: 'vue',
        data: {
          name: 'Vue',
          size: '25kb',
          type: 'Folder'
        },
        children: [
          {
            key: 'vue-component1',
            data: {
              name: 'MetricsGrid.vue',
              size: '8kb',
              type: 'File'
            }
          },
          {
            key: 'vue-component2',
            data: {
              name: 'MetricCard.vue',
              size: '5kb',
              type: 'File'
            }
          }
        ]
      },
      {
        key: 'editor',
        data: {
          name: 'editor.app',
          size: '25kb',
          type: 'Application'
        }
      },
      {
        key: 'settings',
        data: {
          name: 'settings.app',
          size: '50kb',
          type: 'Application'
        }
      }
    ]
  },
  {
    key: 'cloud',
    data: {
      name: 'Cloud',
      size: '20kb',
      type: 'Folder'
    },
    children: [
      {
        key: 'cloud-config',
        data: {
          name: 'config.json',
          size: '2kb',
          type: 'File'
        }
      }
    ]
  },
  {
    key: 'desktop',
    data: {
      name: 'Desktop',
      size: '150kb',
      type: 'Folder'
    },
    children: [
      {
        key: 'desktop-app',
        data: {
          name: 'desktop.app',
          size: '120kb',
          type: 'Application'
        }
      }
    ]
  }
])

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'Folder': return 'pi pi-folder'
    case 'Application': return 'pi pi-desktop'
    case 'File': return 'pi pi-file'
    default: return 'pi pi-file'
  }
}

const getTypeSeverity = (type: string) => {
  switch (type) {
    case 'Folder': return 'info'
    case 'Application': return 'success'
    case 'File': return 'secondary'
    default: return 'secondary'
  }
}

const getSizeColor = (size: string) => {
  const numericSize = parseInt(size)
  if (numericSize > 100) return 'text-red-500'
  if (numericSize > 50) return 'text-orange-500'
  if (numericSize > 20) return 'text-blue-500'
  return 'text-green-500'
}

onMounted(() => {
  // Expand Applications folder by default
  expandedKeys.value = { 'applications': true }
})

const toggleAll = () => {
  const isExpanded = Object.keys(expandedKeys.value).length > 0
  if (isExpanded) {
    expandedKeys.value = {}
  } else {
    expandedKeys.value = {
      'applications': true,
      'vue': true,
      'cloud': true,
      'desktop': true
    }
  }
}
</script>

<template>
  <div class="p-4">
    <div class="flex justify-content-between align-items-center mb-4">
      <h2 class="flex align-items-center gap-2 m-0">
        <i class="pi pi-folder text-primary"></i>
        Explorateur de Fichiers
      </h2>
      
      <Button
        :icon="Object.keys(expandedKeys).length > 0 ? 'pi pi-minus-circle' : 'pi pi-plus-circle'"
        :label="Object.keys(expandedKeys).length > 0 ? 'Tout Réduire' : 'Tout Déplier'"
        @click="toggleAll"
        outlined
        size="small"
      />
    </div>

    <TreeTable 
      :value="fileSystem"
      v-model:expandedKeys="expandedKeys"
      class="surface-card"
      showGridlines
      stripedRows
    >
      <Column field="name" header="Name" expander style="width: 50%">
        <template #body="{ node }">
          <div class="flex align-items-center gap-2">
            <i :class="[getTypeIcon(node.data.type), 'text-primary']"></i>
            <span class="font-medium">{{ node.data.name }}</span>
            
            <Badge 
              v-if="node.children && node.children.length > 0"
              :value="node.children.length" 
              severity="info"
              size="small"
            />
          </div>
        </template>
      </Column>

      <Column field="size" header="Size" style="width: 25%">
        <template #body="{ node }">
          <span :class="['font-semibold', getSizeColor(node.data.size)]">
            {{ node.data.size }}
          </span>
        </template>
      </Column>

      <Column field="type" header="Type" style="width: 25%">
        <template #body="{ node }">
          <Tag 
            :value="node.data.type" 
            :severity="getTypeSeverity(node.data.type)"
            size="small"
          />
        </template>
      </Column>
    </TreeTable>
  </div>
</template>

<style scoped>
:deep(.p-treetable .p-treetable-thead > tr > th) {
  background: var(--surface-100);
  border-color: var(--surface-200);
  font-weight: 600;
}

:deep(.p-treetable .p-treetable-tbody > tr) {
  border-color: var(--surface-200);
}

:deep(.p-treetable .p-treetable-tbody > tr:hover) {
  background: var(--surface-50);
}

:deep(.p-treetable .p-treetable-toggler) {
  color: var(--primary-color);
}

:deep(.p-tag) {
  font-size: 0.75rem;
}

:deep(.p-badge) {
  font-size: 0.7rem;
  min-width: 1.5rem;
}
</style>