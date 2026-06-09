<template>
  <div class="data-visualizer p-0 d-flex overflow-hidden" :style="{ height: height }">
    <!-- Panel de Control Lateral -->
    <ChartsConfig 
      v-if="usuarioAccesos.showSidebar"
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
      :maxRecordsLocked="maxRecordsLimit !== null"
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
        :readOnly="readOnly"
        :usuarioAccesos="usuarioAccesos"
        @toggle-sidebar="sidebarCollapsed = !sidebarCollapsed"
        @save-request="handleSaveRequest"
        @load-view="loadView"
        @reset-view="resetToNew"
        @delete-view="handleDeleteView"
        @share-view="showShareModal = true"
        @show-table="showTableModal = true"
        @configure="showConfigModal = true"
      />

      <!-- Workspace -->
      <VisualizerWorkspace 
        :selectedTableName="selectedTableName"
        :isChartMode="isChartMode"
        :chartSections="chartSections"
        :chartOptions="chartOptions"
        :chartOption="chartOption"
        :tableBase="tableBase"
        :height="height"
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

    <PopUpSolido
      :visible="showSaveModal"
      @update:visible="showSaveModal = $event"
      size="small"
      :titulo="activeView ? 'Actualizar Vista' : 'Guardar Vista'"
    >
      <VisualizerForm 
        v-model="newViewName"
        v-model:esPublica="esPublica"
        :activeView="activeView"
        :currentPermission="currentPermission"
        :usuarioAccesos="usuarioAccesos"
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

    <!-- Modal para ver tabla de datos en modo lectura (Expandido) -->
    <PopUpSolido
      :visible="showTableModal"
      @update:visible="showTableModal = $event"
      size="large"
      :titulo="'Explorar - ' + (selectedTableName || '')"
    >
      <div class="p-3 d-flex flex-column h-100">
        <!-- Control de Pestañas (Tabs) en el Modal -->
        <div class="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-3">
          <div class="text-muted small">
            Alterna entre la representación gráfica y el listado de datos detallados para explorar el análisis.
          </div>
          <TabButtons
            v-model="modalIsChartMode"
            :options="modalTabOptions"
          />
        </div>

        <!-- Reutilización del Workspace con Altura Controlada -->
        <div class="flex-grow-1 overflow-hidden" style="min-height: 450px;">
          <VisualizerWorkspace 
            :selectedTableName="selectedTableName"
            :isChartMode="modalIsChartMode"
            :chartSections="chartSections"
            :chartOptions="chartOptions"
            :chartOption="chartOption"
            :tableBase="tableBase"
            :externalDataTrigger="effectiveTrigger"
            @data-loaded="onDataLoaded"
          />
        </div>
      </div>
    </PopUpSolido>

    <!-- Modal de configuración para el Administrador (Autogestionado) -->
    <PopUpSolido
      :visible="showConfigModal"
      @update:visible="cerrarConfiguracionInterna"
      size="large"
      :titulo="'Configurar Visualización - ' + (selectedTableName || '')"
    >
      <div class="p-0">
        <DataVisualizer 
          :fixedTableName="selectedTableName"
          :readOnly="false"
          :defaultViewId="activeView?.id_vista"
        />
      </div>
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
import { useDataChartsPermisos } from '@/components/DataCharts/composables/useDataChartsPermisos.js';
import TablaDinamica from '@/components/TablaDinamica/TablaDinamica.vue';
import TabButtons from '@/components/TabsNav/TabButtons.vue';

