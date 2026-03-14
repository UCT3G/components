<template>
  <div class="animate__animated animate__fadeIn animate__faster">
    <div v-if="!selectedTableName" class="text-center py-5">
      <p class="text-muted small">Selecciona una tabla primero</p>
    </div>

    <div v-else>
      <!-- ALCANCE DE DISEÑO -->
      <ConfigSection 
        v-if="availableConfigKeys.length > 1"
        title="Alcance de Diseño" 
        :is-open="sectionsOpen.contexto"
        @toggle="toggleSection('contexto')"
      >
        <div class="mb-3">
          <label class="form-label x-small text-muted mb-1">Configurar para:</label>
          <select class="form-select form-select-sm border-light-subtle shadow-sm bg-white" 
                  :value="activeConfigKey"
                  @change="handleUpdate('update:activeConfigKey', $event.target.value)">
            <option v-for="key in availableConfigKeys" :key="key" :value="key">
              {{ key === 'Global' ? 'Ajustes Globales' : key }}
            </option>
          </select>
          
          <div v-if="activeConfigKey !== 'Global'" class="mt-2">
            <div v-if="hasCustomConfig" class="config-indicator custom-config">
              <span class="x-small">Personalizada</span>
              <button class="btn-reset-config" @click="handleReset" title="Eliminar personalización y heredar de Global">
              </button>
            </div>
            <div v-else class="config-indicator inherited-config">
              <span class="x-small">Hereda de Global</span>
            </div>
          </div>
        </div>
      </ConfigSection>

      <hr v-if="availableConfigKeys.length > 1" class="my-4 opacity-10">

      <!-- VISUALIZACIÓN -->
      <ConfigSection 
        v-if="isChartMode"
        title="Visualización" 
        :is-open="sectionsOpen.visualizacion"
        @toggle="toggleSection('visualizacion')"
      >
        <div class="chart-type-grid row g-2">
          <div v-for="type in chartTypes" :key="type.id" class="col-6">
            <div 
              class="chart-option-card p-3 rounded-3 border text-center transition-all cursor-pointer"
              :class="visualizationType === type.id ? 'active border-primary shadow-sm bg-light' : 'bg-white'"
              @click="handleUpdate('update:visualizationType', type.id)"
            >
              <span class="x-small fw-bold">{{ type.label }}</span>
            </div>
          </div>
        </div>
      </ConfigSection>

      <hr v-if="isChartMode" class="my-4 opacity-10">

      <!-- ESCALA E INTERVALOS -->
      <ConfigSection 
        v-if="isChartMode"
        title="Escala e Intervalos" 
        :is-open="sectionsOpen.escala"
        @toggle="toggleSection('escala')"
      >
        <!-- Para gráficas estándar -->
        <div v-if="visualizationType !== 'radar'">
          <p class="x-small text-muted mb-2">Configurar eje de valores {{ visualizationType === 'horizontal_line' ? '(horizontal)' : '(vertical)' }}</p>
          <div class="row g-2 mb-2">
            <div class="col-6">
              <label class="form-label x-small text-muted mb-1">Mínimo</label>
              <input type="number" class="form-control form-control-sm" 
                     :value="scaleConfig.yMin" 
                     @input="onScaleUpdate('yMin', $event.target.value)"
                     placeholder="Auto">
            </div>
            <div class="col-6">
              <label class="form-label x-small text-muted mb-1">Máximo</label>
              <input type="number" class="form-control form-control-sm" 
                     :value="scaleConfig.yMax" 
                     @input="onScaleUpdate('yMax', $event.target.value)"
                     placeholder="Auto">
            </div>
          </div>
          <div class="mb-2">
            <label class="form-label x-small text-muted mb-1">Intervalo</label>
            <input type="number" class="form-control form-control-sm" 
                   :value="scaleConfig.yInterval" 
                   @input="onScaleUpdate('yInterval', $event.target.value)"
                   placeholder="Auto">
          </div>
        </div>

        <!-- Para Radar -->
        <div v-else>
          <p class="x-small text-muted mb-2">Configurar escala del radar</p>
          <div class="row g-2 mb-2">
            <div class="col-6">
              <label class="form-label x-small text-muted mb-1">Mínimo</label>
              <input type="number" class="form-control form-control-sm" 
                     :value="scaleConfig.radarMin" 
                     @input="onScaleUpdate('radarMin', $event.target.value)"
                     placeholder="0">
            </div>
            <div class="col-6">
              <label class="form-label x-small text-muted mb-1">Máximo</label>
              <input type="number" class="form-control form-control-sm" 
                     :value="scaleConfig.radarMax" 
                     @input="onScaleUpdate('radarMax', $event.target.value)"
                     placeholder="100">
            </div>
          </div>
          <div class="mb-2">
            <label class="form-label x-small text-muted mb-1">Número de Intervalos</label>
            <input type="number" class="form-control form-control-sm" 
                   :value="scaleConfig.radarSplitNumber" 
                   @input="onScaleUpdate('radarSplitNumber', $event.target.value)"
                   placeholder="Auto" min="1">
          </div>
        </div>
      </ConfigSection>

      <hr v-if="isChartMode" class="my-4 opacity-10">

      <!-- PERSONALIZACIÓN DE SERIES -->
      <ConfigSection 
        v-if="isChartMode"
        title="Atributos de Serie" 
        :is-open="sectionsOpen.series"
        @toggle="toggleSection('series')"
        class="pb-5"
      >
        <div v-for="col in currentYCols" :key="col" class="style-config-row p-3 border rounded-3 mb-3 bg-white shadow-sm transition-all">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="x-small fw-bold text-truncate" :title="col">{{ col }}</span>
            <div class="color-picker-wrapper rounded-circle overflow-hidden shadow-sm border">
              <input type="color" class="color-input" 
                     :value="seriesConfigs?.[col]?.color || '#4e73df'"
                     @input="updateSeriesAttr(col, 'color', $event.target.value)">
            </div>
          </div>
          <div class="input-group input-group-sm">
            <input type="text" class="form-control x-small border-start-0 ps-0" 
                   placeholder="Nombre visible"
                   :value="seriesConfigs?.[col]?.alias || ''"
                   @input="updateSeriesAttr(col, 'alias', $event.target.value)">
          </div>
        </div>
      </ConfigSection>
    </div>
  </div>
