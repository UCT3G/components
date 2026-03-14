<template>
  <div class="dashboard-tile h-100 d-flex flex-column bg-white rounded-3 shadow-sm border overflow-hidden">
    <!-- Header del Tile -->
    <div class="tile-header p-2 d-flex align-items-center justify-content-between border-bottom bg-light-subtle">
        <div class="d-flex align-items-center overflow-hidden">
            
            <span class="small fw-bold text-dark text-truncate" :title="config.name || 'Sin título'">
                {{ config.name || 'Sin título' }}
            </span>
        </div>
        <div class="tile-actions d-flex gap-1">
            <button class="btn btn-xs btn-link text-muted p-0" @click="$emit('edit')">
               
            </button>
            <button class="btn btn-xs btn-link text-muted p-0" title="Ver Datos">
               
            </button>
        </div>
    </div>

    <!-- Chart Body -->
    <div class="tile-body flex-grow-1 p-2 overflow-hidden position-relative">
        <EChartsVisualizer 
            v-if="chartOption && Object.keys(chartOption).length > 0"
            :option="chartOption" 
            class="h-100 w-100"
        />
        <!-- Empty/Loading State -->
        <div v-else class="d-flex align-items-center justify-content-center h-100 opacity-25">
            
        </div>
    </div>

    <!-- Footer del Tile (Metadata) -->
    <div class="tile-footer px-2 py-1 bg-light-subtle border-top d-flex justify-content-between align-items-center">
        <span class="x-small text-muted text-uppercase fw-bold">{{ config.config?.tableName }}</span>
        <span class="badge bg-white text-muted border x-small">{{ config.config?.visualizationType }}</span>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, watch, onMounted, computed } from 'vue';
import { useStore } from 'vuex';
import EChartsVisualizer from './EChartsVisualizer.vue';
import { useDataCharts } from '@/components/DataCharts/composables/useDataCharts.js';

export default defineComponent({
  name: 'DashboardTile',
  components: { EChartsVisualizer },
  props: {
    // Configuración de visualización heredada del Explorador
    config: {
      type: Object,
      required: true
    },
    // Filtros que vienen desde el Dashboard padre
    globalFilters: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props) {
    const store = useStore();
    // Reutilizamos la lógica de creación de opciones del explorador
    const { createStaticOption } = useDataCharts();
    const chartOption = ref({}); // Opción final que se pasa al visualizador

    // Determina el icono decorativo basándose en el tipo de gráfica
    const getIconClass = computed(() => {
        const type = props.config.config?.visualizationType;
        if (type === 'bar') return 'bi bi-bar-chart-fill';
        if (type === 'line') return 'bi bi-graph-up';
        if (type === 'radar') return 'bi bi-pentagon-fill';
        return 'bi bi-pie-chart-fill';
    });

    /**
     * PROCESO DE DATOS: 
     * 1. Busca los datos vivos en el store de Vuex.
     * 2. Aplica los filtros globales que recibe del DashBoard.
     * 3. Genera la opción de ECharts para el mosaico.
     */
    const processChartData = () => {
        const cfg = props.config.config;
        if (!cfg || !cfg.tableName) return;

        // Recuperar registros actuales de la tabla por su nombre
        const tablaData = store.getters['reporteador/getTablaPorNombre'](cfg.tableName);
        if (!tablaData || !tablaData.registros) return;

        let data = [...tablaData.registros];

        // --- APLICACIÓN DE FILTROS GLOBALES ---
        // Filtramos los registros fila por fila comprobando si coinciden con los filtros del DashBoard.
        if (props.globalFilters && Object.keys(props.globalFilters).length > 0) {
            data = data.filter(r => {
                return Object.entries(props.globalFilters).every(([key, value]) => {
                    // Si el filtro no tiene valor, no filtramos por ese campo
                    if (value === null || value === undefined || value === '') return true;
                    // Comprobación simple de igualdad convirtiendo a String
                    return String(r[key]) === String(value);
                });
            });
        }

        const allKeys = data.length > 0 ? Object.keys(data[0]).filter(k => !k.startsWith('ignorar_')) : [];
        // Transformar los datos filtrados en una gráfica estática
        chartOption.value = createStaticOption(data, props.config.name, cfg, allKeys);
    };

    // Re-procesar la gráfica si los filtros globales del dashboard cambian
    watch(() => props.globalFilters, processChartData, { deep: true });
    
    // Si la data en el Store central de Vuex cambia (ej. por un refresh), actualizamos el mosaico
    const tableDataInStore = computed(() => store.getters['reporteador/getTablaPorNombre'](props.config.config?.tableName));
    watch(tableDataInStore, processChartData, { deep: true });

    onMounted(processChartData);

    return { chartOption, getIconClass };
  }
});
</script>

<style scoped>
.dashboard-tile {
  transition: box-shadow 0.3s ease;
}
.dashboard-tile:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
}
.x-small { font-size: 0.65rem; }
.tile-header {
    height: 35px;
}
.btn-xs {
    padding: 0 4px;
    font-size: 0.75rem;
}
</style>
