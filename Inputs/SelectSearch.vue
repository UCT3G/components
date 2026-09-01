<template>
  <div class="dropdown select-search-integrated" v-if="options.length > 0">
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
        autocomplete="off"
      />
      <span class="input-group-text border-0 chevron-container">
        <DynamicSvgLoader 
          fileName="icons/chevron-down" 
          width_icon="15px" 
          height_icon="15px" 
        />
      </span>
    </div>
    
    <div class="dropdown-menu p-2 shadow w-100 border-0 custom-dropdown-menu">
      <div class="custom-list-container">
        <button 
          v-for="option in filteredOptions" 
          :key="option[valueKey]"
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
  <div v-else class="text-muted small p-2 border rounded bg-light d-flex align-items-center">
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
    }
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    const dropdownToggle = ref(null);
    const searchQuery = ref('');
    const isSearching = ref(false);

    // Get label for current selection
    const selectedLabel = computed(() => {
      if (props.modelValue === null || props.modelValue === undefined) return '';
      const selected = props.options.find(opt => opt[props.valueKey] === props.modelValue);
      return selected ? selected[props.labelKey] : '';
    });

    // Sync input with selection when not searching
    watch(() => props.modelValue, () => {
      if (!isSearching.value) {
        searchQuery.value = selectedLabel.value;
      }
    }, { immediate: true });

    // Filter options based on user input
    const filteredOptions = computed(() => {
      if (!isSearching.value || !searchQuery.value) return props.options;
      
      const lowerSearch = searchQuery.value.toLowerCase();
      return props.options.filter(option => 
        String(option[props.labelKey]).toLowerCase().includes(lowerSearch)
      );
    });

    const onFocus = (e) => {
      isSearching.value = true;
      e.target.select(); // Select all text for easy replacement
    };

    const onBlur = () => {
      // Small delay to allow click on dropdown item
      setTimeout(() => {
        isSearching.value = false;
        searchQuery.value = selectedLabel.value;
      }, 200);
    };

    const onInput = () => {
      isSearching.value = true;
    };

    const selectOption = (option) => {
      emit('update:modelValue', option[props.valueKey]);
      emit('change', option);
      isSearching.value = false;
      searchQuery.value = option[props.labelKey];
      
      // Cerrar el dropdown manualmente después de seleccionar
      if (dropdownToggle.value) {
        const bsDropdown = Dropdown.getInstance(dropdownToggle.value) || new Dropdown(dropdownToggle.value);
        if (bsDropdown) {
          bsDropdown.hide();
        }
      }
    };

    onBeforeUnmount(() => {
      if (dropdownToggle.value) {
        const bsDropdown = Dropdown.getInstance(dropdownToggle.value);
        if (bsDropdown) {
          bsDropdown.dispose();
        }
      }
    });

    return {
      searchQuery,
      filteredOptions,
      selectedLabel,
      selectOption,
      onFocus,
      onBlur,
      onInput,
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
</style>
