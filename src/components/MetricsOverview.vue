<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MetricCard from './MetricCard.vue'
import Skeleton from 'primevue/skeleton'
import Message from 'primevue/message'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Badge from 'primevue/badge'
import { fetchAllMetrics, type RawMetric } from '../api'

const loading = ref(true)
const error = ref<string | null>(null)
const allMetrics = ref<{ typeCarte: string; metrics: RawMetric[] }[]>([])

const loadAllMetrics = async () => {
  loading.value = true
  error.value = null
  try {
    allMetrics.value = await fetchAllMetrics()
  } catch (e: any) {
    error.value = e?.message ?? 'Erreur lors du chargement de toutes les métriques'
    console.error('Erreur lors du chargement:', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadAllMetrics()
})

const refresh = () => {
  loadAllMetrics()
}
</script>

<template>
  <div class="p-3">
    <div class="flex justify-content-between align-items-center mb-4">
      <h2>Vue d'ensemble des métriques</h2>
      <Button 
        icon="pi pi-refresh" 
        @click="refresh"
        :loading="loading"
        outlined
        size="small"
        label="Actualiser"
      />
    </div>

    <Message v-if="error" severity="error" :closable="false" class="mb-3">
      {{ error }}
    </Message>

    <div v-else>
      <div v-if="loading" class="grid">
        <div class="col-12 lg:col-6" v-for="n in 2" :key="n">
          <Card class="mb-3">
            <template #title>
              <Skeleton width="200px" height="30px" />
            </template>
            <template #content>
              <div class="grid">
                <div class="col-12 md:col-6" v-for="m in 4" :key="m">
                  <Skeleton height="8rem" class="border-round-2xl" />
                </div>
              </div>
            </template>
          </Card>
        </div>
      </div>

      <div v-else class="grid">
        <div 
          v-for="serviceMetrics in allMetrics" 
          :key="serviceMetrics.typeCarte"
          class="col-12 lg:col-6"
        >
          <Card class="mb-3">
            <template #title>
              <div class="flex align-items-center gap-2">
                <i class="pi pi-chart-line text-primary"></i>
                {{ serviceMetrics.typeCarte.replace('_', ' ') }}
                <Badge 
                  :value="serviceMetrics.metrics.length" 
                  severity="info"
                />
              </div>
            </template>
            
            <template #content>
              <div class="grid">
                <div 
                  v-for="(metric, index) in serviceMetrics.metrics" 
                  :key="index"
                  class="col-12 md:col-6"
                >
                  <MetricCard 
                    :name="metric.name" 
                    :value="metric.value" 
                    :type="metric.type"
                    :variant="serviceMetrics.typeCarte"
                    size="small"
                  />
                </div>
              </div>
            </template>
          </Card>
        </div>
      </div>

      <Message v-if="!loading && allMetrics.length === 0" severity="info" :closable="false">
        Aucune métrique disponible.
      </Message>
    </div>
  </div>
</template>