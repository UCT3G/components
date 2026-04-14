<template>
  <div class="data-visualizer p-0 d-flex overflow-hidden">
    <!-- Panel de Control Lateral -->
    <ChartsConfig 
      :collapsed="sidebarCollapsed"
      :availableTables="filteredAvailableTables"
      :availableColumns="availableColumns"
      v-model:selectedTableName="selectedTableName"
      v-model:isChartMode="isChartMode"
      v-model:visualizationType="visualizationType"
      v-model:xAxisColumn="xAxisColumn"
      v-model:yAxisColumns="yAxisColumns"
      v-model:groupByColumn="groupByColumn"
      v-model:subGroupByColumn="subGroupByColumn"
      v-model:dimensionColumn="dimensionColumn"
      v-model:valueColumn="valueColumn"
      v-model:activeConfigKey="activeConfigKey"
      v-model:seriesConfigs="seriesConfigs"
      v-model:configs="configs"
      v-model:maxRecords="maxRecords"
      :currentYCols="currentYCols"
      :availableConfigKeys="availableConfigKeys"
      :tableLocked="!!fixedTableName"
      :resetConfigToGlobal="resetConfigToGlobal"
      @refresh="onRefresh"
    />

    <!-- Área de Contenido Principal -->
    <div class="data-content flex-grow-1 p-0 d-flex flex-column bg-light overflow-hidden">
      <!-- Barra de Estado / Cabecera -->
      <VisualizerHeader 
        v-if="selectedTableName"
        v-model:isChartMode="isChartMode"
        :selectedTableName="selectedTableName"
        :groupByColumn="groupByColumn"
        :subGroupByColumn="subGroupByColumn"
        :activeView="activeView"
        :currentPermission="currentPermission"
        :savedViews="savedViews"
        @toggle-sidebar="sidebarCollapsed = !sidebarCollapsed"
        @save-request="handleSaveRequest"
        @load-view="loadView"
        @reset-view="resetToNew"
        @delete-view="handleDeleteView"
        @share-view="showShareModal = true"
      />

      <!-- Workspace -->
      <VisualizerWorkspace 
        :selectedTableName="selectedTableName"
        :isChartMode="isChartMode"
        :chartSections="chartSections"
        :chartOptions="chartOptions"
        :chartOption="chartOption"
        :tableBase="tableBase"
        :externalDataTrigger="effectiveTrigger"
        @open-sidebar="sidebarCollapsed = false"
        @data-loaded="onDataLoaded"
        @clicked="sidebarCollapsed = true"
      >
        <template #header="slotProps">
          <slot name="header" v-bind="slotProps"></slot>
        </template>
      </VisualizerWorkspace>
    </div>

    <!-- Modal para guardar vista -->
    <PopUpSolido
      :visible="showSaveModal"
      @update:visible="showSaveModal = $event"
      size="small"
      titulo="Guardar Vista"
    >
      <VisualizerForm 
        v-model="newViewName"
        :activeView="activeView"
        :currentPermission="currentPermission"
        @confirm-save="confirmSave"
        @confirm-update="confirmUpdate"
      />
    </PopUpSolido>

    <!-- Modal Compartir -->
    <PopUpSolido
      :visible="showShareModal"
      @update:visible="showShareModal = $event"
      size="small"
      titulo="Compartir Vista"
    >
      <VisualizerShare 
        v-if="activeView"
        :view="activeView"
        :currentPermission="currentPermission"
        @shared="showShareModal = false"
      />
    </PopUpSolido>

    <!-- Modal Confirmación Eliminar -->
    <PopUpSolido
      :visible="showDeleteModal"
      @update:visible="showDeleteModal = $event"
      size="small"
      titulo="Eliminar Vista"
      :confirm="true"
      :confirmFunction="confirmDelete"
    >
      <p class="mb-0">¿Estás seguro de que deseas eliminar la vista <strong>"{{ viewToDelete?.nombre }}"</strong>?</p>
    </PopUpSolido>
  </div>
</template>

<script>
import { defineComponent, ref, watch, computed, onMounted, nextTick } from 'vue';
import { useStore } from 'vuex';
import ChartsConfig from '../ChartsConfig/ChartsConfig.vue';
import VisualizerHeader from './VisualizerHeader.vue';
import VisualizerWorkspace from './VisualizerWorkspace.vue';
import VisualizerForm from './VisualizerForm.vue';
import VisualizerShare from './VisualizerShare.vue';
import { useDataCharts } from '@/components/DataCharts/composables/useDataCharts.js';
import PopUpSolido from "@/components/Modal/ModalSolid.vue";

