<template>
  <div class="view-toggle-segmented d-flex p-1 bg-light rounded-3 border shadow-sm" :class="extraClass">
    <ButtonPrimary 
      v-for="option in options"
      :key="option.value"
      class="px-3 py-1 m-0 transition-all no-shadow" 
      :class="{ 'mode-inactive': modelValue !== option.value }"
      :width_icon="iconWidth"
      :iconName="option.icon"
      @click="handleClick(option.value)"
    >
      {{ option.label }}
    </ButtonPrimary>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import ButtonPrimary from '@/components/ButtonWithIcon/ButtonPrimary.vue';

export default defineComponent({
  name: 'TabButtons',
  components: {
    ButtonPrimary
  },
  props: {
    modelValue: {
      type: [String, Number, Boolean],
      required: true
    },
    options: {
      type: Array,
      required: true
      // Each option: { label: string, value: any, icon: string }
    },
    iconWidth: {
      type: String,
      default: '14px'
    },
    extraClass: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const handleClick = (value) => {
      if (value !== props.modelValue) {
        emit('update:modelValue', value);
      }
    };

    return {
      handleClick
    };
  }
});
</script>

<style scoped>
.view-toggle-segmented {
  width: fit-content;
}

.no-shadow { box-shadow: none !important; }
.transition-all { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }

/* Estilos para el estado inactivo */
:deep(.mode-inactive) { 
  background: transparent !important; 
  color: var(--bs-gray-600) !important; 
  border: none !important; 
}

:deep(.mode-inactive:hover) { 
  background: rgba(0,0,0,0.05) !important; 
  color: var(--purple-sb) !important; 
}

:deep(.mode-inactive .icon) { 
  filter: grayscale(1) opacity(0.5); 
}

/* Estilos para el estado activo (sobrescribiendo sombras por defecto) */
:deep(.btn-primary:not(.mode-inactive)) { 
  z-index: 1; 
  box-shadow: 0 2px 5px rgba(0,0,0,0.1) !important; 
}
</style>
