<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import MetricCard from './MetricCard.vue'
import MetricsSelector from './MetricsSelector.vue'
import Skeleton from 'primevue/skeleton'
import Message from 'primevue/message'
import { fetchAllMetrics, type RawMetric } from '../api'

const loading = ref(true)
const error = ref<string | null>(null)
const allServicesData = ref<{ typeCarte: string; metrics: RawMetric[] }[]>([])

const loadMetrics = async () => {
  loading.value = true
  error.value = null
  try {
    allServicesData.value = await fetchAllMetrics()
  } catch (e: any) {
    error.value = e?.message ?? 'Erreur lors du chargement'
    console.error('Erreur lors du chargement des métriques:', e)
  } finally {
    loading.value = false
  }
}



// Grouper les métriques par service et par type
const groupedMetrics = computed(() => {
  const serviceGroups: { [serviceName: string]: { [metricType: string]: RawMetric[] } } = {}
  
  allServicesData.value.forEach(service => {
    serviceGroups[service.typeCarte] = {}
    
    service.metrics.forEach(metric => {
      const key = metric.type || 'Autres'
      if (!serviceGroups[service.typeCarte][key]) {
        serviceGroups[service.typeCarte][key] = []
      }
      serviceGroups[service.typeCarte][key].push(metric)
    })
  })
  
  return serviceGroups
})

onMounted(() => {
  loadMetrics()
})
</script>

<template>
  <div class="p-3">
    <h2 class="mb-3">Toutes les Métriques</h2>

    <Message v-if="error" severity="error" :closable="false" class="mb-3">
      {{ error }}
    </Message>

    <div v-else class="grid">
      <div v-if="loading" class="col-12 md:col-4" v-for="n in 6" :key="n">
        <Skeleton height="8rem" class="border-round-2xl" />
      </div>

      <template v-else>
        <!-- Affichage groupé par service puis par type -->
        <div v-for="(serviceMetrics, serviceName) in groupedMetrics" :key="serviceName" class="col-12">
          <h2 class="text-2xl font-bold mb-4 text-primary">
            {{ String(serviceName).replace('_', ' ') }}
          </h2>
          
          <div v-for="(typeMetrics, metricType) in serviceMetrics" :key="`${serviceName}-${metricType}`" class="mb-5">
            <h3 class="text-xl font-semibold mb-3 text-600">
              {{ metricType }}
              <small class="text-500 font-normal">({{ typeMetrics.length }} métriques)</small>
            </h3>
            
            <div class="grid">
              <div class="col-12 md:col-6 lg:col-3" v-for="(metric, i) in typeMetrics" :key="`${serviceName}-${metricType}-${i}`">
                <MetricCard 
                  :name="metric.name" 
                  :value="metric.value" 
                  :type="metric.type" 
                  :variant="String(serviceName)" 
                />
              </div>
            </div>
          </div>
        </div>
      </template>

      <Message v-if="!loading && allServicesData.length === 0" severity="info" :closable="false">
        Aucune métrique disponible.
      </Message>
    </div>
  </div>
</template>
