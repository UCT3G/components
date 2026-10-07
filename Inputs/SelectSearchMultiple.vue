<template>
  <div class="dropdown w-100 position-relative">
    <!-- Contenedor principal estilo form-control de Bootstrap -->
    <div 
      ref="dropdownToggleRef"
      class="form-control d-flex flex-wrap align-items-center gap-1 p-1"
      :class="{ 'bg-light': disabled, 'cursor-text': !disabled }"
      :data-bs-toggle="disabled ? null : 'dropdown'"
      data-bs-auto-close="outside"
      aria-expanded="false"
      @click="!disabled && focusInput()"
    >
      <!-- Badges / Chips estilo Bootstrap -->
      <div class="d-flex flex-wrap align-items-center gap-1" v-if="selectedItems.length > 0">
        <span 
          v-for="item in selectedItems" 
          :key="item[valueKey]" 
          class="badge bg-light text-primary border rounded-pill d-inline-flex align-items-center gap-1 py-1 px-2 fw-medium"
        >
          <span class="text-truncate" style="max-width: 220px;">
            {{ item[labelKey] || ('ID: ' + item[valueKey]) }}
          </span>
          <button 
            v-if="!disabled" 
            type="button" 
            class="btn-close btn-close-sm" 
            style="font-size: 0.6rem;"
            @click.stop="removeItem(item[valueKey])"
            title="Quitar"
            aria-label="Quitar"
          ></button>
        </span>
      </div>

      <!-- Input de búsqueda y Chevron (solo visible si no está deshabilitado) -->
      <div v-if="!disabled" class="d-flex align-items-center flex-grow-1" style="min-width: 130px;">
        <input 
          ref="searchInputRef"
          type="text"
          class="form-control form-control-sm border-0 bg-transparent shadow-none p-1"
          :placeholder="computedPlaceholder"
          v-model="searchQuery"
          :disabled="disabled || isMaxReached"
          @focus="onFocus"
          @keydown="onKeyDown"
          autocomplete="off"
        />
        <span class="text-secondary d-flex align-items-center px-1">
          <DynamicSvgLoader 
            fileName="icons/chevron-down" 
            width_icon="14px" 
            height_icon="14px" 
          />
        </span>
      </div>

      <!-- Fallback en modo lectura cuando no hay elementos seleccionados -->
      <span v-else-if="selectedItems.length === 0" class="text-muted small p-1">
        Sin selección
      </span>
    </div>

    <!-- Menú Desplegable con Bootstrap Dropdown (Hermano del toggle) -->
    <div 
      ref="dropdownMenuRef"
      class="dropdown-menu w-100 p-1 shadow-sm border mt-1"
      style="max-height: 250px; overflow-y: auto;"
      @scroll="onMenuScroll"
    >
      <!-- Aviso de límite alcanzado -->
      <div v-if="isMaxReached" class="p-2 text-center text-warning small fw-bold">
        Límite máximo alcanzado ({{ max }} selecciones)
      </div>

      <!-- Lista de opciones visibles -->
      <template v-else>
        <button 
          v-for="option in visibleOptions" 
          :key="option[valueKey]"
          type="button"
          class="dropdown-item rounded py-1 px-2 text-start"
          @click="selectOption(option)"
        >
          <span>{{ option[labelKey] }}</span>
        </button>

        <!-- Sin resultados -->
        <div v-if="filteredOptions.length === 0" class="text-center py-3 text-muted small">
          <span v-if="searchQuery">No hay coincidencias para "<strong>{{ searchQuery }}</strong>"</span>
          <span v-else>{{ options.length === 0 ? 'Sin opciones disponibles' : 'No hay más opciones' }}</span>
        </div>

        <!-- Indicador de corte si hay más opciones de las visibles -->
        <div 
          v-if="filteredOptions.length > maxVisible" 
          class="text-center py-1 text-muted small border-top mt-1 fst-italic"
        >
          Mostrando {{ visibleOptions.length }} de {{ filteredOptions.length }} resultados. Sigue escribiendo para refinar...
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed, watch, onBeforeUnmount } from 'vue';
import { Dropdown } from 'bootstrap';
import DynamicSvgLoader from "@/components/LoaderSVG/LoaderSVG.vue";

