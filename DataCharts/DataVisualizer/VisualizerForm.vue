<template>
  <div class="p-3">
    <p class="text-muted small mb-4">
      {{ activeView 
        ? 'Estás editando una vista existente. ¿Quieres sobrescribirla o guardarla como una nueva copia?' 
        : 'Guarda esta configuración para consultarla después o compartirla con otros usuarios.' 
      }}
    </p>
    
    <div class="mb-3">
      <label class="form-label texto-caja fw-bold text-muted">Nombre de la Vista</label>
      <input 
        v-model="localViewName" 
        type="text" 
        class="form-control" 
        placeholder="Ej: Análisis Mensual de Ventas"
      >
    </div>

    <div class="d-flex gap-2 justify-content-end mt-4">
      <button v-if="activeView" class="btn btn-primary" @click="handleConfirmUpdate">
        Actualizar vista
      </button>
      <button class="btn btn-primary" @click="handleConfirmSave">
        {{ activeView ? 'Guardar nueva copia' : 'Guardar vista' }}
      </button>
    </div>
  </div>
</template>

<script>
import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'VisualizerForm',
  props: {
    modelValue: String,
    activeView: Object
  },
  emits: ['update:modelValue', 'confirm-save', 'confirm-update'],
  setup(props, { emit }) {
    const localViewName = computed({
      get: () => props.modelValue,
      set: (val) => emit('update:modelValue', val)
    });

    const handleConfirmUpdate = () => emit('confirm-update');
    const handleConfirmSave = () => emit('confirm-save');

    return {
      localViewName,
      handleConfirmUpdate,
      handleConfirmSave
    };
  }
});
</script>
