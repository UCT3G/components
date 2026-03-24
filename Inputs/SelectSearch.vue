<template>
  <div class="dropdown select-search-uct" v-if="options.length > 0">
    <button 
      class="form-select texto-caja text-start d-flex justify-content-between align-items-center" 
      type="button" 
      data-bs-toggle="dropdown" 
      aria-expanded="false"
      :class="customClass"
      :disabled="disabled"
    >
      <span v-if="selectedText" class="selected-text">{{ selectedText }}</span>
      <span v-else class="text-muted">{{ placeholder }}</span>
    </button>
    
    <div class="dropdown-menu p-2 shadow w-100 border-0 custom-dropdown-menu">
      <div class="mb-2 sticky-top bg-white pt-1">
        <div class="input-group input-group-sm">
          <span class="input-group-text bg-light border-end-0">
            
          </span>
          <input 
            v-model="searchQuery" 
            type="text" 
            class="form-control border-start-0 ps-0" 
            :placeholder="searchPlaceholder"
            @click.stop
          />
        </div>
      </div>
      
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
import { defineComponent, ref, computed } from 'vue';

export default defineComponent({
  name: 'SelectSearch',
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
    const searchQuery = ref('');

    const filteredOptions = computed(() => {
      if (!searchQuery.value) return props.options;
      const lowerSearch = searchQuery.value.toLowerCase();
      return props.options.filter(option => 
        String(option[props.labelKey]).toLowerCase().includes(lowerSearch)
      );
    });

    const selectedText = computed(() => {
      if (props.modelValue === null || props.modelValue === undefined) return '';
      const selected = props.options.find(opt => opt[props.valueKey] === props.modelValue);
      return selected ? selected[props.labelKey] : '';
    });

    const selectOption = (option) => {
      emit('update:modelValue', option[props.valueKey]);
      emit('change', option);
      searchQuery.value = ''; // Reset search on select
    };

    return {
      searchQuery,
      filteredOptions,
      selectedText,
      selectOption
    };
  }
});
</script>

<style scoped>
.form-select:focus {
  border-color: var(--acceso1);
  box-shadow: 0 0 0 0.2rem rgba(var(--acceso1-rgb), 0.15);
}

.form-select {
  border-radius: 8px;
  border: 1px solid var(--bs-gray-400);
  padding: 12px 12px;
  transition: border 0.2s ease, box-shadow 0.2s ease;
}

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
  background-color: var(--bs-gray-200);
  color: var(--purple-sb);
}

.dropdown-item.active {
  background-color: var(--blueBerryPastel);
  color: white;
}

.selected-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.input-group-text {
  border-radius: 6px 0 0 6px;
}

.form-control-sm {
  border-radius: 0 6px 6px 0;
}
</style>