export default defineComponent({
  name: 'SelectSearchMultiple',
  components: { DynamicSvgLoader },
  props: {
    modelValue: {
      type: Array,
      default: () => []
    },
    options: {
      type: Array,
      default: () => []
    },
    valueKey: {
      type: String,
      default: 'id'
    },
    labelKey: {
      type: String,
      default: 'nombre'
    },
    placeholder: {
      type: String,
      default: 'Buscar y seleccionar...'
    },
    max: {
      type: Number,
      default: 0 // 0 = sin límite
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    const dropdownToggleRef = ref(null);
    const dropdownMenuRef = ref(null);
    const searchInputRef = ref(null);
    const searchQuery = ref('');
    const maxVisible = ref(40); // DOM Windowing: inicial 40 para no trabar el navegador

    // Verificar si se alcanzó el límite máximo
    const isMaxReached = computed(() => {
      return props.max > 0 && props.modelValue.length >= props.max;
    });

    // Placeholder dinámico
    const computedPlaceholder = computed(() => {
      if (props.disabled) {
        return '';
      }
      if (isMaxReached.value) {
        return `Máximo alcanzado (${props.max})`;
      }
      if (props.modelValue.length > 0) {
        return 'Agregar otro...';
      }
      return props.placeholder;
    });

    // Objetos correspondientes a los IDs seleccionados
    const selectedItems = computed(() => {
      if (!Array.isArray(props.modelValue) || props.modelValue.length === 0) return [];
      
      return props.modelValue.map(id => {
        const found = props.options.find(opt => opt[props.valueKey] === id);
        if (found) return found;
        return {
          [props.valueKey]: id,
          [props.labelKey]: `ID #${id}`
        };
      });
    });

    // Opciones filtradas en memoria (excluyendo las ya seleccionadas)
    const filteredOptions = computed(() => {
      const selectedSet = new Set(props.modelValue);
      const query = searchQuery.value.trim().toLowerCase();

      return props.options.filter(opt => {
        // Excluir si ya está seleccionado
        if (selectedSet.has(opt[props.valueKey])) {
          return false;
        }

        // Si no hay texto de búsqueda, mostrar todas
        if (!query) {
          return true;
        }

        // Búsqueda en texto principal
        const mainText = String(opt[props.labelKey] || '').toLowerCase();
        return mainText.includes(query);
      });
    });

    // DOM Windowing: solo renderiza hasta maxVisible elementos en el HTML
    const visibleOptions = computed(() => {
      return filteredOptions.value.slice(0, maxVisible.value);
    });

    // Helper para asegurar que el dropdown esté desplegado
    const showDropdown = () => {
      if (props.disabled || isMaxReached.value || !dropdownToggleRef.value) return;
      const bsDropdown = Dropdown.getOrCreateInstance(dropdownToggleRef.value);
      if (bsDropdown) {
        bsDropdown.show();
      }
    };

    // Reiniciar ventana visible y desplegar automáticamente al escribir
    watch(searchQuery, () => {
      maxVisible.value = 40;
      showDropdown();
    });

    // Lazy Scroll: Cargar 30 más conforme el usuario baja el scroll del menú
    const onMenuScroll = (e) => {
      const { scrollTop, clientHeight, scrollHeight } = e.target;
      if (scrollTop + clientHeight >= scrollHeight - 40) {
        if (maxVisible.value < filteredOptions.value.length) {
          maxVisible.value += 30;
        }
      }
    };

    // Enfocar input y abrir menú
    const focusInput = () => {
      if (!props.disabled) {
        if (searchInputRef.value) {
          searchInputRef.value.focus();
        }
        showDropdown();
      }
    };

    const onFocus = () => {
      showDropdown();
    };

    const onInput = () => {
      showDropdown();
    };

    const onInputClick = () => {
      showDropdown();
    };

    // Manejo de teclado (Backspace para borrar el último chip)
    const onKeyDown = (e) => {
      if (e.key === 'Backspace' && searchQuery.value === '' && props.modelValue.length > 0 && !props.disabled) {
        const newValues = [...props.modelValue];
        newValues.pop();
        emit('update:modelValue', newValues);
        emit('change', newValues);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (visibleOptions.value.length > 0 && !isMaxReached.value) {
          selectOption(visibleOptions.value[0]);
        }
      } else if (e.key === 'Escape') {
        if (dropdownToggleRef.value) {
          const bsDropdown = Dropdown.getInstance(dropdownToggleRef.value);
          if (bsDropdown) bsDropdown.hide();
        }
      }
    };

    // Seleccionar opción (mantiene el dropdown abierto para selecciones múltiples fluidas)
    const selectOption = (option) => {
      if (isMaxReached.value) return;

      const newValues = [...props.modelValue, option[props.valueKey]];
      emit('update:modelValue', newValues);
      emit('change', newValues);

      searchQuery.value = '';
      focusInput();
      showDropdown();
    };

    // Quitar elemento seleccionado
    const removeItem = (idToRemove) => {
      if (props.disabled) return;

      const newValues = props.modelValue.filter(id => id !== idToRemove);
      emit('update:modelValue', newValues);
      emit('change', newValues);
      focusInput();
    };

    onBeforeUnmount(() => {
      if (dropdownToggleRef.value) {
        const bsDropdown = Dropdown.getInstance(dropdownToggleRef.value);
        if (bsDropdown) {
          bsDropdown.dispose();
        }
      }
    });

    return {
      dropdownToggleRef,
      dropdownMenuRef,
      searchInputRef,
      searchQuery,
      maxVisible,
      isMaxReached,
      computedPlaceholder,
      selectedItems,
      filteredOptions,
      visibleOptions,
      onMenuScroll,
      focusInput,
      onFocus,
      onInput,
      onInputClick,
      onKeyDown,
      selectOption,
      removeItem
    };
  }
});
</script>

<style scoped>
.cursor-text {
  cursor: text;
}

</style>
