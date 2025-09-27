<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import MetricCard from './MetricCard.vue'
import Skeleton from 'primevue/skeleton'
import Message from 'primevue/message'
import Accordion from 'primevue/accordion'
import AccordionTab from 'primevue/accordiontab'
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

// Icônes pour les services
const getServiceIcon = (serviceName: string): string => {
  const name = serviceName.toLowerCase()
  if (name.includes('performance') || name.includes('real')) return 'pi pi-chart-line'
  if (name.includes('test')) return 'pi pi-cog'
  if (name.includes('delete')) return 'pi pi-trash'
  return 'pi pi-server'
}

// Icônes pour les types de métriques
const getTypeIcon = (metricType: string): string => {
  const type = metricType.toLowerCase()
  if (type === 'number') return 'pi pi-hashtag'
  if (type === 'average' || type === 'avg') return 'pi pi-chart-line'
  if (type === 'max' || type === 'maximum') return 'pi pi-arrow-up'
  if (type === 'min' || type === 'minimum') return 'pi pi-arrow-down'
  if (type === 'count' || type === 'counter') return 'pi pi-calculator'
  if (type === 'sum' || type === 'total') return 'pi pi-plus-circle'
  if (type === 'rate' || type === 'ratio') return 'pi pi-percentage'
  if (type === 'time' || type === 'duration') return 'pi pi-clock'
  if (type === 'size' || type === 'bytes' || type === 'memory') return 'pi pi-database'
  if (type === 'error' || type === 'exception') return 'pi pi-exclamation-triangle'
  return 'pi pi-chart-bar'
}

// Couleurs de background pour les types de métriques
const getTypeBackground = (metricType: string): string => {
  const type = metricType.toLowerCase()
  if (type === 'number') return 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
  if (type === 'average' || type === 'avg') return 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
  if (type === 'max' || type === 'maximum') return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
  if (type === 'min' || type === 'minimum') return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
  if (type === 'count' || type === 'counter') return 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
  if (type === 'sum' || type === 'total') return 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)'
  if (type === 'rate' || type === 'ratio') return 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)'
  if (type === 'time' || type === 'duration') return 'linear-gradient(135deg, #84cc16 0%, #65a30d 100%)'
  if (type === 'size' || type === 'bytes' || type === 'memory') return 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)'
  if (type === 'error' || type === 'exception') return 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
  return 'linear-gradient(135deg, #64748b 0%, #475569 100%)'
}

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
        <!-- Accordion pour chaque service -->
        <div class="col-12">
          <Accordion :activeIndex="[0]" class="mb-4">
            <AccordionTab 
              v-for="(serviceMetrics, serviceName) in groupedMetrics" 
              :key="serviceName"
              class="service-accordion"
            >
              <template #header>
                <div class="flex align-items-center gap-2 w-full">
                  <div class="flex align-items-center justify-content-center border-circle" 
                       style="width: 2.5rem; height: 2.5rem; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white;">
                    <i :class="getServiceIcon(String(serviceName))" class="text-sm"></i>
                  </div>
                  <div class="flex flex-column">
                    <span class="font-semibold text-900">{{ String(serviceName).replace('_', ' ') }}</span>
                    <small class="text-500">{{ Object.values(serviceMetrics).flat().length }} métriques au total</small>
                  </div>
                </div>
              </template>
              
              <!-- Accordion secondaire pour les types de métriques -->
              <Accordion :activeIndex="[0]" class="mt-3">
                <AccordionTab 
                  v-for="(typeMetrics, metricType) in serviceMetrics" 
                  :key="`${serviceName}-${metricType}`"
                  class="type-accordion"
                >
                  <template #header>
                    <div class="flex align-items-center gap-2 w-full">
                      <div class="flex align-items-center justify-content-center border-circle" 
                           style="width: 2rem; height: 2rem;"
                           :style="`background: ${getTypeBackground(String(metricType))}; color: white;`">
                        <i :class="getTypeIcon(String(metricType))" class="text-xs"></i>
                      </div>
                      <div class="flex flex-column">
                        <span class="font-medium text-800">{{ metricType }}</span>
                        <small class="text-500">{{ typeMetrics.length }} éléments</small>
                      </div>
                    </div>
                  </template>
                  <!-- Grille des métriques -->
                  <div class="grid mt-3">
                    <div class="col-12 sm:col-6 md:col-4 lg:col-3" v-for="(metric, i) in typeMetrics" :key="`${serviceName}-${metricType}-${i}`">
                      <MetricCard 
                        :name="metric.name" 
                        :value="metric.value" 
                        :type="metric.type" 
                        :variant="String(serviceName)" 
                      />
                    </div>
                  </div>
                </AccordionTab>
              </Accordion>
            </AccordionTab>
          </Accordion>
        </div>
      </template>

      <Message v-if="!loading && allServicesData.length === 0" severity="info" :closable="false">
        Aucune métrique disponible.
      </Message>
    </div>
  </div>
</template>