</template>

<script>
import { defineComponent, computed } from 'vue';
import ConfigSection from './ConfigSection.vue';
import { useChartsAccordion } from '../composables/useChartsAccordion';

export default defineComponent({
  name: 'TabEstilo',
  components: { ConfigSection },
  props: {
    selectedTableName: String,
    availableConfigKeys: Array,
    activeConfigKey: String,
    configs: Object,
    visualizationType: String,
    isChartMode: Boolean,
    currentYCols: Array,
    seriesConfigs: Object
  },
  emits: [
    'update:activeConfigKey',
    'update:visualizationType',
    'update:configs',
    'update:seriesConfigs',
    'reset-to-global'
  ],
  setup(props, { emit }) {
    const { sectionsOpen, toggleSection } = useChartsAccordion({
        contexto: true
    });

    const chartTypes = [
        { id: 'bar', label: 'Barra' },
        { id: 'line', label: 'Línea' },
        { id: 'radar', label: 'Radar' },
        { id: 'horizontal_line', label: 'Línea H' }
    ];

    const scaleConfig = computed(() => {
        const key = props.activeConfigKey || 'Global';
        return props.configs[key] || props.configs.Global || {};
    });

    const hasCustomConfig = computed(() => {
        const key = props.activeConfigKey;
        return key && key !== 'Global' && !!props.configs[key];
    });

    const onScaleUpdate = (field, value) => {
        const parsedValue = value === '' || value === null ? null : parseFloat(value);
        const key = props.activeConfigKey || 'Global';
        const updatedConfigs = JSON.parse(JSON.stringify(props.configs));
        
        if (!updatedConfigs[key]) {
            updatedConfigs[key] = { ...updatedConfigs.Global };
        }
        
        updatedConfigs[key][field] = parsedValue;
        emit('update:configs', updatedConfigs);
    };

    const updateSeriesAttr = (col, property, value) => {
        const newConfigs = { ...props.seriesConfigs };
        newConfigs[col] = { ...(newConfigs[col] || {}), [property]: value };
        emit('update:seriesConfigs', newConfigs);
    };

    const handleUpdate = (event, value) => {
        emit(event, value);
    };

    const handleReset = () => {
        emit('reset-to-global');
    };

    return {
      sectionsOpen,
      toggleSection,
      chartTypes,
      scaleConfig,
      hasCustomConfig,
      onScaleUpdate,
      updateSeriesAttr,
      handleUpdate,
      handleReset
    };
  }
});
</script>

<style scoped>
.x-small { font-size: 0.7rem; }
.chart-option-card:hover { 
  transform: translateY(-2px); 
  border-color: var(--blueBerryPastel); 
}
.chart-option-card.active { 
  background: var(--bs-gray-200) !important; 
  border-color: var(--purple-sb) !important; 
  color: var(--purple-sb); 
}
.color-picker-wrapper { 
  width: 20px; 
  height: 20px; 
  cursor: pointer; 
}
.color-input { 
  width: 40px; 
  height: 40px; 
  margin: -10px; 
  padding: 0; 
  border: none; 
  cursor: pointer; 
}
.config-indicator { 
  display: flex; 
  align-items: center; 
  justify-content: space-between; 
  padding: 6px 10px; 
  border-radius: 6px; 
  font-size: 0.7rem; 
}
.custom-config { 
  background: linear-gradient(135deg, var(--blueBerryPastel) 0%, var(--bs-gray-200) 100%); 
  border: 1px solid var(--purple-sb); 
  color: var(--purple-sb); 
}
.inherited-config { 
  background: var(--bs-gray-100); 
  border: 1px solid var(--bs-gray-200); 
  color: var(--bs-gray-500); 
  gap: 6px; 
}
.btn-reset-config { 
  background: white; 
  border: 1px solid var(--purple-sb); 
  color: var(--purple-sb); 
  padding: 2px 3px; 
  border-radius: 4px; 
  font-size: 0.6rem; 
}
</style>
