<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import MetricCard from './MetricCard.vue'
import MetricsSelector from './MetricsSelector.vue'
import Skeleton from 'primevue/skeleton'
import Message from 'primevue/message'
import { fetchMetricsByType, type RawMetric, type CardType } from '../api'

const loading = ref(true)
const error = ref<string | null>(null)
const typeCarte = ref('DEFAULT')
const metrics = ref<RawMetric[]>([])

const loadMetrics = async (type: CardType) => {
  loading.value = true
  error.value = null
  try {
    const { typeCarte: t, metrics: m } = await fetchMetricsByType(type)
    typeCarte.value = t
    metrics.value = m
  } catch (e: any) {
    error.value = e?.message ?? 'Erreur lors du chargement'
    console.error('Erreur lors du chargement des métriques:', e)
  } finally {
    loading.value = false
  }
}

const onTypeChanged = (type: CardType) => {
  loadMetrics(type)
}

// Grouper les métriques par type
const groupedMetrics = computed(() => {
  const groups: { [key: string]: RawMetric[] } = {}
  
  metrics.value.forEach(metric => {
    const key = metric.type || 'Autres'
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(metric)
  })
  
  return groups
})
</script>

<template>
  <div class="p-3">
    <h2 class="mb-3">Métriques</h2>
    
    <MetricsSelector @type-changed="onTypeChanged" />

    <Message v-if="error" severity="error" :closable="false" class="mb-3">
      {{ error }}
    </Message>

    <div v-else class="grid">
      <div v-if="loading" class="col-12 md:col-4" v-for="n in 6" :key="n">
        <Skeleton height="8rem" class="border-round-2xl" />
      </div>

      <template v-else>
        <!-- Affichage groupé par type -->
        <div v-for="(groupMetrics, groupType) in groupedMetrics" :key="groupType" class="col-12">
          <h3 class="text-xl font-semibold mb-3 text-primary">
            {{ groupType }} 
            <small class="text-500 font-normal">({{ typeCarte }})</small>
          </h3>
          
          <div class="grid">
            <div class="col-12 md:col-6 lg:col-3" v-for="(m, i) in groupMetrics" :key="`${groupType}-${i}`">
              <MetricCard 
                :name="m.name" 
                :value="m.value" 
                :type="m.type" 
                :variant="typeCarte" 
              />
            </div>
          </div>
        </div>
      </template>

      <Message v-if="!loading && metrics.length === 0" severity="info" :closable="false">
        Aucune métrique disponible pour ce type.
      </Message>
    </div>
  </div>
</template>
