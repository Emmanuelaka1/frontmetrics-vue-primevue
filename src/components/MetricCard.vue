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
  <Card :class="['shadow-2 surface-card border-round-2xl h-full', cardSize]">
    <template #title>
      <div class="flex align-items-center gap-2">
        <i :class="[metricIcon, 'text-primary']"></i>
        <span class="font-medium">{{ name }}</span>
        <Tag 
          :severity="tagSeverity" 
          :value="type ?? 'N/A'" 
          class="ml-auto"
          size="small"
        />
      </div>
    </template>
    <template #content>
      <div :class="size === 'small' ? 'text-2xl font-bold' : 'text-3xl font-bold'">
        {{ displayValue }}
      </div>
      <small class="text-500">{{ variant?.replace('_', ' ') ?? 'DEFAULT' }}</small>
    </template>
  </Card>
</template>
