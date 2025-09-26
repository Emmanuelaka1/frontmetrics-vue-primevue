<script setup lang="ts">
import { ref } from 'vue'
import MetricsGrid from './components/MetricsGrid.vue'
import MetricsOverview from './components/MetricsOverview.vue'
import MetricsTreeTable from './components/MetricsTreeTable.vue'
import FileExplorer from './components/FileExplorer.vue'
import AdvancedTreeTable from './components/AdvancedTreeTable.vue'
import PremiumTreeTable from './components/PremiumTreeTable.vue'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
</script>

<template>
  <div class="min-h-screen" style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);">
    <div class="max-w-7xl mx-auto p-4">
      <header class="app-header flex align-items-center justify-content-between py-6 px-6 mb-6 border-round-2xl">
        <div class="flex align-items-center gap-4">
          <div class="flex align-items-center justify-content-center w-3rem h-3rem border-round-2xl" 
               style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); box-shadow: 0 8px 32px rgba(16, 185, 129, 0.3);">
            <i class="pi pi-chart-line text-white text-xl"></i>
          </div>
          <div>
            <h1 class="app-title text-4xl font-bold m-0">FrontMetrics</h1>
            <p class="app-subtitle m-0 mt-1">Dashboard des métriques de performance</p>
          </div>
        </div>
        <div class="flex align-items-center gap-3 px-4 py-2 border-round-xl" 
             style="background: var(--surface-100); border: 1px solid var(--border-color);">
          <i class="pi pi-server text-primary"></i>
          <span class="app-subtitle font-semibold">Services connectés</span>
        </div>
      </header>
      
      <div class="surface-card border-round-2xl overflow-hidden" 
           style="box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08); border: 1px solid var(--border-color);">
        <TabView>
          <TabPanel value="0">
            <template #header>
              <i class="pi pi-filter mr-2"></i>
              <span>Par service</span>
            </template>
            <MetricsGrid />
          </TabPanel>
          
          <TabPanel value="1">
            <template #header>
              <i class="pi pi-chart-bar mr-2"></i>
              <span>Vue d'ensemble</span>
            </template>
            <MetricsOverview />
          </TabPanel>

          <TabPanel value="2">
            <template #header>
              <i class="pi pi-sitemap mr-2"></i>
              <span>Tree Simple</span>
            </template>
            <MetricsTreeTable />
          </TabPanel>

          <TabPanel value="3">
            <template #header>
              <i class="pi pi-folder mr-2"></i>
              <span>Explorateur</span>
            </template>
            <FileExplorer />
          </TabPanel>

          <TabPanel value="4">
            <template #header>
              <i class="pi pi-table mr-2"></i>
              <span>Tree Avancée</span>
            </template>
            <AdvancedTreeTable />
          </TabPanel>

          <TabPanel value="5">
            <template #header>
              <i class="pi pi-star mr-2"></i>
              <span>Premium Design</span>
            </template>
            <PremiumTreeTable />
          </TabPanel>
        </TabView>
      </div>
    </div>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

:root {
  --app-max-w: 80rem;
  --primary-color: #10b981;
  --primary-color-text: #ffffff;
  --surface-0: #ffffff;
  --surface-50: #f9fafb;
  --surface-100: #f3f4f6;
  --surface-200: #e5e7eb;
  --surface-300: #d1d5db;
  --text-color: #111827;
  --text-color-secondary: #6b7280;
  --border-color: #e5e7eb;
}

[data-theme="dark"] {
  --surface-0: #0f172a;
  --surface-50: #1e293b;
  --surface-100: #334155;
  --surface-200: #475569;
  --surface-300: #64748b;
  --text-color: #f8fafc;
  --text-color-secondary: #cbd5e1;
  --border-color: #475569;
}

* {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

html, body, #app { 
  height: 100%; 
  margin: 0;
  background-color: var(--surface-50);
  color: var(--text-color);
  line-height: 1.6;
}

body { 
  margin: 0; 
  font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
  font-variation-settings: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Amélioration des onglets */
.p-tabview .p-tabview-panels {
  padding: 0;
  background: transparent;
}

.p-tabview .p-tabview-nav {
  background: var(--surface-0);
  border: 1px solid var(--border-color);
  border-radius: 12px 12px 0 0;
  padding: 0.5rem;
}

.p-tabview .p-tabview-nav li .p-tabview-nav-link {
  border: none;
  background: transparent;
  color: var(--text-color-secondary);
  font-weight: 500;
  font-size: 0.875rem;
  padding: 0.75rem 1.5rem;
  margin: 0 0.25rem;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.p-tabview .p-tabview-nav li:not(.p-highlight) .p-tabview-nav-link:hover {
  background: var(--surface-100);
  color: var(--text-color);
}

.p-tabview .p-tabview-nav li.p-highlight .p-tabview-nav-link {
  background: var(--primary-color);
  color: white;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
}

/* Header amélioré */
.app-header {
  background: linear-gradient(135deg, var(--surface-0) 0%, var(--surface-50) 100%);
  border-bottom: 1px solid var(--border-color);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.app-title {
  background: linear-gradient(135deg, var(--primary-color) 0%, #059669 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 700;
  letter-spacing: -0.025em;
}

.app-subtitle {
  color: var(--text-color-secondary);
  font-weight: 500;
  font-size: 0.875rem;
}
</style>
