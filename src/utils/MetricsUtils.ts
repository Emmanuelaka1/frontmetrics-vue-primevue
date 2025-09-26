export interface MetricConfig {
  icon: string
  background: string
  shadow: string
}

export class MetricsUtils {
  /**
   * Retourne la configuration (icône, background, ombre) pour un type de métrique donné
   * @param name - Le nom de la métrique
   * @returns Configuration avec icon, background et shadow
   */
  static getMetricConfig(name?: string): MetricConfig {
    const nameStr = name?.toLowerCase().trim() || ''
    
    // Configuration pour Number (strict match)
    if (nameStr === 'number') {
      return { 
        icon: 'pi pi-hashtag', 
        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', 
        shadow: 'rgba(59, 130, 246, 0.25)' 
      }
    }
    
    // Configuration pour Average
    if (nameStr === 'average' || nameStr === 'avg') {
      return { 
        icon: 'pi pi-chart-line', 
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
        shadow: 'rgba(16, 185, 129, 0.25)' 
      }
    }
    
    // Configuration pour Max
    if (nameStr === 'max' || nameStr === 'maximum') {
      return { 
        icon: 'pi pi-arrow-up', 
        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', 
        shadow: 'rgba(239, 68, 68, 0.25)' 
      }
    }
    
    // Configuration pour Min
    if (nameStr === 'min' || nameStr === 'minimum') {
      return { 
        icon: 'pi pi-arrow-down', 
        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', 
        shadow: 'rgba(245, 158, 11, 0.25)' 
      }
    }
    
    // Configuration pour Count
    if (nameStr === 'count' || nameStr === 'counter') {
      return { 
        icon: 'pi pi-calculator', 
        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', 
        shadow: 'rgba(139, 92, 246, 0.25)' 
      }
    }
    
    // Configuration pour Sum
    if (nameStr === 'sum' || nameStr === 'total') {
      return { 
        icon: 'pi pi-plus-circle', 
        background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)', 
        shadow: 'rgba(6, 182, 212, 0.25)' 
      }
    }
    
    // Configuration pour Rate
    if (nameStr === 'rate' || nameStr === 'ratio') {
      return { 
        icon: 'pi pi-percentage', 
        background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)', 
        shadow: 'rgba(236, 72, 153, 0.25)' 
      }
    }
    
    // Configuration pour Time
    if (nameStr === 'time' || nameStr === 'duration') {
      return { 
        icon: 'pi pi-clock', 
        background: 'linear-gradient(135deg, #84cc16 0%, #65a30d 100%)', 
        shadow: 'rgba(132, 204, 22, 0.25)' 
      }
    }
    
    // Configuration pour Size/Memory
    if (nameStr === 'size' || nameStr === 'bytes' || nameStr === 'memory') {
      return { 
        icon: 'pi pi-database', 
        background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', 
        shadow: 'rgba(249, 115, 22, 0.25)' 
      }
    }
    
    // Configuration pour Error
    if (nameStr === 'error' || nameStr === 'exception') {
      return { 
        icon: 'pi pi-exclamation-triangle', 
        background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)', 
        shadow: 'rgba(220, 38, 38, 0.25)' 
      }
    }
    
    // Type par défaut
    return { 
      icon: 'pi pi-chart-bar', 
      background: 'linear-gradient(135deg, #64748b 0%, #475569 100%)', 
      shadow: 'rgba(100, 116, 139, 0.25)' 
    }
  }

  /**
   * Retourne la sévérité d'un badge basée sur le type de métrique
   * @param type - Le type de la métrique
   * @returns Sévérité pour le badge PrimeVue
   */
  static getBadgeSeverity(type?: string): 'success' | 'info' | 'warning' | 'danger' {
    const typeStr = type?.toLowerCase() || ''
    
    if (typeStr.includes('error')) return 'danger'
    if (typeStr.includes('delete')) return 'warning'
    if (typeStr.includes('fast') || typeStr.includes('performance')) return 'success'
    return 'info'
  }

  /**
   * Retourne la sévérité d'un badge pour un service
   * @param serviceName - Le nom du service
   * @returns Sévérité pour le badge PrimeVue
   */
  static getServiceBadgeSeverity(serviceName: string): 'success' | 'info' | 'warning' | 'danger' {
    if (serviceName.includes('PERFORMANCE')) return 'success'
    if (serviceName.includes('DELETE')) return 'warning'
    return 'info'
  }
}