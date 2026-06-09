<template>
  <div class="p-3 d-flex flex-column">
    <div class="mb-4">
      <p class="text-muted small mb-4">
        {{ 
          activeView 
            ? (usuarioAccesos.canSaveAsNew 
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

      <!-- Checkbox para hacer pública la vista (solo para admin) -->
      <div v-if="usuarioAccesos.canPublish" class="mb-3 form-check form-switch d-flex align-items-center gap-2">
        <input 
          v-model="localEsPublica" 
          type="checkbox" 
          class="form-check-input cursor-pointer" 
          id="chkEsPublica"
          style="margin-top: 0;"
        >
        <label class="form-check-label cursor-pointer fw-bold text-muted small mb-0" for="chkEsPublica">
          Hacer pública esta vista (para todos los usuarios)
        </label>
      </div>
    </div>

    <div class="d-flex gap-2 justify-content-end mt-4">
      <!-- Actualizar: solo si ya existe una vista Y el usuario tiene permiso sobre ella -->
      <button 
        v-if="usuarioAccesos.canUpdate" 
        class="btn btn-primary" 
        @click="handleConfirmUpdate"
      >
        Actualizar vista
      </button>
      <!-- Guardar nueva / Guardar copia: solo si es admin de DataCharts (id_permiso 23) -->
      <button 
        v-if="usuarioAccesos.canSaveAsNew" 
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

export default defineComponent({
  name: 'VisualizerForm',
  props: {
    modelValue: String,
    esPublica: Boolean,
    activeView: Object,
    currentPermission: { type: String, default: 'propietario' },
    usuarioAccesos: { type: Object, required: true }
  },
  emits: ['update:modelValue', 'update:esPublica', 'confirm-save', 'confirm-update'],
  setup(props, { emit }) {
    const localViewName = computed({
      get: () => props.modelValue,
      set: (val) => emit('update:modelValue', val)
    });

    const localEsPublica = computed({
      get: () => props.esPublica,
      set: (val) => emit('update:esPublica', val)
    });

    const handleConfirmUpdate = () => emit('confirm-update');
    const handleConfirmSave = () => emit('confirm-save');

    return {
      localViewName,
      localEsPublica,
      handleConfirmUpdate,
      handleConfirmSave
    };
  }
});
</script>
