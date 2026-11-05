<template>
  <div
    class="dropdown select-search-integrated"
    :class="{ 'select-search-sm': size === 'sm' }"
    v-if="options.length > 0"
  >
    <div 
      ref="dropdownToggle"
      class="input-group input-container"
      :class="{'disabled': disabled}"
      data-bs-toggle="dropdown"
      aria-expanded="false"
      data-bs-auto-close="outside"
    >
      <input 
        type="text"
        class="form-control select-inner-input"
        :class="customClass"
        :placeholder="placeholder"
        v-model="searchQuery"
        :disabled="disabled"
        @focus="onFocus"
        @blur="onBlur"
        @input="onInput"
        @keydown.enter.prevent="onEnter"
        autocomplete="off"
      />
      <span class="input-group-text border-0 chevron-container">
        <DynamicSvgLoader 
          fileName="icons/chevron-down" 
          :width_icon="size === 'sm' ? '13px' : '15px'" 
          :height_icon="size === 'sm' ? '13px' : '15px'" 
        />
      </span>
    </div>
    
    <div class="dropdown-menu p-2 shadow w-100 border-0 custom-dropdown-menu">
      <div class="custom-list-container">
        <button
          v-if="clearable && (!isSearching || !searchQuery.trim())"
          @mousedown.prevent
          @click="clearSelection"
          type="button"
          class="dropdown-item rounded-2 mb-1 text-secondary"
          :class="{'active': modelValue === null || modelValue === undefined || modelValue === ''}"
        >
          <small>{{ clearLabel || placeholder }}</small>
        </button>

        <button 
          v-for="option in filteredOptions" 
          :key="option[valueKey]"
          @mousedown.prevent
          @click="selectOption(option)"
          type="button"
          class="dropdown-item rounded-2 mb-1"
          :class="{'active': modelValue === option[valueKey]}"
        >
          <small>{{ option[labelKey] }}</small>
        </button>
        
        <div v-if="filteredOptions.length === 0" class="text-center py-3 text-muted small">
          No hay resultados
        </div>
      </div>
    </div>
  </div>
  <div
    v-else
    class="text-muted small p-2 border rounded bg-light d-flex align-items-center select-search-empty"
    :class="{ 'select-search-sm': size === 'sm' }"
  >
    <span>{{ loading ? 'Cargando opciones...' : 'Sin opciones disponibles' }}</span>
  </div>
</template>

<script>
import { defineComponent, ref, computed, watch, onBeforeUnmount } from 'vue';
import { Dropdown } from 'bootstrap';
import DynamicSvgLoader from "@/components/LoaderSVG/LoaderSVG.vue";

