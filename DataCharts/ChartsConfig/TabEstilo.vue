<template>
  <div class="animate__animated animate__fadeIn animate__faster">
    <div v-if="!selectedTableName" class="text-center py-5">
      <p class="text-muted small">Selecciona una tabla primero</p>
    </div>

    <div v-else-if="!isChartMode" class="d-flex flex-column align-items-center justify-content-center text-center p-3 mt-4">

      <div class="mt-3 text-secondary small bg-light p-2 rounded-3 border border-light-subtle">
        Cambia al modo de <strong>Gráfica</strong> en la barra superior derecha para editar el diseño.
      </div>
    </div>

    <div v-else>
      <!-- ALCANCE DE DISEÑO -->
      <ConfigSection 
        v-if="availableConfigKeys.length > 1"
        title="Alcance de Diseño" 
      >
        <div class="mb-3">
          <label class="form-label small text-muted mb-2">Configurar para:</label>
          <select class="form-select form-select-sm  shadow-sm bg-white" 
                  :value="activeConfigKey"
                  @change="handleUpdate('update:activeConfigKey', $event.target.value)">
            <option v-for="key in availableConfigKeys" :key="key" :value="key">
              {{ key === 'Global' ? 'Ajustes Globales' : key }}
            </option>
          </select>
          
          <div v-if="activeConfigKey !== 'Global'" class="mt-2">
            <div v-if="hasCustomConfig" class="config-indicator custom-config">
              <span class="small">Personalizada</span>
              <button class="btn-reset-config" @click="handleReset" title="Eliminar personalización y heredar de Global">
              </button>
            </div>
            <div v-else class="config-indicator inherited-config">
              <span class="small">Hereda de Global</span>
            </div>
          </div>
        </div>
      </ConfigSection>

      <!-- VISUALIZACIÓN -->
      <ConfigSection 
        v-if="isChartMode"
        title="Visualización" 
      >
        <div class="chart-type-grid row g-2">
          <div v-for="type in chartTypes" :key="type.id" class="col-6">
            <div 
              class="chart-option-card p-3 rounded-3 border text-center transition-all cursor-pointer small text-muted"
              :class="[
                visualizationType === type.id ? 'active border-primary shadow-sm bg-light' : 'bg-white',
                isTypeDisabled(type.id) ? 'disabled-card opacity-50 cursor-not-allowed bg-light' : ''
              ]"
              @click="!isTypeDisabled(type.id) && handleUpdate('update:visualizationType', type.id)"
              :title="isTypeDisabled(type.id) ? 'No disponible en el modo de pivote activo' : ''"
            >
              <span class="small fw-bold">{{ type.label }}</span>
            </div>
          </div>
        </div>
      </ConfigSection>

      <!-- ESCALA E INTERVALOS -->
      <ConfigSection 
        v-if="isChartMode"
        title="Escala e Intervalos" 
      >
        <!-- Para gráficas estándar -->
        <div v-if="visualizationType !== 'radar' && visualizationType !== 'pie'">
          <label class="small text-muted mb-3 fw-bold">Configurar eje de valores {{ visualizationType === 'horizontal_line' ? '(horizontal)' : '(vertical)' }}</label>
          <div class="row g-2 mb-2">
            <div class="col-6">
              <label class="form-label small text-muted mb-2">Mínimo: </label>
              <input type="number" class="form-control form-control-sm" 
                     :value="scaleConfig.yMin" 
                     @input="onScaleUpdate('yMin', $event.target.value)"
                     placeholder="Auto">
            </div>
            <div class="col-6">
              <label class="form-label small text-muted mb-2">Máximo: </label>
              <input type="number" class="form-control form-control-sm" 
                     :value="scaleConfig.yMax" 
                     @input="onScaleUpdate('yMax', $event.target.value)"
                     placeholder="Auto">
            </div>
          </div>
          <div class="mb-2">
            <label class="form-label small text-muted mb-2">Intervalo: </label>
            <input type="number" class="form-control form-control-sm" 
                   :value="scaleConfig.yInterval" 
                   @input="onScaleUpdate('yInterval', $event.target.value)"
                   placeholder="Auto">
          </div>
        </div>

        <!-- Para Radar -->
        <div v-else-if="visualizationType === 'radar'">
          <p class="small text-muted mb-2">Configurar escala del radar</p>
          <div class="row g-2 mb-2">
            <div class="col-6">
              <label class="form-label small text-muted mb-2">Mínimo</label>
              <input type="number" class="form-control form-control-sm" 
                     :value="scaleConfig.radarMin" 
                     @input="onScaleUpdate('radarMin', $event.target.value)"
                     placeholder="0">
            </div>
            <div class="col-6">
              <label class="form-label small text-muted mb-2">Máximo</label>
              <input type="number" class="form-control form-control-sm" 
                     :value="scaleConfig.radarMax" 
                     @input="onScaleUpdate('radarMax', $event.target.value)"
                     placeholder="100">
            </div>
          </div>
          <div class="mb-2">
            <label class="form-label small text-muted mb-2">Número de Intervalos</label>
            <input type="number" class="form-control form-control-sm" 
                   :value="scaleConfig.radarSplitNumber" 
                   @input="onScaleUpdate('radarSplitNumber', $event.target.value)"
                   placeholder="Auto" min="1">
          </div>
        </div>

        <div v-else class="small text-muted">
          La gráfica de pastel divide los sectores por la categoría elegida y utiliza la métrica seleccionada como su valor.
        </div>
      </ConfigSection>

      <!-- PERSONALIZACIÓN DE SERIES -->
      <ConfigSection 
        v-if="isChartMode"
        title="Atributos de Serie" 
        class="pb-5"
      >
        <div v-for="col in currentYCols" :key="col" class="style-config-row p-3 border rounded-3 mb-3 bg-white shadow-sm transition-all">
          <!-- Modo de Color exclusivo para Pastel -->
          <div v-if="visualizationType === 'pie'" class="mb-3 border-bottom pb-2">
            <label class="form-label small text-muted mb-1 fw-bold">Modo de Color (Pastel)</label>
            <select class="form-select form-select-sm border-light-subtle shadow-sm bg-white"
                    :value="scaleConfig.pieColorMode || 'multicolor'"
                    @change="onScaleUpdate('pieColorMode', $event.target.value)">
              <option value="multicolor">Multicolor (Automático)</option>
              <option value="monochromatic">Monocromático (Degradado)</option>
            </select>
          </div>

          <div class="d-flex align-items-center justify-content-between mb-2 text-muted small">
            <span class="small fw-bold text-truncate" :title="col">{{ col }}</span>
            <div v-if="visualizationType !== 'pie' || scaleConfig.pieColorMode === 'monochromatic'" class="color-picker-wrapper rounded-circle overflow-hidden shadow-sm border">
              <input type="color" class="color-input" 
                     :value="seriesConfigs?.[col]?.color || (visualizationType === 'pie' ? '#ffa500' : '#4e73df')"
                     @input="updateSeriesAttr(col, 'color', $event.target.value)">
            </div>
            <div v-else class="text-muted small">
              <span class="badge bg-light text-secondary border">Paleta Automática</span>
            </div>
          </div>
          <div v-if="visualizationType !== 'pie'" class="input-group input-group-sm">
            <input type="text" class="form-control small border-start-0 ps-0" 
                   placeholder="Nombre visible"
                   :value="seriesConfigs?.[col]?.alias || ''"
                   @input="updateSeriesAttr(col, 'alias', $event.target.value)">
          </div>
          <div v-if="visualizationType === 'pie' && scaleConfig.pieColorMode === 'monochromatic'" class="form-text small text-muted lh-sm mt-2 border-top pt-2">
            Se generará un degradado monocromático a partir del color base seleccionado.
          </div>
        </div>
      </ConfigSection>
    </div>
  </div>
