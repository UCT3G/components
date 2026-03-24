<template>
  <div class="container-fluid py-2">
    <!-- Overlay de pantalla completa -->
    <div v-if="loading" class="loading-overlay-fullscreen">
      <LoadingUCT
        :blockFullScreem="true"
        class="position-fixed top-0 start-0"
        v-if="loading"
      />
    </div>
    <!-- Card de selects y botón editar -->
    <div class="card shadow-sm mb-4">
      <div class="card-body">
        <div class="row align-items-center g-3">
          <!-- Checkbox que permite activar/desactivar la edición -->
          <div class="col-12 col-md-auto">
            <div v-if="editable" class="d-flex align-items-center gap-1">
              <div class="d-flex align-items-center justify-content-center" style="width: 30px; height: 30px;" v-if="canEdit && (catalogoOptions.length || useCustomAddEvent)">
                <DynamicSvgLoader 
                  @click.stop.prevent="handleAddClick"
                  fileName="icons/AGREGAR-24" 
                  title="Agregar criterio"
                  width_icon="16px"
                  class="iconBtn"
                >
                </DynamicSvgLoader>
              </div>
              <!-- Switch -->
              <div class="form-check form-switch d-flex align-items-center mb-0">
                <input 
                  type="checkbox" 
                  class="form-check-input" 
                  role="switch"
                  id="editToggle" 
                  v-model="editar" 
                  :disabled="!requiredSelected"
                >
                <label 
                  class="form-check-label label ms-2 small" 
                  for="editToggle"
                >
                  {{ editar ? 'Editando' : 'Editar' }}
                </label>
              </div>
            </div>
          </div>

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
                  <select v-model="selectedValues[sel.key]" class="form-select form-select-sm">
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
        </div>
      </div>
    </div>

    <!--MENSAJE DE ADVERTENCIA -->
    <div v-if="mensaje" class="alert alert-warning small d-flex align-items-center mb-4" role="alert">
      <div class="flex-grow-1">
        {{ mensaje }}
      </div>
    </div>

    <!-- Card de la tabla -->
    <div class="card shadow-sm">
      <div class="card-body">
        <form @submit.prevent="save">
          <!-- Tabla dinámica -->
          <table class="table">
            <thead>
              <tr>
                <!-- Renderiza los encabezados a partir de props.columns -->
                <th v-for="col in columns" :key="col.key" :class="col.headerAlign || 'text-center'">{{ col.label }}</th>
              </tr>
            </thead>
            <tbody>
              <!-- Una fila por cada elemento de props.rows -->
              <tr v-for="(row, idx) in rows" :key="idx">
                <!-- Una celda por cada columna -->
                <td v-for="col in columns" :key="col.key" :class="col.align || 'text-center'">
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
                      class="form-control form-control-sm table-input"
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

              <!-- Fila de Total -->
              <tr v-if="sumRules.length > 0" class="total-row">
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

          <!-- Botón guardar y cancelar aparece solo si editable y canEdit y NO hideActions -->
          <div v-if="editable && canEdit && !hideActions" class="d-flex justify-content-center gap-2 mt-3">
            <button type="submit" class="btn btn-primary"> 
              Guardar
            </button> 
            <button type="button" class="btn btn-secondary"  @click="cancel">
              Cancelar
            </button>
          </div>
        </form>
      </div>
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
        <div class="d-flex justify-content-end gap-2">
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
    hideActions: { type: Boolean, default: false } // Ocultar botones de guardar/cancelar
  },
  emits: ["fetch-data", "save-data", "editing-changed", "onButtonAction", "onAddCustom"],

  setup(props, { emit }) {
    const showCatalogo = ref(false);
    const selectedCatalogo = ref([]);
    const selectedValues = ref({}); 
    const editar = ref(false);

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
        return editar.value && requiredSelected.value;
    });

    // observar cambios en cualquiera de los selects
    watch(
      selectedValues,
      (vals) => {
        emit("fetch-data", { ...vals }); 
        editar.value = false;
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

    // desactivar edición cuando loading termina
    watch(
      () => props.loading,
      (newVal) => {
        if (!newVal) editar.value = false;
      }
    );

    // Manejar la selección del dropdown
    const handleDropdownSelection = (label, row, options) => {
      const opt = options.find(o => o.label === label);
      if (opt) {
        emit("onButtonAction", { action: opt.action, row });
      }
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
    };
  }
});
</script>

<style scoped>
.checkbox-hover label:hover {color: var(--bluelight-sb) !important;}
.checkbox-hover {
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: background-color 0.2s ease;
}
.checkbox-hover:hover {background-color: var(--bs-gray-200);}
.label:hover{color:var(--bluelight-sb)}
input[type="checkbox"]:hover {border-color: var(--bluelight-sb);}
input[type="checkbox"]:focus {box-shadow: 0 0 5px var(--bluelight-sb);border-color: var(--bluelight-sb);}
.iconBtn{padding: unset;fill: var(--bs-gray-700);}
.iconBtn:hover {fill: var(--bluelight-sb);}
.boton-color{fill:var(--bs-gray-500)}
.boton-color:hover {fill: var(--acceso1);transform: scale(1.1);}

/* ===== Contenedor principal ===== */
.container-fluid {font-family: 'Inter', sans-serif;color: var(--bs-gray-700);}

/* ===== Cards ===== */
.card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  margin-bottom: 1.5rem;
  background-color: white;
}
.card:hover {transform: translateY(-3px);box-shadow: 0 6px 20px rgba(0,0,0,0.12);}
.card-body {padding: 1rem 1.5rem;}

/* ===== Overlay de Loading ===== */
.loading-overlay-fullscreen {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: var(--bs-gray-100);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(4px);
}

/* ===== Selects e Inputs ===== */
.form-select,
.form-control {
  border-radius: 8px;
  border: 1px solid var(--bs-gray-400);
  padding: 6px 12px;
  transition: border 0.2s ease, box-shadow 0.2s ease;
  min-width: 170px;
}

.form-select:focus,
.form-control:focus {
  border-color: var(--bluelight-sb);
  box-shadow: 0 0 0 2px rgba(54, 54, 54, 0.2);
  outline: none;
}

.form-control.w-auto {
  min-width: 10px;
  max-width: 70px;
  display: inline-block;
  text-align: center;
  margin: 0 auto;
}
.table-input {
  width: auto;
  min-width: 70px;
  display: inline-block;
  text-align: center;
  margin: 0 auto;
}
/* ===== Tabla ===== */
.table {width: 100%;}
.table th {
  background-color: var(--bs-gray-100);
  color: var(--bs-gray-800);
  font-weight: 600;
  text-align: center;
  padding: 10px 12px;
  border-top: none;
}
.table thead th {border-right: 2px solid var(--bs-gray-300) ;}
.table td {
  background-color: white;
  border-top: none;
  border-right: 2px solid var(--bs-gray-300); 
  padding: 10px 12px;
  text-align: center;
  vertical-align: middle;
}
.table td:last-child {border-right: none; }
.table thead th:last-child {border-right: none; }
.table tr:hover td { background-color: var(--bs-gray-100); transition: background-color 0.2s ease;}
.total-row {
  background-color: var(--bs-gray-100);
  border-top: 2px solid var(--bs-gray-300);
  font-weight: 600;
}
.total-row td {padding: 12px 8px;}
.total-valid {color: var(--bs-green); }
.total-invalid {color: var(--bs-red); }
.form-check-input:checked {background-color: var(--bluelight-sb);border-color: var(--bluelight-sb);}
.text-muted {color: var(--bs-gray-600);}
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
