<template>
  <div class="p-3">
    <p class="text-muted small mb-4">
      {{ 
        activeView 
          ? (isDataChartsAdmin 
              ? 'Estás editando una vista existente. ¿Quieres sobrescribirla o guardarla como una nueva copia?' 
              : 'Estás editando una vista existente. ¿Quieres sobrescribirla con los cambios actuales?')
          : 'Guarda esta configuración para consultarla después o compartirla con otros usuarios.' 
      }}
    </p>
    
    <div class="mb-3">
      <label class="form-label texto-caja fw-bold text-muted">Nombre de la Vista</label>
      <input 
        v-model="localViewName" 
        type="text" 
        class="form-control" 
        placeholder="Ej: Análisis"
      >
    </div>

    <div class="d-flex gap-2 justify-content-end mt-4">
      <!-- Actualizar: solo si ya existe una vista Y el usuario tiene permiso sobre ella -->
      <button 
        v-if="activeView && currentPermission !== 'lectura'" 
        class="btn btn-primary" 
        @click="handleConfirmUpdate"
      >
        Actualizar vista
      </button>
      <!-- Guardar nueva / Guardar copia: solo si es admin de DataCharts (id_permiso 22) -->
      <button 
        v-if="isDataChartsAdmin" 
        class="btn btn-primary" 
        @click="handleConfirmSave"
      >
        {{ activeView ? 'Guardar nueva copia' : 'Guardar vista' }}
      </button>
    </div>
  </div>
</template>

<script>
import { defineComponent, computed } from 'vue';
import { useDataChartsPermisos } from '@/components/DataCharts/composables/useDataChartsPermisos.js';

export default defineComponent({
  name: 'VisualizerForm',
  props: {
    modelValue: String,
    activeView: Object,
    currentPermission: { type: String, default: 'propietario' },
  },
  emits: ['update:modelValue', 'confirm-save', 'confirm-update'],
  setup(props, { emit }) {
    const { isDataChartsAdmin } = useDataChartsPermisos();
    const localViewName = computed({
      get: () => props.modelValue,
      set: (val) => emit('update:modelValue', val)
    });

    const handleConfirmUpdate = () => emit('confirm-update');
    const handleConfirmSave = () => emit('confirm-save');

    return {
      localViewName,
      handleConfirmUpdate,
      handleConfirmSave,
      isDataChartsAdmin
    };
  }
});
</script>
