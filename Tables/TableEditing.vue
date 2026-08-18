<template>
  <div class="container-fluid py-1 position-relative">
    <!-- Overlay de pantalla completa (solo si blockFullScreenLoading es true) -->
    <LoadingUCT :blockFullScreem="true" v-if="loading && blockFullScreenLoading"/>

    <!-- Overlay de carga local sobre todo TableEditing (selects, tabla y botones) -->
    <div 
      v-if="loading && !blockFullScreenLoading" 
      class="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white bg-opacity-75 rounded-4" 
      style="z-index: 2000;"
    >
      <LoadingUCT :blockFullScreem="false" />
    </div>

    <!--MENSAJE DE ADVERTENCIA -->
    <div v-if="mensaje" class="alert alert-warning small d-flex align-items-center mb-4" role="alert">
      <div class="flex-grow-1">
        {{ mensaje }}
      </div>
    </div>

    <!-- Card de selects y botón editar -->
    <div class="mb-4 mt-3">
      <div class="row align-items-center g-3">
        <!-- Render dinámico de selects -->
        <div class="col-12 col-md d-flex flex-wrap justify-content-md-end gap-3">
          <!-- Si hay selects, renderizarlos -->
          <template v-if="selects.length > 0">
            <div 
              v-for="sel in selects" 
              :key="sel.key"
              class="d-flex flex-column "
            >
              <div v-if="sel.visible" >
                <!-- <label class="small text-muted mb-1">Selecciona {{ sel.label }}:</label> -->
                <select v-model="selectedValues[sel.key]" class="form-select">
                  <option disabled value="">Selecciona {{ sel.label }} </option>
                  <option v-for="opt in sel.options" :key="opt" :value="opt">
                  {{ opt }}
                  </option>
                </select>
              </div>
            </div>
          </template>

          <!-- Si no hay selects, usar slot personalizado -->
          <template v-else>
            <slot name="header-content"></slot>
          </template>
        </div>

        <!-- Botón de agregar si canEdit y hay opciones -->
        <div class="col-12 col-md-auto" v-if="editable && canEdit && (catalogoOptions.length || useCustomAddEvent)">
          <IconBoton 
            @click.stop.prevent="handleAddClick"
            iconName="AGREGAR-24.svg" 
            width_icon="13px"
            :title="addCustomTitle"
          >
            {{ addCustomTitle }}
          </IconBoton>
        </div>
      </div>
    </div>

    <div>

      <!-- tabla -->
      <form @submit.prevent="save">
        <!-- Tabla -->
        <div class="table-responsive rounded-4 mb-4 shadow-sm" :style="{ maxHeight: tablaMaxHeight }">
          <table class="table table-hover mb-0 align-middle small">
            <thead class="table-light sticky-top shadow-sm">
              <tr>
                <!-- Renderiza los encabezados a partir de props.columns -->
                <th v-for="col in columns" :key="col.key" :class="col.headerAlign || 'text-center'">{{ col.label }}</th>
              </tr>
            </thead>
            <tbody>
              <!-- Una fila por cada elemento de props.rows -->
              <template v-if="rows && rows.length > 0">
                <tr v-for="(row, idx) in rows" :key="idx">
                  <!-- Una celda por cada columna -->
                  <td v-for="col in columns" :key="col.key" :class="getCellAlign(col)">
                    <!-- Si la columna tiene renderButtons definido -->
                    <template v-if="col.renderButtons ">
                      <template v-for="btn in getButtonsForRow(col, row)" :key="btn.action">
                        <!-- Botón con ícono -->
                        <IconBoton  
                          v-if="btn.type === 'icon'"
                          :width_icon="btn.width_icon" 
                          :iconName="btn.icono"
                          :title="btn.label" 
                          @click.stop.prevent="actionButton(btn.action, row)"
                        />

                        <!-- Tres puntos options -->
                        <DropDownTrespuntos 
                          v-else-if="btn.type === 'dropdown'"
                          @elementoSeleccionado="(event) => handleDropdownSelection(event.nombre, row, btn.options)"
                          width_icon="34px"
                          :iconName="'ellipsis-horizontal.svg'" 
                          :lista="btn.options.map(o => o.label)"
                        />

                        <!-- Botón svg -->
                        <DynamicSvgLoader 
                          v-else-if="btn.type === 'svg'"
                          @click.stop.prevent="actionButton(btn.action, row)"
                          :fileName="btn.fileName" 
                          :title="btn.label"
                          :width_icon="btn.width_icon"
                          :class="btn.class"
                        >
                        </DynamicSvgLoader>
                      </template>
                    </template>

                    <!-- Si la columna es editable y canEdit = true, se muestra input -->
                    <template v-else-if="col.editable && canEdit">
                      <input
                        v-model="row[col.key]"
                        :type="col.inputType"
                        :class="[
                          'form-control form-control-sm',
                          col.inputType === 'color' 
                            ? 'form-control-color mx-auto' 
                            : (col.inputType === 'number' || col.validateNumbers ? 'table-input text-end' : 'table-input text-start')
                        ]"
                        :min="col.validateNumbers ? (col.min ?? 0) : null"
                        :max="col.validateNumbers ? (col.max ?? 100) : null"
                        :required="col.required ?? requireInputs"
                        :step="col.validateNumbers ? (col.allowDecimals ? '0.01' : '1') : null"
                        @input="(col.validateNumbers) && validateNumber(row, col.key, col.min, col.max, col.allowDecimals)"
                        @keydown="(col.validateNumbers) && blockInvalidChars($event, col.allowDecimals)"
                      />
                    </template>
                    <template v-else>
                      <div v-if="col.inputType === 'color'" class="d-flex align-items-center justify-content-center">
                        <div 
                          class="color-preview-circle" 
                          :style="{ backgroundColor: row[col.key] }"
                          :title="row[col.key]"
                        ></div>
                      </div>
                      <span v-else>
                        {{ typeof col.formatter === 'function' ? col.formatter(row[col.key], row) : (row[col.key] ?? '-') }}
                      </span>
                    </template>
                  </td>
                </tr>
              </template>

              <!-- Mensaje si no hay filas -->
              <tr v-else>
                <td :colspan="columns.length || 1" class="text-center text-muted py-4">
                  <slot name="empty-state">
                    {{ noDataText }}
                  </slot>
                </td>
              </tr>

              <!-- Fila de Total -->
              <tr v-if="rows && rows.length > 0 && sumRules.length > 0" class="total-row">
                <td v-for="(col, index) in columns" :key="col.key" :class="col.align || 'text-center'">
                  <template v-if="index === 0">
                    <strong>Total</strong>
                  </template>
                  <template v-else-if="shouldShowTotal(col.key)">
                    <strong :class="getTotalClass(col.key)">
                      {{ calculateColumnSum(col.key)}}
                    </strong>
                  </template>
                  <template v-else>
                    -
                  </template>
                </td>
              </tr>

            </tbody>
          </table>
        </div>

        <!-- Botón guardar y cancelar sticky solo con utilerías de Bootstrap -->
        <div v-if="showBottomActions" class="sticky-bottom bg-white d-flex justify-content-center gap-1 mt-3">
          <button type="submit" class="btn btn-primary px-4"> 
            Guardar
          </button> 
          <button type="button" class="btn btn-secondary px-3" @click="cancel">
            Cancelar
          </button>
        </div>
      </form>
    </div>

    <!-- Modal para el catalogo -->
    <PopUpSolido 
      :visible="showCatalogo" 
      @update:visible="showCatalogo = $event" 
      size="small"
      :titulo="'Seleccionar elementos'"
    >
      <div class="container-fluid p-0">
        <!-- Área de checkboxes -->
        <div class="ms-2 p-3">
          <div v-if="catalogoOptions.length === 0" class="text-center text-muted py-4">
            No hay elementos disponibles
          </div>
          <div v-else class="text-start">
            <div v-for="item in catalogoOptions" :key="item.id" class="form-check mb-2 d-flex align-items-center checkbox-hover">
              <input 
                class="form-check-input me-2" 
                type="checkbox" 
                :id="'cat-'+item.id" 
                v-model="selectedCatalogo" 
                :value="item"
                style="margin-top: 0;"
              >
              <label class="form-check-label mb-0" :for="'cat-'+item.id" style="cursor: pointer;">
                {{ item.label }}
              </label>
            </div>
          </div>
        </div>
           
        <!-- Botones de acción -->
        <div class="sticky-bottom bg-white border-top shadow-sm d-flex justify-content-end gap-2 p-2">
          <button 
            class="btn btn-primary" 
            @click="addRowsPonderaciones"
            :disabled="selectedCatalogo.length === 0"
          >
            Agregar
          </button>
        </div>
      </div> 
    </PopUpSolido>
  </div>
