<template>
  <div class="d-flex flex-column mb-3">
    <button
      class="btn btn-outline-light text-center py-2 px-3 shadow-sm"
      :class="{ 
        'active': isExpanded,
        'rounded-bottom-0 border-bottom-0': isExpanded,
        'rounded-3': !isExpanded
      }"
      @click="toggleExpanded"
    >
      {{ label }}
    </button>

    <transition name="expand">
      <div 
        v-if="isExpanded" 
        class="bg-white bg-opacity-10 p-2 rounded-bottom-3 border border-light border-opacity-25 border-top-0"
      >
        <!-- Prioridad 1: Slot personalizado-->
        <slot v-if="$slots.actions"></slot>
        
        <!-- Prioridad 2: Array de acciones (forma principal) -->
        <div v-else class="d-flex flex-column gap-2">
          <!-- Wrapper para permitir tooltips en botones deshabilitados -->
          <span
            v-for="(action, index) in actions"
            :key="index"
            class="d-inline-block w-100"
            :title="action.disabled && action.tooltip ? action.tooltip : ''"
            style="cursor: not-allowed;"
            :style="action.disabled ? '' : 'cursor: pointer;'"
          >
            <button
              class="btn btn-sm w-100 py-2 shadow-sm rounded-2"
              :class="[
                action.variant || '',
                { 'bg-white bg-opacity-25': action.label === selectedActionLabel }
              ]"
              :disabled="action.disabled"
              :style="action.disabled ? 'pointer-events: none;' : ''"
              @click="action.handler"
            >
              <i v-if="action.icon" :class="action.icon"></i>
              {{ action.label }}
            </button>
          </span>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { defineComponent, ref, watch } from 'vue';

export default defineComponent({
  name: 'ExpandableActionButton',
  props: {
    label: {
      type: String,
      required: true,
      default: 'Button'
    },
    // Array de acciones - cada elemento: { label, icon?, handler, disabled?, variant? }
    actions: {
      type: Array,
      required: true,
      default: () => []
    },
    modelValue: {
      type: Boolean,
      default: false
    },
    selectedActionLabel: {
      type: String,
      default: null
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const isExpanded = ref(props.modelValue);

    watch(() => props.modelValue, (newValue) => {
      isExpanded.value = newValue;
    });

    const toggleExpanded = () => {
      isExpanded.value = !isExpanded.value;
      emit('update:modelValue', isExpanded.value);
    };

    return {
      isExpanded,
      toggleExpanded
    };
  }
});
</script>

<style scoped>
.rounded-bottom-0 { 
  border-bottom-left-radius: 0 !important; 
  border-bottom-right-radius: 0 !important; 
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease-out;
  max-height: 300px;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-5px);
}
</style>
