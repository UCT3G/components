<template>
  <PanelGeneral 
    :collapsed="collapsed"
    :tabs="['Consulta', 'Estilo']" 
    v-model:activeTab="activeTab"
    accordion
  >
    <!-- PESTAÑA 1: CONFIGURACIÓN DE LA CONSULTA -->
    <TabConsulta 
      v-show="activeTab === 'consulta'"
      :available-tables="availableTables"
      :selected-table-name="selectedTableName"
      :table-locked="tableLocked"
      :is-chart-mode="isChartMode"
      :x-axis-column="xAxisColumn"
      :y-axis-columns="yAxisColumns"
      :available-columns="availableColumns"
      :group-by-column="groupByColumn"
      :sub-group-by-column="subGroupByColumn"
      :dimension-column="dimensionColumn"
      :value-column="valueColumn"
      :max-records="maxRecords"
      @update:selected-table-name="handleUpdate('update:selectedTableName', $event)"
      @update:x-axis-column="handleUpdate('update:xAxisColumn', $event)"
      @update:y-axis-columns="handleUpdate('update:yAxisColumns', $event)"
      @update:group-by-column="handleUpdate('update:groupByColumn', $event)"
      @update:sub-group-by-column="handleUpdate('update:subGroupByColumn', $event)"
      @update:dimension-column="handleUpdate('update:dimensionColumn', $event)"
      @update:value-column="handleUpdate('update:valueColumn', $event)"
      @update:max-records="handleUpdate('update:maxRecords', $event)"
    />

    <!-- PESTAÑA: ESTILO -->
    <TabEstilo 
      v-show="activeTab === 'estilo'"
      :selected-table-name="selectedTableName"
      :available-config-keys="availableConfigKeys"
      :active-config-key="activeConfigKey"
      :configs="configs"
      :visualization-type="visualizationType"
      :is-chart-mode="isChartMode"
      :current-y-cols="currentYCols"
      :series-configs="seriesConfigs"
      @update:active-config-key="handleUpdate('update:activeConfigKey', $event)"
      @update:visualization-type="handleUpdate('update:visualizationType', $event)"
      @update:configs="handleUpdate('update:configs', $event)"
      @update:series-configs="handleUpdate('update:seriesConfigs', $event)"
      @reset-to-global="handleResetToGlobal"
    />
  </PanelGeneral>
</template>

<script>
import { defineComponent, ref } from 'vue';
import PanelGeneral from '@/components/PanelGeneral/PanelGeneral.vue';
import TabConsulta from './TabConsulta.vue';
import TabEstilo from './TabEstilo.vue';

export default defineComponent({
  name: 'ChartsConfig',
  components: {
    PanelGeneral,
    TabConsulta,
    TabEstilo
  },
  props: {
    collapsed: { type: Boolean, default: true },
    availableTables: Array,
    selectedTableName: String,
    isChartMode: Boolean,
    visualizationType: String,
    availableColumns: Array,
    xAxisColumn: String,
    yAxisColumns: Array,
    groupByColumn: String,
    subGroupByColumn: String,
    dimensionColumn: { type: String, default: null },
    valueColumn: { type: String, default: null },
    activeConfigKey: String,
    availableConfigKeys: Array,
    currentYCols: { type: Array, default: () => [] },
    seriesConfigs: { type: Object, default: () => ({}) },
    configs: { type: Object, default: () => ({}) },
    maxRecords: { type: Number, default: 20 },
    tableLocked: { type: Boolean, default: false },
    resetConfigToGlobal: { type: Function, default: null }
  },
  emits: [
    'update:selectedTableName', 
    'update:isChartMode', 
    'update:visualizationType', 
    'update:xAxisColumn', 
    'update:yAxisColumns', 
    'update:groupByColumn', 
    'update:subGroupByColumn',
    'update:dimensionColumn',
    'update:valueColumn',
    'update:maxRecords',
    'update:activeConfigKey', 
    'update:seriesConfigs',
    'update:configs',
    'reset-to-global',
    'refresh'
  ],
  setup(props, { emit }) {
    const activeTab = ref('consulta');

    const handleUpdate = (event, value) => {
        emit(event, value);
    };

    const handleResetToGlobal = () => {
        const key = props.activeConfigKey;
        if (!key || key === 'Global') return;
        if (props.resetConfigToGlobal) {
            props.resetConfigToGlobal(key);
        }
    };

    return {
        activeTab,
        handleUpdate,
        handleResetToGlobal
    };
  }
});
</script>

<style scoped>
.x-small { font-size: 0.7rem; }
.uppercase { text-transform: uppercase; letter-spacing: 0.5px; }
.transition-all { transition: all 0.25s ease; }
.cursor-pointer { cursor: pointer; }
</style>
