<template>
  <div class="tabs-container">
    <!-- Tabs principales -->
    <div class="tabs-nav">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        :class="['tab-button', { active: modelValue === tab.value }]"
        :disabled="disabled && modelValue !== tab.value"
        @click="handleTabClick(tab.value)"
      >
        <span class="tab-label texto-caja">{{ tab.label }}</span>
        <span class="tab-indicator"></span>
      </button>
    </div>

    <!-- Subtabs (si existen para el tab activo) -->
    <div v-if="hasSubtabs" class="subtabs-nav">
      <button
        v-for="subtab in currentSubtabs"
        :key="subtab.value"
        :class="['subtab-button', { active: subModelValue === subtab.value }]"
        :disabled="disabled && subModelValue !== subtab.value"
        @click="handleSubtabClick(subtab.value)"
      >
        <span class="subtab-label">{{ subtab.label }}</span>
      </button>
    </div>
  </div>
</template>

<script>
import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'TabsNavigator',
  props: {
    tabs: {
      type: Array,
      required: true,
      // Formato esperado: [{ value: 'tab1', label: 'Tab 1', subtabs: [...] }, ...]
    },
    modelValue: {
      type: [String, Number],
      required: true
    },
    subModelValue: {
      type: [String, Number],
      default: null
    },
    disabled: {
      type: Boolean,
      default: false
    },
    onBeforeChange: {
      type: Function,
      default: null
    }
  },
  emits: ['update:modelValue', 'update:subModelValue', 'change', 'subchange'],
  setup(props, { emit }) {
    // Obtener el tab activo actual
    const activeTab = computed(() => 
      props.tabs.find(tab => tab.value === props.modelValue)
    );

    // Verificar si el tab activo tiene subtabs
    const hasSubtabs = computed(() => 
      activeTab.value?.subtabs && activeTab.value.subtabs.length > 0
    );

    // Obtener los subtabs del tab activo
    const currentSubtabs = computed(() => 
      activeTab.value?.subtabs || []
    );

    const handleTabClick = (value) => {
      if (value === props.modelValue) return;

      if (props.onBeforeChange) {
        const canChange = props.onBeforeChange(value);
        if (!canChange) return;
      }

      // Encontrar el nuevo tab
      const newTab = props.tabs.find(tab => tab.value === value);
      
      // Si el nuevo tab tiene subtabs, seleccionar el primero automáticamente
      if (newTab?.subtabs && newTab.subtabs.length > 0) {
        emit('update:subModelValue', newTab.subtabs[0].value);
      } else {
        // Si no tiene subtabs, limpiar el subModelValue
        emit('update:subModelValue', null);
      }

      emit('update:modelValue', value);
      emit('change', value);
    };

    const handleSubtabClick = (value) => {
      if (value === props.subModelValue) return;

      emit('update:subModelValue', value);
      emit('subchange', value);
    };

    return {
      handleTabClick,
      handleSubtabClick,
      hasSubtabs,
      currentSubtabs
    };
  }
});
</script>

<style scoped>
.tabs-container {
  width: 100%;
  margin-bottom: 10px;
}

.tabs-nav {
  display: flex;
  justify-content: center;
  border-radius: 12px;
  overflow: hidden;
  border: 1.5px solid var(--bs-gray-200);
  background: var(--bs-gray-200);
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.tab-button {
  flex: 1;
  padding: 12px 10px;
  border: none;
  outline: none;
  color: var(--bs-gray-500);
  font-weight: 500;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.tab-button:not(:last-child)::after {
  content: "";
  position: absolute;
  right: 0;
  top: 20%;
  height: 60%;
  width: 1px;
  background: var(--bs-gray-200);
}

.tab-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  width: 100%;
  background: transparent;
  border-radius: 2px;
  transition: background 0.3s ease;
  z-index: 2;
}

.tab-button.active .tab-indicator {
  background: var(--purple-sb);
}

.tab-button:hover:not(:disabled):not(.active) {
  color: var(--purple-sb);
  background: var(--bs-gray-300);
  transition: all 0.3s ease;
}

.tab-button.active {
  color: var(--purple-sb);
  background: var(--blueBerryPastel);
  font-weight: 600;
  box-shadow: inset 0 0 8px rgba(255, 255, 255, 0.25);
  z-index: 1;
}

.tab-button.active::before {
  position: absolute;
  inset: 0;
  border-radius: 0;
  background: var(--blueBerryGlass);
  z-index: -1;
}

.tab-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Subtabs */
.subtabs-nav {
  display: flex;
  justify-content: start;
  gap: 0px;
  margin-top: 0px;
  padding: 8px;
  background: white;
  border-radius: 8px;
}

.subtab-button {
  padding: 8px 20px;
  border: 1px solid var(--bs-gray-200);
  background: white;
  color: var(--bs-gray-500);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
}

.subtab-button::before {
  content: "";
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.25s ease;
}

.subtab-button:hover:not(:disabled):not(.active) {
  color: var(--purple-sb);
}

.subtab-button:hover:not(:disabled):not(.active)::before {
  opacity: 1;
}

.subtab-button.active {
  color: var(--purple-sb);
  background: white;
  border: none;
  border-bottom: 2px solid var(--purple-sb);  
}

.subtab-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.subtab-label {
  position: relative;
  z-index: 1;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tab-button.active,
.subtab-button.active {
  animation: slideIn 0.3s ease;
}

@media (max-width: 640px) {
  .tabs-nav {
    flex-wrap: wrap;
  }
  .tab-button {
    padding: 10px 12px;
    font-size: 0.85rem;
  }
  .subtabs-nav {
    flex-wrap: wrap;
  }
  .subtab-button {
    padding: 6px 16px;
    font-size: 0.8rem;
  }
}
</style>