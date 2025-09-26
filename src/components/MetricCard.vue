<script setup lang="ts">
import { computed } from 'vue'
import Card from 'primevue/card'
import Tag from 'primevue/tag'

type Props = {
  name: string
  value: any
  type?: string
  variant?: string
  size?: 'small' | 'default'
}
const props = withDefaults(defineProps<Props>(), {
  size: 'default'
})

const displayValue = computed(() => {
  if (typeof props.value === 'number') {
    // Formater les nombres avec séparateurs de milliers
    if (props.value >= 1000) {
      return props.value.toLocaleString('fr-FR')
    }
    // Arrondir les décimales à 3 chiffres significatifs
    if (props.value < 1 && props.value > 0) {
      return props.value.toFixed(3)
    }
    if (props.value % 1 !== 0) {
      return props.value.toFixed(2)
    }
  }
  if (props.type === 'percent' && typeof props.value === 'number') {
    return `${props.value.toFixed(2)}%`
  }
  return String(props.value)
})

const tagSeverity = computed(() => {
  const type = props.type?.toLowerCase() || ''
  
  if (type.includes('error')) return 'danger'
  if (type.includes('delete')) return 'warning'
  if (type.includes('fast') || type.includes('performance')) return 'success'
  if (type === 'percent') return 'info'
  if (type === 'number') return 'success'
  return 'secondary'
})

const metricIcon = computed(() => {
  const name = props.name.toLowerCase()
  const type = props.type?.toLowerCase() || ''
  
  if (name.includes('number') || name.includes('count')) return 'pi pi-hashtag'
  if (name.includes('average') || name.includes('avg')) return 'pi pi-chart-line'
  if (name.includes('max') || name.includes('maximum')) return 'pi pi-arrow-up'
  if (name.includes('min') || name.includes('minimum')) return 'pi pi-arrow-down'
  if (type.includes('error')) return 'pi pi-exclamation-triangle'
  if (type.includes('delete')) return 'pi pi-trash'
  if (type.includes('performance') || type.includes('fast')) return 'pi pi-bolt'
  return 'pi pi-chart-bar'
})

const cardSize = computed(() => {
  return props.size === 'small' ? 'p-2' : 'p-3'
})
</script>

<template>
  <Card :class="['modern-metric-card', cardSize]">
    <template #title>
      <div class="metric-header">
        <div class="metric-icon-container">
          <i :class="[metricIcon, 'metric-icon']"></i>
        </div>
        <div class="metric-title-section">
          <span class="metric-name">{{ name }}</span>
        </div>
        <Tag 
          :value="type ?? 'N/A'" 
          :severity="tagSeverity" 
          class="metric-tag"
        />
      </div>
    </template>
    <template #content>
      <div class="metric-content">
        <div :class="['metric-value', size === 'small' ? 'value-small' : 'value-large']">
          {{ displayValue }}
        </div>
        <div class="metric-variant">{{ variant?.replace('_', ' ') ?? 'DEFAULT' }}</div>
      </div>
    </template>
  </Card>
</template>

<style scoped>
.modern-metric-card {
  height: 100%;
  border-radius: 16px !important;
  border: 1px solid #e2e8f0 !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%) !important;
}

.modern-metric-card:hover {
  transform: translateY(-4px) !important;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12) !important;
  border-color: #cbd5e1 !important;
}

.p-2 {
  padding: 1rem !important;
}

.p-3 {
  padding: 1.5rem !important;
}

.metric-header {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  margin-bottom: 0.5rem;
}

.metric-icon-container {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
  flex-shrink: 0;
}

.metric-icon {
  color: white;
  font-size: 1rem;
  font-weight: 500;
}

.metric-title-section {
  flex: 1;
  min-width: 0;
}

.metric-name {
  font-weight: 600;
  font-size: 0.925rem;
  color: #1e293b;
  line-height: 1.4;
  display: block;
}

.metric-tag {
  flex-shrink: 0;
}

:deep(.metric-tag) {
  font-size: 0.75rem !important;
  font-weight: 600 !important;
  padding: 0.375rem 0.75rem !important;
  border-radius: 8px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
}

.metric-content {
  padding-top: 0.5rem;
}

.value-large {
  font-size: 2.25rem !important;
  font-weight: 800 !important;
  line-height: 1 !important;
  color: #0f172a !important;
  margin-bottom: 0.75rem !important;
  font-variant-numeric: tabular-nums !important;
  letter-spacing: -0.025em !important;
}

.value-small {
  font-size: 1.875rem !important;
  font-weight: 700 !important;
  line-height: 1 !important;
  color: #0f172a !important;
  margin-bottom: 0.5rem !important;
  font-variant-numeric: tabular-nums !important;
  letter-spacing: -0.025em !important;
}

.metric-variant {
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Override PrimeVue Card styles */
:deep(.p-card .p-card-title) {
  margin-bottom: 0 !important;
  padding: 0 !important;
}

:deep(.p-card .p-card-content) {
  padding: 0 !important;
}

:deep(.p-card .p-card-body) {
  padding: 0 !important;
}

/* Responsive */
@media (max-width: 768px) {
  .metric-header {
    gap: 0.75rem;
  }
  
  .metric-icon-container {
    width: 2.25rem;
    height: 2.25rem;
  }
  
  .metric-icon {
    font-size: 0.875rem;
  }
  
  .value-large {
    font-size: 1.875rem !important;
  }
  
  .value-small {
    font-size: 1.5rem !important;
  }
}
</style>