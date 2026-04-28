<template>
  <div class="p-2 bg-white bg-opacity-50 rounded-3 border">
    <!-- Preview & Upload Slot -->
    <div v-if="!onlyPosition" class="border rounded mb-3 overflow-hidden bg-light shadow-sm" style="height: 100px;">
      <ImageUploadSlot
        :campo="campo"
        :imageUrl="imageUrl"
        :hasImage="hasImage"
        :isEditMode="true"
        tooltip="Cambiar imagen"
        @image-selected="onImageSelected"
      />
    </div>

    <!-- Sliders de control -->
    <div>
      <!-- Posición X -->
      <div class="mb-2">
        <div class="d-flex justify-content-between align-items-center mb-1">
          <label class="smallest text-muted fw-bold text-uppercase">Horizontal (X)</label>
          <span class="smallest fw-bold text-primary">{{ modelValue.x }}mm</span>
        </div>
        <input 
          type="range" 
          class="form-range" 
          min="-220" 
          max="220" 
          :value="modelValue.x"
          @input="updateValue('x', $event.target.value)"
        >
      </div>

      <!-- Posición Y -->
      <div class="mb-2">
        <div class="d-flex justify-content-between align-items-center mb-1">
          <label class="smallest text-muted fw-bold text-uppercase">Vertical (Y)</label>
          <span class="smallest fw-bold text-primary">{{ modelValue.y }}mm</span>
        </div>
        <input 
          type="range" 
          class="form-range" 
          min="-50" 
          max="297" 
          :value="modelValue.y"
          @input="updateValue('y', $event.target.value)"
        >
      </div>

      <!-- Escala -->
      <div class="mb-2">
        <div class="d-flex justify-content-between align-items-center mb-1">
          <label class="smallest text-muted fw-bold text-uppercase">Ancho (%)</label>
          <span class="smallest fw-bold text-primary">{{ modelValue.scale }}%</span>
        </div>
        <input 
          type="range" 
          class="form-range" 
          min="1" 
          max="200" 
          :value="modelValue.scale"
          @input="updateValue('scale', $event.target.value)"
        >
      </div>

      <!-- Opacidad -->
      <div class="mb-2">
        <div class="d-flex justify-content-between align-items-center mb-1">
          <label class="smallest text-muted fw-bold text-uppercase">Opacidad (%)</label>
          <span class="smallest fw-bold text-primary">{{ modelValue.opacity ?? 100 }}%</span>
        </div>
        <input 
          type="range" 
          class="form-range" 
          min="0" 
          max="100" 
          :value="modelValue.opacity ?? 100"
          @input="updateValue('opacity', $event.target.value)"
        >
      </div>

      <!-- Rotación -->
      <div class="mb-2">
        <div class="d-flex justify-content-between align-items-center mb-1">
          <label class="smallest text-muted fw-bold text-uppercase">Rotación (deg)</label>
          <span class="smallest fw-bold text-primary">{{ modelValue.rotate ?? 0 }}°</span>
        </div>
        <input 
          type="range" 
          class="form-range" 
          min="0" 
          max="360" 
          :value="modelValue.rotate ?? 0"
          @input="updateValue('rotate', $event.target.value)"
        >
      </div>
    </div>

    <!-- Botones de Acción Rápida -->
    <div class="d-flex gap-1 mt-2">
      <button 
        type="button"
        @click="align('center')" 
        class="btn btn-sm btn-outline-secondary flex-grow-1 py-1 smallest fw-bold text-uppercase"
      >
        Centrar
      </button>
      <button 
        type="button"
        @click="align('top')" 
        class="btn btn-sm btn-outline-secondary flex-grow-1 py-1 smallest fw-bold text-uppercase"
      >
        Arriba
      </button>
      <button 
        type="button"
        @click="align('fill')" 
        class="btn btn-sm btn-outline-secondary flex-grow-1 py-1 smallest fw-bold text-uppercase"
      >
        Llenar
      </button>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import ImageUploadSlot from './ImageUploadSlot.vue';

export default defineComponent({
  name: 'ImageMovableControl',
  components: { ImageUploadSlot },
  props: {
    modelValue: {
      type: Object,
      default: () => ({ x: 0, y: 0, scale: 100 })
    },
    imageUrl: { type: String, default: '' },
    hasImage: { type: Boolean, default: false },
    campo: { type: String, required: true },
    onlyPosition: { type: Boolean, default: false }
  },
  emits: ['update:modelValue', 'image-selected'],
  setup(props, { emit }) {
    const updateValue = (key, val) => {
      emit('update:modelValue', {
        ...props.modelValue,
        [key]: parseInt(val)
      });
    };

    const align = (type) => {
      let newData = { ...props.modelValue };
      if (type === 'center') {
        // Centrar asumiendo A4 (210mm de ancho)
        newData.x = Math.round(105 - (newData.scale * 2.1 / 2));
      } else if (type === 'top') {
        newData.y = 0;
      } else if (type === 'fill') {
        newData.x = 0;
        newData.y = 0;
        newData.scale = 100;
      }
      emit('update:modelValue', newData);
    };

    const onImageSelected = (event) => {
      emit('image-selected', event);
    };

    return {
      updateValue,
      align,
      onImageSelected
    };
  }
});
</script>

<style scoped>
.smallest { font-size: 10px; }
</style>