<script setup lang="ts">
import { ref } from 'vue'
import MetricsGrid from './components/MetricsGrid.vue'
import MetricsOverview from './components/MetricsOverview.vue'
import MetricsTreeTable from './components/MetricsTreeTable.vue'
import FileExplorer from './components/FileExplorer.vue'
import AdvancedTreeTable from './components/AdvancedTreeTable.vue'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
</script>

<template>
  <div class="min-h-screen surface-ground">
    <div class="max-w-7xl mx-auto p-3">
      <header class="flex align-items-center justify-content-between py-4 mb-4">
        <div class="flex align-items-center gap-3">
          <i class="pi pi-chart-line text-primary text-3xl"></i>
          <h1 class="text-3xl font-bold text-900 m-0">FrontMetrics</h1>
        </div>
        <div class="flex align-items-center gap-2">
          <i class="pi pi-server text-600"></i>
          <span class="text-600 font-medium">Services de métriques</span>
        </div>
      </header>
      
      <TabView>
        <TabPanel value="0" header="Par service">
          <template #header>
            <i class="pi pi-filter mr-2"></i>
            <span>Par service</span>
          </template>
          <MetricsGrid />
        </TabPanel>
        
        <TabPanel value="1" header="Vue d'ensemble">
          <template #header>
            <i class="pi pi-chart-bar mr-2"></i>
            <span>Vue d'ensemble</span>
          </template>
          <MetricsOverview />
        </TabPanel>

        <TabPanel value="2" header="Métriques Tree">
          <template #header>
            <i class="pi pi-sitemap mr-2"></i>
            <span>Tree Simple</span>
          </template>
          <MetricsTreeTable />
        </TabPanel>

        <TabPanel value="3" header="Explorateur">
          <template #header>
            <i class="pi pi-folder mr-2"></i>
            <span>Fichiers</span>
          </template>
          <FileExplorer />
        </TabPanel>

        <TabPanel value="4" header="Tree Avancée">
          <template #header>
            <i class="pi pi-table mr-2"></i>
            <span>Tree + Badges</span>
          </template>
          <AdvancedTreeTable />
        </TabPanel>
      </TabView>
    </div>
  </div>
</template>

<style>
:root {
  --app-max-w: 80rem;
}
html, body, #app { height: 100%; }
body { margin: 0; }

.p-tabview .p-tabview-panels {
  padding: 0;
}
</style>