export default defineComponent({
  name: 'DataVisualizer',
  components: {
    ChartsConfig,
    VisualizerHeader,
    VisualizerWorkspace,
    VisualizerForm,
    VisualizerShare,
    PopUpSolido,
    TablaDinamica,
    TabButtons
  },
  props: {
      // Nombre de la tabla fija (opcional, si no se quiere permitir selección manual)
      fixedTableName: { type: String, default: null },
      // Disparador de carga manual desde el componente padre
      externalDataTrigger: { type: Boolean, default: false },
      // Parámetros automáticos para inyectar en json_tabla.data (ej: [id_sucursal])
      tableParams: { type: Array, default: null },
      // Lista de tablas permitidas para el selector lateral
      allowedTables: { type: Array, default: null },
      // Límite máximo de registros bloqueado (manual)
      maxRecordsLimit: { type: Number, default: null },
      // Si la vista es de solo lectura para usuarios comunes
      readOnly: { type: Boolean, default: false },
      // ID de la vista a cargar automáticamente
      defaultViewId: { type: [Number, String], default: null },
      // Altura del visualizador
      height: { type: String, default: 'calc(100vh - 120px)' }
  },
  emits: ['load-view', 'configure'],
  setup(props, { emit }) {
    const store = useStore();
    const { isDataChartsAdmin } = useDataChartsPermisos();
    const sidebarCollapsed = ref(true);
    const showSaveModal = ref(false);
    const showShareModal = ref(false);
    const showDeleteModal = ref(false);
    const showTableModal = ref(false);
    const showConfigModal = ref(false);
    const viewToDelete = ref(null);
    const newViewName = ref('');
    const esPublica = ref(false);
    const internalTrigger = ref(false); // Disparador interno para recargas automáticas (vía tableParams)

    // Estado reactivo local para las pestañas del Modal
    const modalIsChartMode = ref(true);
    const modalTabOptions = [
      { label: 'Gráficas', value: true, icon: 'graph.svg' },
      { label: 'Datos', value: false, icon: 'UCT_ADMIN/listOL.svg' }
    ];

    // Restablecer la pestaña a "Gráficas" al abrir el modal
    watch(showTableModal, (newVal) => {
      if (newVal) {
        modalIsChartMode.value = true;
      }
    });

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

    // Control de accesos y permisos del usuario
    const usuarioAccesos = computed(() => {
      const isOwner = currentPermission.value === 'propietario';
      const canUpdate = !!activeView.value && currentPermission.value !== 'lectura';
      const canSaveAsNew = isDataChartsAdmin.value;
      const canPublish = isDataChartsAdmin.value;
      const showSidebar = isDataChartsAdmin.value && !props.readOnly;
      const showConfigButton = isDataChartsAdmin.value;
      const showSaveButton = !props.readOnly && ((isDataChartsAdmin.value && !activeView.value) || (activeView.value && currentPermission.value !== 'lectura'));

      return {
        isOwner,
        canUpdate,
        canSaveAsNew,
        canPublish,
        showSidebar,
        showConfigButton,
        showSaveButton,
      };
    });

    if (props.readOnly) {
      isChartMode.value = true;
    }

    watch(() => props.maxRecordsLimit, (newVal) => {
      if (newVal !== null) {
        maxRecords.value = newVal;
      }
    }, { immediate: true });

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
        esPublica.value = activeView.value ? !!activeView.value.es_publica : false;
        showSaveModal.value = true;
    };

    const confirmSave = async () => {
        if (!newViewName.value.trim()) return;
        const res = await store.dispatch("DataCharts/saveVista", {
            token: store.state.user.token,
            payload: { 
                name: newViewName.value, 
                referencia_tabla: selectedTableName.value,
                config: getSerializableConfig(),
                es_publica: esPublica.value
            }
        });

        if (res && res.id_vista) {
            const newView = savedViews.value.find(v => String(v.id_vista) === String(res.id_vista));
            if (newView) {
                await loadView(newView);
            }
        }

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
                config: getSerializableConfig(),
                es_publica: esPublica.value
            }
        });
        activeView.value.nombre = newViewName.value;
        activeView.value.es_publica = esPublica.value;
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

    const cerrarConfiguracionInterna = async (val) => {
      showConfigModal.value = val;
      if (!val) {
        // Al cerrar el modal de configuración, volvemos a consultar las vistas del store
        await store.dispatch('DataCharts/getVistas', {
          token: store.state.user.token,
          referencia_tabla: selectedTableName.value,
        });
        // Reseteamos el visualizador para forzar la recarga de la vista por defecto/pública
        resetToNew();
      }
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
      if (!tableName) return;
      const tabla = store.getters['reporteador/getTablaPorNombre'](tableName);
      if (!tabla || !tabla.json_tabla) return;
      
      try {
        const json = JSON.parse(tabla.json_tabla);
        // Evitamos recargas infinitas comparando el estado actual con el nuevo
        const currentDataStr = JSON.stringify(json.data || []);
        const newParamsStr = params ? JSON.stringify(params) : currentDataStr;
        
        if (currentDataStr !== newParamsStr || json.fin !== maxRecords.value) {
          if (params) {json.data = [...params];}
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

    // Watcher para auto-cargar la vista por defecto/pública cuando se obtienen las vistas
    watch(savedViews, async (newViews) => {
      if (!newViews || newViews.length === 0) return;
      if (activeView.value) return;

      if (props.defaultViewId) {
        const targetView = newViews.find(v => String(v.id_vista) === String(props.defaultViewId));
        if (targetView) {
          await loadView(targetView);
          return;
        }
      }

      if (props.readOnly) {
        const firstPublic = newViews.find(v => v.es_publica);
        if (firstPublic) {
          await loadView(firstPublic);
        }
      }
    }, { immediate: true });

    if (props.fixedTableName) selectDataTable(props.fixedTableName);
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
      selectedTableName, 
      tableBase, 
      isChartMode, 
      chartOption, 
      chartOptions, 
      chartSections,
      visualizationType, 
      xAxisColumn, 
      yAxisColumns, 
      groupByColumn, 
      subGroupByColumn,
      dimensionColumn, 
      valueColumn, 
      maxRecords,
      activeConfigKey, 
      availableConfigKeys, 
      configs, 
      seriesConfigs, 
      currentYCols,
      availableTables, 
      filteredAvailableTables, 
      availableColumns, 
      onRefresh, 
      onDataLoaded, 
      sidebarCollapsed,
      showSaveModal, 
      newViewName, 
      esPublica, 
      handleSaveRequest, 
      confirmSave, 
      confirmUpdate,
      loadView, 
      handleDeleteView, 
      confirmDelete, 
      savedViews, 
      activeView, 
      currentPermission, 
      resetToNew,
      showShareModal, 
      showDeleteModal, 
      viewToDelete, 
      resetConfigToGlobal,
      internalTrigger, 
      effectiveTrigger, 
      isDataChartsAdmin, 
      showTableModal,
      showConfigModal, 
      cerrarConfiguracionInterna,
      modalIsChartMode,
      modalTabOptions,
      usuarioAccesos
    };
  }
});
</script>

<style scoped>
.data-visualizer{
    height: calc(100vh - 120px);
}
</style>