</template>

<script>
import { defineComponent, computed } from 'vue';
import ConfigSection from '../../PanelGeneral/ConfigSection.vue';

// Función pura auxiliar para formatear los valores de configuración según su tipo esperado
function parseConfigValue(field, value) {
    if (value === '' || value === null || value === undefined) {
        return null;
    }

    const numericFields = ['yMin', 'yMax', 'yInterval', 'radarMin', 'radarMax', 'radarSplitNumber'];
    if (numericFields.includes(field)) {
        const parsed = parseFloat(value);
        return Number.isNaN(parsed) ? null : parsed;
    }

    return value;
}

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
    seriesConfigs: Object,
    dimensionColumn: String,
    valueColumn: String
  },
  emits: [
    'update:activeConfigKey',
    'update:visualizationType',
    'update:configs',
    'update:seriesConfigs',
    'reset-to-global'
  ],
  setup(props, { emit }) {

    const chartTypes = [
        { id: 'bar', label: 'Barra' },
        { id: 'line', label: 'Línea' },
        { id: 'pie', label: 'Pastel' },
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
        const key = props.activeConfigKey || 'Global';
        const updatedConfigs = JSON.parse(JSON.stringify(props.configs));
        
        if (!updatedConfigs[key]) {
            updatedConfigs[key] = { ...updatedConfigs.Global };
        }
        
        updatedConfigs[key][field] = parseConfigValue(field, value);
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

    const isTypeDisabled = (typeId) => {
        const hasPivot = !!props.dimensionColumn && !!props.valueColumn;
        if (hasPivot && (typeId === 'pie' || typeId === 'radar')) {
            return true;
        }
        return false;
    };

    return {
      chartTypes,
      scaleConfig,
      hasCustomConfig,
      onScaleUpdate,
      updateSeriesAttr,
      handleUpdate,
      handleReset,
      isTypeDisabled
    };
  }
});
</script>

<style scoped>
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
