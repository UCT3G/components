<template>
  <div>
    <!-- SECCIÓN: ORIGEN DE DATOS -->
    <ConfigSection 
      title="Origen de Datos" 
    >
      <div class="mb-3">
        <label class="form-label small text-muted mb-2 fw-bold">Tabla activa: </label>
        <div v-if="tableLocked" class="locked-table-display p-2 rounded-3 border bg-light d-flex align-items-center">
          <span class="small fw-bold text-secondary text-truncate" :title="selectedTableName">{{ selectedTableName }}</span>
        </div>
        <select v-else class="form-select border-light-subtle shadow-sm px-2 py-1" 
                :value="selectedTableName || ''" 
                @change="handleUpdate('update:selectedTableName', $event.target.value)">
          <option value="" disabled>Selecciona una base...</option>
          <option v-for="table in availableTables" :key="table" :value="table">{{ table }}</option>
        </select>
      </div>

      <div v-if="selectedTableName" class="mb-3">
        <label class="form-label small text-muted mb-2 fw-bold">Cargar registros:</label>
        <div class="d-flex align-items-center gap-2">
            <input 
                type="number" 
                :value="maxRecords" 
                min="5" max="500"
                class="form-control form-control-sm border-light-subtle shadow-sm"
                @input="handleUpdate('update:maxRecords', Number($event.target.value))"
            />
            <span class="small text-muted">máx</span>
        </div>
      </div>
    </ConfigSection>

    <div v-if="selectedTableName">
      <!-- SECCIÓN: EJES -->
      <ConfigSection 
        v-if="isChartMode"
        title="Definición de Ejes" 
      >
        <div class="mb-3">
          <label class="form-label small text-muted mb-2 fw-bold">Eje X (Categorías): </label>
          <select class="form-select form-select-sm border-light-subtle shadow-sm bg-white" 
                  :value="xAxisColumn"
                  @change="handleUpdate('update:xAxisColumn', $event.target.value)">
            <option v-for="col in availableColumns" :key="col" :value="col">{{ col }}</option>
          </select>
        </div>

        <div class="mb-3">
          <label class="form-label small text-muted mb-2 d-flex justify-content-between fw-bold">
            Series (Valores):
            <span class="badge bg-light text-dark border fw-normal">{{ yAxisColumns.length }}</span>
          </label>
          <div class="series-list-container p-2 border rounded-3 bg-light-subtle">
            <div v-for="col in availableColumns" :key="col" class="form-check custom-check py-1">
              <input class="form-check-input" type="checkbox" :id="'chk-'+col" 
                     :checked="yAxisColumns.includes(col)" 
                     @change="toggleSeries(col)">
              <label class="form-check-label small text-dark text-truncate d-block" :for="'chk-'+col">{{ col }}</label>
            </div>
          </div>
        </div>
      </ConfigSection>

      <!-- SECCIÓN: AGRUPACIÓN -->
      <ConfigSection 
        title="Agrupación y Segmentación" 
      >
        <div class="mb-3">
          <label class="form-label small text-muted mb-2 fw-bold">Agrupar por:</label>
          <select class="form-select form-select-sm border-light-subtle shadow-sm bg-white" 
                  :value="groupByColumn || ''"
                  @change="handleUpdate('update:groupByColumn', $event.target.value)">
            <option value="">Sin agrupación</option>
            <option v-for="col in availableColumns" :key="col" :value="col">{{ col }}</option>
          </select>
        </div>
        <div v-if="isChartMode" class="mb-3">
          <label class="form-label small text-muted mb-2 fw-bold">Sub-agrupar por:</label>
          <select class="form-select form-select-sm border-light-subtle shadow-sm bg-white" 
                  :value="subGroupByColumn || ''"
                  @change="handleUpdate('update:subGroupByColumn', $event.target.value)">
            <option value="">Sin sub-agrupación</option>
            <option v-for="col in availableColumns" :key="col" :value="col">{{ col }}</option>
          </select>
        </div>

        <!-- ESCENARIO 4: Pivot Dimensión → Series -->
        <template v-if="isChartMode">
          <label class="small text-muted mb-2 fw-bold">Pivot <b>Dimensión → Series</b></label>
          <div class="mb-3">
            <label class="form-label small text-muted mb-2 fw-bold">Dimensión (crea series):</label>
            <select class="form-select form-select-sm border-light-subtle shadow-sm bg-white"
                    :value="dimensionColumn || ''"
                    @change="handleUpdate('update:dimensionColumn', $event.target.value)">
              <option value="">Sin pivot</option>
              <option v-for="col in availableColumns" :key="col" :value="col">{{ col }}</option>
            </select>
          </div>
          <div v-if="dimensionColumn" class="mb-3">
            <label class="form-label small text-muted mb-2 fw-bold">Valor de la dimensión:</label>
            <select class="form-select form-select-sm border-light-subtle shadow-sm bg-white"
                    :value="valueColumn || ''"
                    @change="handleUpdate('update:valueColumn', $event.target.value)">
              <option value="">--</option>
              <option v-for="col in availableColumns" :key="col" :value="col">{{ col }}</option>
            </select>
          </div>
        </template>
      </ConfigSection>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import ConfigSection from '../../PanelGeneral/ConfigSection.vue';

export default defineComponent({
  name: 'TabConsulta',
  components: { ConfigSection },
  props: {
    availableTables: Array,
    selectedTableName: String,
    tableLocked: Boolean,
    isChartMode: Boolean,
    xAxisColumn: String,
    yAxisColumns: { type: Array, default: () => [] },
    availableColumns: Array,
    groupByColumn: String,
    subGroupByColumn: String,
    dimensionColumn: String,
    valueColumn: String,
    maxRecords: { type: Number, default: 20 }
  },
  emits: [
    'update:selectedTableName',
    'update:xAxisColumn',
    'update:yAxisColumns',
    'update:groupByColumn',
    'update:subGroupByColumn',
    'update:dimensionColumn',
    'update:valueColumn',
    'update:maxRecords'
  ],
  setup(props, { emit }) {

    const toggleSeries = (col) => {
      const newSeries = [...props.yAxisColumns];
      const index = newSeries.indexOf(col);
      if (index > -1) newSeries.splice(index, 1);
      else newSeries.push(col);
      emit('update:yAxisColumns', newSeries);
    };

    const handleUpdate = (event, value) => {
      let cleanValue = (value === 'null' || value === '') ? null : value;
      emit(event, cleanValue);
    };

    return {
      toggleSeries,
      handleUpdate
    };
  }
});
</script>

<style scoped>
.locked-table-display {
  border-left: 3px solid var(--purple-sb) !important;
}
.series-list-container {
  max-height: 180px;
  overflow-y: auto;
}
</style>
