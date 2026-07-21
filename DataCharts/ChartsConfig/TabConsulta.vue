<template>
  <div>
    <!-- SECCIÓN: ORIGEN DE DATOS -->
    <ConfigSection 
      title="Origen de Datos" 
    >
      <div class="mb-3">
        <label class="form-label small text-muted mb-2 fw-bold">Tabla activa: </label>
        <div v-if="tableLocked" class="locked-table-display p-2 rounded-3 border bg-light w-100 overflow-hidden">
          <span class="small fw-bold text-secondary text-truncate d-block" :title="selectedTableName">{{ selectedTableName }}</span>
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
        <div class="input-group input-group-sm max-records-group">
          <input 
            type="number" 
            :value="maxRecords" 
            min="1" max="500"
            :disabled="maxRecordsLocked"
            class="form-control border-light-subtle shadow-sm"
            @change="handleUpdate('update:maxRecords', Number($event.target.value))"
          />
          <span class="input-group-text border-light-subtle bg-light text-muted">máx</span>
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
          <label class="form-label small text-muted mb-2 fw-bold">
            {{ visualizationType === 'pie' ? 'Segmentar por (Categoría):' : 'Eje X (Categorías):' }}
          </label>
          <select class="form-select form-select-sm border-light-subtle shadow-sm bg-white" 
                  :value="xAxisColumn"
                  @change="handleUpdate('update:xAxisColumn', $event.target.value)">
            <option v-for="col in availableColumns" :key="col" :value="col">{{ col }}</option>
          </select>
        </div>

        <div class="mb-4">
          <label class="form-label small text-muted mb-2 d-flex justify-content-between fw-bold">
            {{ visualizationType === 'pie' ? 'Valor (Métrica):' : 'Series (Valores):' }}
            <span v-if="visualizationType !== 'pie'" class="badge bg-light text-dark border fw-normal">{{ yAxisColumns.length }}</span>
          </label>
          
          <!-- Modo Pastel: Selección Única -->
          <div v-if="visualizationType === 'pie'">
            <select class="form-select form-select-sm border-light-subtle shadow-sm bg-white"
                    :value="yAxisColumns[0] || ''"
                    @change="handleUpdate('update:yAxisColumns', [$event.target.value])">
              <option value="" disabled>Selecciona una columna...</option>
              <option v-for="col in availableColumns" :key="col" :value="col">{{ col }}</option>
            </select>
          </div>
          
          <!-- Modo Estándar: Selección Múltiple -->
          <div v-else class="series-list-container p-2 border rounded-3 bg-light-subtle">
            <div v-for="col in availableColumns" :key="col" class="form-check custom-check py-1">
              <input class="form-check-input" type="checkbox" :id="'chk-'+col" 
                     :checked="yAxisColumns.includes(col)" 
                     @change="toggleSeries(col)">
              <label class="form-check-label small text-dark text-truncate d-block" :for="'chk-'+col">{{ col }}</label>
            </div>
          </div>
        </div>
        <div class="mb-3">
          <label class="form-label small text-muted mb-2 fw-bold">Operación (Agregación):</label>
          <select class="form-select form-select-sm border-light-subtle shadow-sm bg-white" 
                  :value="aggregationType"
                  @change="handleUpdate('update:aggregationType', $event.target.value)">
            <option value="AVG">Promedio (Media)</option>
            <option value="SUM">Suma Total</option>
            <option value="COUNT">Recuento (Cantidad)</option>
            <option value="MIN">Valor Mínimo</option>
            <option value="MAX">Valor Máximo</option>
          </select>
        </div>
      </ConfigSection>

      <!-- SECCIÓN: ORDEN DE DATOS -->
      <ConfigSection 
        v-if="isChartMode && (yAxisColumns.length > 0 || (dimensionColumn && valueColumn))"
        title="Orden de Datos" 
      >
        <div class="mb-3">
          <label class="form-label small text-muted mb-2 fw-bold">Ordenar por:</label>
          <select class="form-select form-select-sm border-light-subtle shadow-sm bg-white" 
                  :value="sortBy"
                  @change="handleUpdate('update:sortBy', $event.target.value)">
            <option value="natural">Por Defecto</option>
            <option value="category">Categoría (Eje X)</option>
            <option value="value">Valor (Métrica)</option>
          </select>
        </div>
        
        <div v-if="sortBy !== 'natural'" class="mb-3">
          <label class="form-label small text-muted mb-2 fw-bold">Dirección:</label>
          <select class="form-select form-select-sm border-light-subtle shadow-sm bg-white" 
                  :value="sortOrder"
                  @change="handleUpdate('update:sortOrder', $event.target.value)">
            <option value="asc">Ascendente (Menor a Mayor / A-Z)</option>
            <option value="desc">Descendente (Mayor a Menor / Z-A)</option>
          </select>
        </div>
        
        <div v-if="sortBy === 'value' && yAxisColumns.length > 1" class="form-text small text-muted lh-sm mt-1">
          Se ordenará de acuerdo al valor de la primera serie seleccionada.
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
    maxRecords: { type: Number, default: 20 },
    maxRecordsLocked: { type: Boolean, default: false },
    aggregationType: { type: String, default: 'AVG' },
    visualizationType: String,
    sortBy: { type: String, default: 'natural' },
    sortOrder: { type: String, default: 'asc' }
  },
  emits: [
    'update:selectedTableName',
    'update:xAxisColumn',
    'update:yAxisColumns',
    'update:groupByColumn',
    'update:subGroupByColumn',
    'update:dimensionColumn',
    'update:valueColumn',
    'update:maxRecords',
    'update:aggregationType',
    'update:sortBy',
    'update:sortOrder'
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
      if (event === 'update:maxRecords' && typeof cleanValue === 'number') {
        cleanValue = Math.max(1, Math.min(cleanValue, 300));
      }
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
.locked-table-display,
.max-records-group {
  max-width: 240px;
}
.series-list-container {
  max-height: 180px;
  overflow-y: auto;
}
</style>
