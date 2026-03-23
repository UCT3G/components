<template>
  <div 
    class="sidebar-general-container position-relative h-100 subtitulo" 
    :class="{ 'collapsed': collapsed }" 
    :style="{ width: collapsed ? '0' : width }"
    @click.stop
  >
    <div class="panel-general p-0 d-flex flex-column bg-white shadow-lg overflow-hidden h-100">
      <!-- Header con Tabs (Opcional) -->
      <div v-if="tabs && tabs.length > 0" class="panel-header-tabs d-flex border-bottom bg-light">
        <button 
          v-for="tab in tabs" 
          :key="tab"
          class="tab-btn flex-grow-1 py-3 px-2 border-0 bg-transparent transition-all"
          :class="{ 'active': activeTab === tab.toLowerCase() }"
          @click="selectTab(tab)"
        >
          <slot name="tab-label" :tab="tab">
              <span class="fw-bold x-small uppercase">{{ tab }}</span>
          </slot>
        </button>
      </div>

      <!-- Header Estático (Opcional) -->
      <div v-else-if="title" class="panel-header-static border-bottom bg-light p-3">
          <h5 class="mb-0 fw-bold x-small uppercase">{{ title }}</h5>
      </div>

      <!-- Contenido con Scroll -->
      <div class="panel-scrollable flex-grow-1 p-3">
          <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, provide, computed } from 'vue';

export default defineComponent({
  name: 'PanelGeneral',
  props: {
    collapsed: {
      type: Boolean,
      default: false
    },
    width: {
      type: String,
      default: '280px'
    },
    tabs: {
      type: Array,
      default: () => []
    },
    activeTab: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    },
    accordion: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:activeTab'],
  setup(props, { emit }) {
    const activeSectionId = ref(null);

    const toggleSection = (sectionId) => {
      if (activeSectionId.value === sectionId) {
        activeSectionId.value = null;
      } else {
        activeSectionId.value = sectionId;
      }
    };

    provide('accordionContext', {
      isAccordion: computed(() => props.accordion),
      activeSectionId: computed(() => activeSectionId.value),
      toggleSection
    });

    const selectTab = (tab) => {
      emit('update:activeTab', tab.toLowerCase());
    };

    return {
      selectTab
    };
  }
});
</script>

<style scoped>
.sidebar-general-container {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 100;
  flex-shrink: 0;
  overflow: visible;
}

.sidebar-general-container.collapsed {
  width: 0 !important;
}

/* Ocultar contenido interno cuando está colapsado */
.sidebar-general-container.collapsed :deep(> *) {
  width: 0 !important;
  min-width: 0 !important;
  overflow: hidden !important;
  border: none !important;
  padding: 0 !important;
  margin: 0 !important;
}

.panel-general {
  height: 100%;
}

.tab-btn {
    position: relative;
    outline: none !important;
}

.tab-btn.active {
    color: var(--purple-sb);
}

.tab-btn.active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 20%;
    right: 20%;
    height: 3px;
    background: var(--purple-sb);
    border-radius: 10px 10px 0 0;
}

.panel-scrollable {
    max-height: calc(100vh - 150px); 
    overflow-y: auto;
}
.x-small { font-size: 0.7rem; }
.uppercase { text-transform: uppercase; letter-spacing: 0.5px; }
.transition-all { transition: all 0.25s ease; }

:deep(.panel-section) {
    margin-bottom: 1.5rem;
}

:deep(.panel-section-title) {
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
}
</style>