export default defineComponent({
  name: 'DataVisualizer',
  components: {
    ChartsConfig,
    VisualizerHeader,
    VisualizerWorkspace,
    VisualizerForm,
    VisualizerShare,
    PopUpSolido
  },
  props: {
      // Nombre de la tabla fija (opcional, si no se quiere permitir selección manual)
      fixedTableName: { type: String, default: null },
      // Disparador de carga manual desde el componente padre
      externalDataTrigger: { type: Boolean, default: false },
      // Parámetros automáticos para inyectar en json_tabla.data (ej: [id_sucursal])
      tableParams: { type: Array, default: null },
      // Lista de tablas permitidas para el selector lateral
      allowedTables: { type: Array, default: null }
  },
  emits: ['load-view'],
  setup(props, { emit }) {
    const store = useStore();
    const sidebarCollapsed = ref(true);
    const showSaveModal = ref(false);
    const showShareModal = ref(false);
    const showDeleteModal = ref(false);
    const viewToDelete = ref(null);
    const newViewName = ref('');
    const internalTrigger = ref(false); // Disparador interno para recargas automáticas (vía tableParams)

    /**
     * effectiveTrigger: Combina el trigger externo (proporcionado por el padre)
     * con el interno (gestionado por cambios en tableParams).
     */
    const effectiveTrigger = computed(() => props.externalDataTrigger || internalTrigger.value);

    // Obtiene las vistas guardadas desde el store de DataCharts
    const savedViews = computed(() => store.getters['DataCharts/getVistas']);

    const { 
      selectedTableName, tableBase, isChartMode, chartOption, chartOptions, chartSections,
      visualizationType, xAxisColumn, yAxisColumns, groupByColumn, subGroupByColumn,
      dimensionColumn, valueColumn, maxRecords,
      activeConfigKey, availableConfigKeys, configs, seriesConfigs, currentYCols,
      activeView, currentPermission, availableTables, selectDataTable, resetToNew, generateEChartsOption,
      getSerializableConfig, applySavedConfig, resetConfigToGlobal
    } = useDataCharts();

    const availableColumns = computed(() => {
        const tableData = store.getters['reporteador/getTablaPorNombre'](selectedTableName.value);
        if (!tableData || !tableData.registros || tableData.registros.length === 0) return [];
        return Object.keys(tableData.registros[0]).filter(k => !k.startsWith('ignorar_'));
    });

    const filteredAvailableTables = computed(() => {
        if (!props.allowedTables || props.allowedTables.length === 0) return availableTables.value;
        return availableTables.value.filter(t => props.allowedTables.includes(t));
    });

    const onRefresh = () => updateChart();
    
    const handleSaveRequest = () => {
        if (!selectedTableName.value) return;
        newViewName.value = activeView.value 
            ? activeView.value.nombre 
            : `Análisis ${selectedTableName.value} - ${new Date().toLocaleDateString()}`;
        showSaveModal.value = true;
    };

    const confirmSave = async () => {
        if (!newViewName.value.trim()) return;
        await store.dispatch("DataCharts/saveVista", {
            token: store.state.user.token,
            payload: { 
                name: newViewName.value, 
                referencia_tabla: selectedTableName.value,
                config: getSerializableConfig() 
            }
        });
        showSaveModal.value = false;
    };

    const confirmUpdate = async () => {
        if (!activeView.value) return;
        await store.dispatch("DataCharts/updateVista", {
            token: store.state.user.token,
            payload: { 
                id_vista: activeView.value.id_vista, 
                name: newViewName.value, 
                referencia_tabla: selectedTableName.value,
                config: getSerializableConfig() 
            }
        });
        activeView.value.nombre = newViewName.value;
        showSaveModal.value = false;
    };

    const handleDeleteView = (view) => {
        if (!view) return;
        viewToDelete.value = view;
        showDeleteModal.value = true;
    };

    const confirmDelete = async () => {
        if (!viewToDelete.value) return;
        
        await store.dispatch("DataCharts/deleteVista", {
            token: store.state.user.token,
            payload: { 
                id_vista: viewToDelete.value.id_vista, 
                referencia_tabla: selectedTableName.value 
            }
        });

        // Si la vista eliminada era la activa, volvemos a exploración libre
        if (activeView.value && activeView.value.id_vista === viewToDelete.value.id_vista) {
            resetToNew();
        }

        showDeleteModal.value = false;
        viewToDelete.value = null;
    };

    const loadView = async (view) => {
        if (!view || !view.config_json) return;
        const config = typeof view.config_json === 'string' ? JSON.parse(view.config_json) : view.config_json;
        await applySavedConfig(config, view);
        emit('load-view', view);
    };

    const updateChart = () => {
        const tablaData = store.getters['reporteador/getTablaPorNombre'](selectedTableName.value);
        if (tablaData && tablaData.registros) generateEChartsOption({ registros: tablaData.registros });
    };

    const onDataLoaded = () => updateChart();

    /**
     * Inyecta los parámetros proporcionados en el json_tabla de la tabla indicada
     * y dispara la recarga de datos en el componente TablaDinamica.
     */
    const applyTableParamsToStore = (tableName, params) => {
      if (!tableName || !params) return;
      const tabla = store.getters['reporteador/getTablaPorNombre'](tableName);
      if (!tabla || !tabla.json_tabla) return;
      
      try {
        const json = JSON.parse(tabla.json_tabla);
        // Evitamos recargas infinitas comparando el estado actual con el nuevo
        const currentDataStr = JSON.stringify(json.data || []);
        const newParamsStr = JSON.stringify(params);
        
        if (currentDataStr !== newParamsStr || json.fin !== maxRecords.value) {
          json.data = [...params];
          json.fin = maxRecords.value;
          json.no_filas = maxRecords.value;
          tabla.json_tabla = JSON.stringify(json);
          
          // Reseteamos y encendemos el disparador para forzar el fetch en el Workspace
          internalTrigger.value = false;
          nextTick(() => { 
            // Verificamos que sigamos en la misma tabla antes de disparar
            if (selectedTableName.value === tableName) {
              internalTrigger.value = true; 
            }
          });
        } else if (internalTrigger.value === false) {
           // Si los parámetros ya coinciden pero el trigger está apagado, lo encendemos
           nextTick(() => { internalTrigger.value = true; });
        }
      } catch (e) {
        console.error('[DataVisualizer] Error al aplicar tableParams:', e);
      }
    };

    /**
     * Vigila cambios en la tabla seleccionada.
     * Al cambiar de tabla, se asegura de aplicar los parámetros actuales antes de cargar.
     */
    watch(selectedTableName, async (newVal) => { 
      if (newVal) {
        internalTrigger.value = false; // Bloqueamos carga mientras se realiza el cambio
        await selectDataTable(newVal); 

        // Cargar vistas automáticas para la nueva tabla seleccionada
        store.dispatch('DataCharts/getVistas', {
          token: store.state.user.token,
          referencia_tabla: newVal,
        });

        if (props.tableParams) {
          applyTableParamsToStore(newVal, props.tableParams);
        } else {
          // Si no hay parámetros automáticos, activamos el trigger para carga normal
          nextTick(() => { internalTrigger.value = true; });
        }
      }
    }, { immediate: true });
    
    watch([configs, activeConfigKey, isChartMode, groupByColumn, dimensionColumn, valueColumn], () => { if (isChartMode.value) updateChart(); }, { deep: true });

    if (props.fixedTableName) selectDataTable(props.fixedTableName);

    /**
     */
    onMounted(() => {});

    /**
     * Watcher para tableParams:
     * Cuando el padre cambia los parámetros (ej: seleccionar otra sucursal),
     * estos se inyectan automáticamente en la tabla activa del store.
     */
    watch(() => props.tableParams, (newParams) => {
      applyTableParamsToStore(selectedTableName.value, newParams);
    }, { deep: true, immediate: true });

    watch(maxRecords, () => {
      applyTableParamsToStore(selectedTableName.value, props.tableParams);
    });

    return {
      selectedTableName, tableBase, isChartMode, chartOption, chartOptions, chartSections,
      visualizationType, xAxisColumn, yAxisColumns, groupByColumn, subGroupByColumn,
      dimensionColumn, valueColumn, maxRecords,
      activeConfigKey, availableConfigKeys, configs, seriesConfigs, currentYCols,
      availableTables, filteredAvailableTables, availableColumns, onRefresh, onDataLoaded, sidebarCollapsed,
      showSaveModal, newViewName, handleSaveRequest, confirmSave, confirmUpdate,
      loadView, handleDeleteView, confirmDelete, savedViews, activeView, currentPermission, resetToNew,
      showShareModal, showDeleteModal, viewToDelete, resetConfigToGlobal,
      internalTrigger, effectiveTrigger
    };
  }
});
</script>

<style scoped>
.data-visualizer{
    height: calc(100vh - 120px);
}
</style>
