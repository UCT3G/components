<template>
  <div class="d-flex flex-column mb-3">
    <button
      class="btn btn-tertiary d-flex justify-content-between align-items-center w-100 py-2 px-3 shadow-sm gap-2"
      :class="{ 
        'active': isExpanded,
        'rounded-bottom-0 border-bottom-0': isExpanded,
        'rounded-3': !isExpanded
      }"
      @click="toggleExpanded"
    >
      <span class="text-truncate flex-grow-1 text-start" :title="label">
        {{ label }}
      </span>

      <DynamicSvgLoader
        class="p-0 flex-shrink-0 chevron-icon"
        :class="{ 'rotated': isExpanded }"
        fileName="icons/chevron-down"
        width_icon="18px"
        :icon_active="isExpanded"
      />
    </button>

    <transition name="expand">
      <div 
        v-if="isExpanded" 
        class="bg-white p-2 rounded-bottom-3 border border-light border-opacity-25 border-top-0"
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
              class="btn btn-sm w-100 py-2 btn-action-item"
              :class="[
                action.variant || '',
                { 'bg-purple-active': action.label === selectedActionLabel }
              ]"
              :disabled="action.disabled"
              :style="action.disabled ? 'pointer-events: none;' : ''"
              @click="action.handler"
            >
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
import DynamicSvgLoader from '@/components/LoaderSVG/LoaderSVG.vue';

export default defineComponent({
  name: 'ExpandableActionButton',
  components: {
    DynamicSvgLoader
  },
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

.chevron-icon {
  transition: transform 0.3s ease;
  flex-shrink: 0; /* Asegura que la flecha nunca se aplaste */
}

.chevron-icon.rotated {
  transform: rotate(180deg);
}

.btn-action-item {
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.btn-action-item:hover,
.bg-purple-active {
  background-color: var(--bs-gray-200) !important;
  color: black !important;
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