export default defineComponent({
  name: 'SelectSearch',
  components: { DynamicSvgLoader },
  props: {
    modelValue: {
      type: [String, Number, null],
      default: null
    },
    options: {
      type: Array,
      required: true,
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
      default: 'Seleccione una opción'
    },
    searchPlaceholder: {
      type: String,
      default: 'Buscar...'
    },
    customClass: {
      type: [String, Object],
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    clearable: {
      type: Boolean,
      default: false
    },
    clearLabel: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: 'md'
    }
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    const dropdownToggle = ref(null);
    const searchQuery = ref('');
    const isSearching = ref(false);
    let blurTimeout = null;

    // Get label for current selection
    const selectedLabel = computed(() => {
      if (props.modelValue === null || props.modelValue === undefined) return '';
      const selected = props.options.find(opt => opt[props.valueKey] === props.modelValue);
      return selected ? selected[props.labelKey] : '';
    });

    // Sync input with selection when not searching
    watch(
      [() => props.modelValue, () => props.options],
      () => {
        if (!isSearching.value) {
          searchQuery.value = selectedLabel.value;
        }
      },
      { immediate: true }
    );

    // Filter options based on user input
    const filteredOptions = computed(() => {
      if (!isSearching.value || !searchQuery.value) return props.options;
      
      const lowerSearch = searchQuery.value.toLowerCase();
      return props.options.filter(option => 
        String(option[props.labelKey]).toLowerCase().includes(lowerSearch)
      );
    });

    const hideDropdown = () => {
      if (dropdownToggle.value) {
        const bsDropdown = Dropdown.getInstance(dropdownToggle.value) || new Dropdown(dropdownToggle.value);
        if (bsDropdown) {
          bsDropdown.hide();
        }
      }
    };

    const clearSelection = () => {
      if (blurTimeout) {
        clearTimeout(blurTimeout);
        blurTimeout = null;
      }
      isSearching.value = false;
      searchQuery.value = '';
      if (props.modelValue !== null) {
        emit('update:modelValue', null);
        emit('change', null);
      }
      hideDropdown();
    };

    const onFocus = (e) => {
      if (blurTimeout) {
        clearTimeout(blurTimeout);
        blurTimeout = null;
      }
      e.target.select(); // Select all text for easy replacement
    };

    const onBlur = () => {
      // Small delay to allow click on dropdown item
      if (blurTimeout) clearTimeout(blurTimeout);
      blurTimeout = setTimeout(() => {
        blurTimeout = null;
        if (props.clearable && isSearching.value && searchQuery.value.trim() === '') {
          clearSelection();
          return;
        }
        isSearching.value = false;
        searchQuery.value = selectedLabel.value;
      }, 200);
    };

    const onInput = () => {
      isSearching.value = true;
    };

    const onEnter = (e) => {
      if (props.clearable && searchQuery.value.trim() === '') {
        clearSelection();
        e.target?.blur();
      }
    };

    const selectOption = (option) => {
      if (blurTimeout) {
        clearTimeout(blurTimeout);
        blurTimeout = null;
      }
      emit('update:modelValue', option[props.valueKey]);
      emit('change', option);
      isSearching.value = false;
      searchQuery.value = option[props.labelKey];
      
      // Cerrar el dropdown manualmente después de seleccionar
      hideDropdown();
    };

    onBeforeUnmount(() => {
      if (blurTimeout) {
        clearTimeout(blurTimeout);
        blurTimeout = null;
      }
      if (dropdownToggle.value) {
        const bsDropdown = Dropdown.getInstance(dropdownToggle.value);
        if (bsDropdown) {
          bsDropdown.dispose();
        }
      }
    });

    return {
      searchQuery,
      isSearching,
      filteredOptions,
      selectedLabel,
      selectOption,
      clearSelection,
      onFocus,
      onBlur,
      onInput,
      onEnter,
      dropdownToggle
    };
  }
});
</script>

<style scoped>
.select-search-integrated {
  position: relative;
}

.input-container {
  cursor: pointer;
  border-radius: 25px;
  overflow: hidden;
}

.select-inner-input {
  border-radius: 25px 0 0 25px !important;
  border-right: none;
  padding: 7px 15px;
  cursor: pointer;
}

.select-inner-input:focus {
  cursor: text;
}

.chevron-container {
  border-radius: 0 25px 25px 0 !important;
  background-color: var(--input);
  color: var(--input-txt);
  padding: 0 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
}

.input-container:focus-within .chevron-container {
  background-color: var(--blueBerryPastel);
}

/* Override DynamicSvgLoader internal padding to prevent enlarging the select */
:deep(.loaderSVG-contend) {
  padding: 0 !important;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

:deep(.loaderSVG-contend svg) {
  display: block;
}

/* Orphan .chevron-icon style removed as DynamicSvgLoader handles its own styling */

.custom-dropdown-menu {
  min-width: 100%;
  border-radius: 12px;
  z-index: 1050;
  margin-top: 4px;
}

.custom-list-container {
  max-height: 250px;
  overflow-y: auto;
  scrollbar-width: thin;
}

.dropdown-item {
  white-space: normal;
  padding: 8px 12px;
  transition: all 0.2s;
  cursor: pointer;
}

.dropdown-item:hover {
  background-color:  var(--blueBerryPastel);
  color: var(--purple-sb);
}

.dropdown-item.active {
  background-color: var(--blueBerryPastel) !important;
  color: var(--purple-sb) !important;
}

.disabled {
  opacity: 0.65;
  pointer-events: none;
}

.select-search-sm .select-inner-input {
  padding: 0.25rem 0.5rem 0.25rem 0.75rem;
  font-size: 0.875rem;
  min-height: calc(1.5em + 0.5rem + 2px);
}

.select-search-sm .chevron-container {
  padding: 0 12px;
}

.select-search-empty.select-search-sm {
  padding: 0.25rem 0.75rem !important;
  font-size: 0.875rem !important;
  min-height: calc(1.5em + 0.5rem + 2px);
  border-radius: 25px !important;
  background-color: var(--input) !important;
  color: var(--input-txt) !important;
  border: none !important;
}
</style>
