<template>
  <div class="tooltip-container position-relative">
    <DynamicSvgLoader
      fileName="icons/info"
      class="icon-btn-info tooltip-icon"
      :width_icon="iconSize"
      :height_icon="iconSize"
      :class="{ 'active': visible }"
      @click="visible = !visible"
    />
    
    <div v-if="visible" class="tooltip-card animate__animated animate__fadeIn">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h6 class="mb-0 fw-bold tooltip-header">{{ title }}</h6>
        <button @click="visible = false" class="btn-close btn-close-sm" style="font-size: 0.7rem;"></button>
      </div>
      <div class="tooltip-content text-muted">
        <slot>
          <ul class="list-unstyled mb-0">
            <li v-for="(item, index) in items" :key="index" class="mb-2">
              <span v-html="item"></span>
            </li>
          </ul>
        </slot>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted, onUnmounted } from 'vue';
import DynamicSvgLoader from '@/components/LoaderSVG/LoaderSVG.vue';

export default defineComponent({
  name: 'TooltipInstructions',
  components: {
    DynamicSvgLoader
  },
  props: {
    title: {
      type: String,
      default: 'Información'
    },
    items: {
      type: Array,
      default: () => []
    },
    iconSize: {
      type: String,
      default: '25px'
    }
  },
  setup() {
    const visible = ref(false);

    const handleClickOutside = (event) => {
      if (visible.value && !event.target.closest('.tooltip-container')) {
        visible.value = false;
      }
    };

    onMounted(() => {
      document.addEventListener('click', handleClickOutside);
    });

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside);
    });

    return {
      visible,
    };
  }
});
</script>

<style scoped>
.tooltip-container {
  display: inline-flex;
  align-items: center;
}

.icon-btn-info {
  cursor: pointer;
  padding: unset;
  fill: var(--blueBerryPastel);
  transition: fill 0.2s ease;
}

.icon-btn-info:hover {
  fill: var(--bluelight-sb);
}

.tooltip-icon.active {
  fill: var(--bluelight-sb);
}

.tooltip-card {
  position: absolute;
  top: 110%;
  left: 0;
  width: 320px;
  background: white;
  border-radius: 14px;
  box-shadow: 0 12px 30px rgba(0,0,0,0.25);
  padding: 18px;
  z-index: 1050;
  border: 1px solid var(--bs-gray-400);
  backdrop-filter: blur(4px);
}

.tooltip-header {
  color: var(--bluelight-sb);
  letter-spacing: 0.5px;
}

.tooltip-card::before {
  content: '';
  position: absolute;
  top: -6px;
  left: 14px;
  width: 12px;
  height: 12px;
  background: white;
  transform: rotate(45deg);
  border-top: 1px solid var(--bs-gray-400);
  border-left: 1px solid var(--bs-gray-400);
}

.tooltip-content {
  max-height: 250px;
  overflow-y: auto;
  padding-right: 8px;
  line-height: 1.5;
  font-size: 0.9rem;
}

/* Scrollbar personalizado */
.tooltip-content::-webkit-scrollbar {
  width: 5px;
}

.tooltip-content::-webkit-scrollbar-track {
  background: transparent;
}

.tooltip-content::-webkit-scrollbar-thumb {
  background: var(--bs-gray-400);
  border-radius: 10px;
}

.tooltip-content::-webkit-scrollbar-thumb:hover {
  background: var(--bs-gray-400);
}

.tooltip-content :deep(strong) {
  color: var(--bluelight-sb);
  font-weight: 600;
}
</style>