</template>

<script>
import { defineComponent, ref, watch, computed } from "vue";
import { validateNumber, blockInvalidChars, validateColumnSum } from "@/utils/utils";
import LoadingUCT from '@/components/Loading/Loading.vue';
import IconBoton from "@/components/ButtonWithIcon/ButtonPrimary.vue";
import DynamicSvgLoader from '@/components/LoaderSVG/LoaderSVG.vue';
import DropDownTrespuntos from "@/components/ListaDesplegable/DropDownTrespuntos.vue";
import PopUpSolido from '@/components/Modal/ModalSolid.vue';
import { toast } from 'vue3-toastify';

export default defineComponent({
  name: "EditingTable",
  components:{LoadingUCT, IconBoton, DynamicSvgLoader, PopUpSolido, DropDownTrespuntos},
  props: {
    selects: { type: Array, default: () => [] }, // arreglo de selects dinámicos
    // inputType: { type: String, default: "text" }, 
    columns: { type: Array, default: () => [] }, 
    rows: { type: Array, default: () => [] }, 
    editable: { type: Boolean, default: false }, 
    loading: { type: Boolean, default: false },
    validateNumbers: { type: Boolean, default: false},  // activa validación (todos numbers) min-max
    sumRules: { type: Array, default: () => [] }, // { column: 'porcentaje', target: 100, validation:true }
    requireInputs:{type: Boolean, default: false},
    catalogoOptions: { type: Array, default: () => [] },
    mensaje: { type: String, default: "" },
    useCustomAddEvent: { type: Boolean, default: false },
    addCustomTitle: { type: String, default: "Agregar criterio" },
    noDataText: { type: String, default: "No hay datos disponibles" },
    blockFullScreenLoading: { type: Boolean, default: false }, // Controla si bloquea la pantalla completa
    hideActions: { type: Boolean, default: false }, // Ocultar botones de guardar/cancelar
    editing: { type: Boolean, default: false } // Sincroniza el estado de edición desde el padre
  },
  emits: ["fetch-data", "save-data", "editing-changed", "onButtonAction", "onAddCustom"],

  setup(props, { emit }) {
    const showCatalogo = ref(false);
    const selectedCatalogo = ref([]);
    const selectedValues = ref({}); 
    const editar = ref(true); // <--- Inicia editando por defecto

    // Sincronizar hacia adentro: si el padre cambia la prop, actualizar el ref local
    watch(() => props.editing, (newVal) => {
      editar.value = newVal;
    });

    // Emitir cuando cambia el estado de edición
    watch(editar, (newValue) => {
      emit("editing-changed", newValue);
    });

    // inicializar los selects con valor por defecto o vacio 
    props.selects.forEach(sel => {
        selectedValues.value[sel.key] = sel.default ?? "";
    });

    // requiredSelected: Verifica si los campos obligatorios están seleccionados
    const requiredSelected = computed(() => {
        const required = props.selects.filter(sel => sel.required);  // Filtra solo los selects con required: true
        if (required.length === 0) return true; // sin selects → permite editar
        return required.every(sel => selectedValues.value[sel.key] !== ""); // Verifica que TODOS los requeridos tengan un valor (no vacío)
    });

    // condición general para habilitar edición
    const canEdit = computed(() => {
        return props.editable && editar.value && requiredSelected.value;
    });

    const showBottomActions = computed(() => {
      return props.editable && canEdit.value && !props.hideActions;
    });

    const tablaMaxHeight = computed(() => {
      return showBottomActions.value 
        ? 'calc(100vh - 360px)' 
        : 'calc(100vh - 290px)';
    });

    // observar cambios en cualquiera de los selects
    watch(
      selectedValues,
      (vals) => {
        emit("fetch-data", { ...vals });
      },
      { deep: true }
    );

    // Calcular la suma de una columna específica
    const calculateColumnSum = (columnKey) => {
      return validateColumnSum(props.rows, columnKey).currentSum;
    };
    // Verificar si se debe mostrar el total para esta columna
    const shouldShowTotal = (columnKey) => {
      return props.sumRules.some(rule => rule.column === columnKey);
    };

    // Obtener la clase CSS según si el total es correcto
    const getTotalClass = (columnKey) => {
      const rule = props.sumRules.find(r => r.column === columnKey);
      if (!rule) return '';

      // Si no hay target definido, no aplicar clase de validación
      if (rule.target === undefined || rule.target === null) {
        return '';
      }
      
      const currentSum = calculateColumnSum(columnKey);
      const isValid = Math.abs(currentSum - rule.target) < 0.01; // tolerancia de 0.01
      
      return isValid ? 'total-valid' : 'total-invalid';
    };

    const actionButton = (action, row) => {
      emit("onButtonAction", { action, row });
    };

    // Handlers para los botones de encuesta
    const getButtonsForRow = (col, row) => {
      if (typeof col.renderButtons === 'function') {
        return col.renderButtons(row);
      }
      return [];
    };

    const save = () => {   
      // Solo validar las reglas que tengan validation: true Y tengan un target definido
      const rulesToValidate = props.sumRules.filter(rule => 
        rule.validation === true && rule.target !== undefined && rule.target !== null
      );
      
      if (rulesToValidate.length > 0) {
        for (const rule of rulesToValidate) {
          const { column, target } = rule;
          const validation = validateColumnSum(props.rows, column, target);
          if (!validation.isValid) {
            toast.warn(`La suma de ${column} debe ser ${target} (actual: ${validation.currentSum})`);
            return;
          }
        }
      }

      emit("save-data", {
        ...selectedValues.value,
        rows: props.rows // filas editadas
      });
    };

    const addRowsPonderaciones = () => {
      if (!selectedCatalogo.value.length) return;
      // Emitir al padre para agregarlas
      emit("onAddRowsPonderaciones", 
      {
        ...selectedValues.value,
        rows: selectedCatalogo.value
      });
      selectedCatalogo.value = [];
      showCatalogo.value = false;
    };

    const handleAddClick = () => {
      if (props.useCustomAddEvent) {
        emit("onAddCustom", selectedValues.value); // Pasar selectedValues
      } else {
        showCatalogo.value = true;
      }
    };

    const cancel = () => {
      editar.value = false;
      // Recargar los datos originales
      emit("fetch-data", { ...selectedValues.value });
    };



    // Manejar la selección del dropdown
    const handleDropdownSelection = (label, row, options) => {
      const opt = options.find(o => o.label === label);
      if (opt) {
        emit("onButtonAction", { action: opt.action, row });
      }
    };

    // Obtener la alineación automática según el tipo de columna
    const getCellAlign = (col) => {
      if (col.align) return col.align;
      if (col.renderButtons || col.inputType === "color") return "text-center";
      if (col.inputType === "number" || col.validateNumbers) return "text-end";
      if (col.inputType === "text" || !col.inputType) return "text-start";
      return "text-center";
    };

    return {
      selectedValues,
      editar,
      save,
      cancel,
      canEdit,
      requiredSelected,
      blockInvalidChars,
      validateNumber,
      calculateColumnSum,
      shouldShowTotal,
      getTotalClass,
      showCatalogo,
      selectedCatalogo,
      addRowsPonderaciones,
      getButtonsForRow,
      actionButton,
      handleDropdownSelection,
      handleAddClick,
      showBottomActions,
      tablaMaxHeight,
      getCellAlign
    };
  }
});
</script>

<style scoped>
.iconBtn{padding: unset;fill: var(--bs-gray-700);}
.iconBtn:hover {fill: var(--bluelight-sb);}
.boton-color{fill:var(--bs-gray-500)}
.boton-color:hover {fill: var(--acceso1);transform: scale(1.1);}

.total-row {
  background-color: var(--bs-gray-100);
  border-top: 2px solid var(--bs-gray-300);
  font-weight: 600;
}
.total-row td {padding: 12px 8px;}
.total-valid {color: var(--bs-green); }
.total-invalid {color: var(--bs-red); }
/* .form-check-input:checked {background-color: var(--bluelight-sb);border-color: var(--bluelight-sb);} */
.color-preview-circle {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 0 0 1px var(--bs-gray-300), 0 2px 4px rgba(0,0,0,0.1);
  cursor: default;
  transition: transform 0.2s ease;
}
.color-preview-circle:hover {transform: scale(1.1);}
</style>