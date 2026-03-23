<template>
  <div 
    class="expandable-action-wrapper"
    :class="{ 'is-expanded': isExpanded }"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <!-- Gatillo: Botón o Dropdown Trigger -->
    <div 
      class="action-trigger border shadow-sm"
      :class="[
        { 'expanded': isExpanded },
        customClass
      ]"
      :title="tooltip"
      @click="handleTriggerClick"
    >
      <DynamicSvgLoader 
        class="action-icon"
        :fileName="icon"
        :width_icon="iconWidth"
        :height_icon="iconHeight"
      />
      <span class="action-label" :class="{ 'visible': isExpanded }">
        {{ label }}
      </span>
    </div>

    <!-- Menú Dropdown (Opcional) -->
    <div 
      v-if="isExpanded && items.length > 0" 
      class="action-menu shadow-lg border"
    >
      <div 
        v-for="(item, index) in items" 
        :key="index" 
        class="action-menu-item"
        @click.stop="onItemSelect(item)"
      >
        {{ item[itemLabel] }}
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import DynamicSvgLoader from '@/components/LoaderSVG/LoaderSVG.vue';

export default defineComponent({
  name: 'ActionExpandable',
  components: {
    DynamicSvgLoader
  },
  props: {
    icon: { type: String, required: true },
    label: { type: String, default: '' },
    isExpanded: { type: Boolean, default: false },
    items: { type: Array, default: () => [] },
    itemLabel: { type: String, default: 'nombre' },
    tooltip: { type: String, default: '' },
    iconWidth: { type: String, default: '16px' },
    iconHeight: { type: String, default: '16px' },
    customClass: { type: String, default: '' }
  },
  emits: ['mouseenter', 'mouseleave', 'select', 'action'],
  setup(props, { emit }) {
    const handleTriggerClick = (e) => {
      if (props.items.length === 0) {
        emit('action');
      }
    };

    const onItemSelect = (item) => {
      emit('select', item);
    };

    const onMouseEnter = () => emit('mouseenter');
    const onMouseLeave = () => emit('mouseleave');

    return {
      handleTriggerClick,
      onItemSelect,
      onMouseEnter,
      onMouseLeave
    };
  }
});
</script>

<style scoped>
.expandable-action-wrapper {
  position: relative;
  z-index: 10;
  transition: z-index 0.3s step-end;
  display: flex;
  align-items: center;
}

.expandable-action-wrapper.is-expanded {
  z-index: 1050;
  transition: none;
}

.action-trigger {
  cursor: pointer;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 0.85rem;
  font-weight: 700;
  background-color: white;
  border-radius: 7px;
  height: 38px;
  width: 44px; /* Colapsado */
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--bs-gray-200);
  overflow: hidden;
  position: relative;
  white-space: nowrap;
}

.action-trigger.expanded {
  width: 155px; /* Expandido */
  padding-left: 32px;
  padding-right: 12px;
  justify-content: flex-start;
  border-color: var(--purple-sb);
  background-color: var(--bs-gray-100);
  box-shadow: 0 4px 12px rgba(44, 43, 44, 0.1);
}

.action-icon {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 2;
  transition: all 0.3s ease;
  color: var(--purple-sb);
  opacity: 0.8;
  display: flex !important;
  align-items: center;
  justify-content: center;
}

.action-trigger.expanded .action-icon {
  left: 20px;
  opacity: 1;
}

/* Forzar que el SVG herede el color */
.action-icon :deep(.loaderSVG-contend) {
  padding: 0 !important;
  margin: 0 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  background: transparent !important;
}

.action-icon :deep(svg path),
.action-icon :deep(svg circle),
.action-icon :deep(svg rect) { 
  fill: currentColor !important; 
}

.action-label {
  font-size: 0.85rem;
  color: var(--black);
  margin-left: 5px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.action-label.visible {
  opacity: 1;
}

.action-menu {
  position: absolute;
  top: 100%;
  left: 0; 
  min-width: 180px;
  max-width: 400px; /* Prevent overflow */
  background: white;
  border-radius: 10px;
  padding: 6px;
  z-index: 1060;
  margin-top: 4px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.15) !important;
  animation: dropdownFadeIn 0.2s ease-out;
}

/* Puente invisible para mantener el hover */
.action-menu::before {
    content: '';
    position: absolute;
    top: -10px;
    left: 0;
    right: 0;
    height: 10px;
}

@keyframes dropdownFadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}

.action-menu-item {
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--bs-body-color);
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.action-menu-item:hover {
  background: var(--blueBerryGlass);
  color: var(--purple-sb);
  padding-left: 16px;
}
</style>
