<template>
  <div class="sidebar-container d-flex" ref="sidebarContainer">
    <div class="sidebar d-flex flex-column align-items-center py-2 position-relative">
      <!-- Flecha Arriba -->
      <DynamicSvgLoader 
        v-if="showUpArrow" 
        class="scroll-arrow up-arrow" 
        @click="scrollUp"
        fileName="icons/chevron-down" 
        width_icon="16px" 
        :icon_active="true" 
      />

      <!-- Contenedor scrollable de iconos -->
      <div class="sidebar-content w-100 h-100" ref="scrollContainer" @scroll="checkScroll">
        <button
          v-for="(panel, index) in panels"
          :key="index"
          class="sidebar-btn d-flex align-items-center justify-content-center position-relative"
          @click="handleClick(panel.id)"
          :class="{ 'collapsed': activePanelId !== panel.id }"
          :title="panel.label"
        >
          <DynamicSvgLoader 
            :fileName="panel.icon" 
            :title="panel.label"
            :width_icon="panel.width_icon"
            :icon_active="activePanelId === panel.id"
          >
          </DynamicSvgLoader>
          <span v-if="panel.notify" class="notification-dot"></span>
        </button>
      </div>

      <!-- Flecha Abajo -->
      <DynamicSvgLoader 
        v-if="showDownArrow" 
        class="scroll-arrow down-arrow" 
        @click="scrollDown"
        fileName="icons/chevron-down" 
        width_icon="16px" 
        :icon_active="true" 
      />
    </div>

    <!-- CONTENIDO DE PANELES -->
    <template v-for="panel in panels" :key="'content-' + panel.id">
      <!-- Panel lateral -->
      <div
        v-if="activePanelId === panel.id && !panel.noPanel"
        class="left-side flex-grow-1 ms-3"
      >
        <div
          class="formulario d-flex flex-column h-100"
          :class="{ collapsed: isCollapsed }"
        >
          <div class="formulario-content">
            <slot :name="panel.id"></slot>
          </div>
        </div>
      </div>

      <!-- Panel opcional sin lateral -->
      <div 
        v-else-if="activePanelId === panel.id && panel.noPanel" 
        class="flex-grow-1"
      >
        <slot :name="panel.id"></slot>
      </div>
    </template>

  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted, onUnmounted } from 'vue';
import DynamicSvgLoader from '@/components/LoaderSVG/LoaderSVG.vue';

export default defineComponent({
  name: 'SidePanel',
  components:{DynamicSvgLoader},
  props: {
    panels: { type: Array, required: true }
  },
  emits: ['update:panel'],
  setup(props, { emit }) {
    const activePanelId = ref(props.panels[0]?.id || null)
    const isCollapsed = ref(false)
    const panelWidth = ref(400)
    const sidebarContainer = ref(null)
    const scrollContainer = ref(null)
    const showUpArrow = ref(false)
    const showDownArrow = ref(false)

    const activePanel = computed(() =>
      props.panels.find(p => p.id === activePanelId.value) || {}
    )

    const checkScroll = () => {
      if (!scrollContainer.value) return
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer.value
      showUpArrow.value = scrollTop > 5
      showDownArrow.value = scrollTop + clientHeight < scrollHeight - 5
    }

    const scrollUp = () => {
      scrollContainer.value?.scrollBy({ top: -100, behavior: 'smooth' })
    }

    const scrollDown = () => {
      scrollContainer.value?.scrollBy({ top: 100, behavior: 'smooth' })
    }

    const handleClick = (panelId) => {
      if (activePanelId.value === panelId) {
        isCollapsed.value = !isCollapsed.value
      } else {
        activePanelId.value = panelId
        isCollapsed.value = false
      }
      emit('update:panel', activePanelId.value)
    }

    const handleClickOutside = (event) => {
      const activePanel = props.panels.find(p => p.id === activePanelId.value)
      if (activePanel?.preventOutsideCollapse) return

      if (sidebarContainer.value && !sidebarContainer.value.contains(event.target) && !isCollapsed.value) {
        isCollapsed.value = true
      }
    }

    onMounted(() => {
      document.addEventListener('click', handleClickOutside)
      window.addEventListener('resize', checkScroll)
      // Dar tiempo al renderizado de los paneles
      setTimeout(checkScroll, 500)
    })

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
      window.removeEventListener('resize', checkScroll)
    })

    return { 
      handleClick, activePanelId, isCollapsed, panelWidth, activePanel, 
      sidebarContainer, scrollContainer, showUpArrow, showDownArrow,
      checkScroll, scrollUp, scrollDown 
    }
  }
})
</script>

<style scoped>
.sidebar-container {
  height: calc(100vh - 100px);
  display: flex;
  align-items: flex-start;
  flex-shrink: 0;
}
.sidebar {
  width: 44px;
  flex-shrink: 0;
  background: var(--purple-sb);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  /* padding: 10px 0; */ /* Movido a scroll-container */
  height: calc(100vh - 112px);
  overflow: hidden; /* Las flechas se posicionan fuera */
}

.sidebar-content {
  overflow-y: auto;
  scrollbar-width: none; /* Firefox */
  padding: 10px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.sidebar-content::-webkit-scrollbar {
  display: none; /* Chrome, Safari */
}

.scroll-arrow {
  filter: invert(1);
}

.scroll-arrow:hover {
  opacity: 0.7;
}

.up-arrow {
  transform: rotate(180deg);
  border-radius: 20px 20px 0 0;
}

.down-arrow {
  border-radius: 0 0 20px 20px;
}
.sidebar-btn {
  border-radius: 25px 0 0 25px;
  border: none;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-top: 30px;
  position: relative;
  left: 10px;
  transition: left .3s ease, background .3s ease;
}
.sidebar-btn > div {
  transition: filter 0.3s ease;
  filter: none; /* Por defecto normal */
}

.sidebar-btn.collapsed > div {
  filter: brightness(0) invert(1) !important;
}

/* Botones inactivos/colapsados */
.sidebar-btn.collapsed {
  transform: translateX(-20%);
  background: transparent;
}

.notification-dot {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 10px;
  height: 10px;
  background-color: var(--rojoNormal);
  border-radius: 50%;
}
.left-side {
  display: flex;
  align-items: stretch;
  height: calc(100vh - 112px);
  flex-shrink: 0;
}
.formulario {
  position: relative;
  background: radial-gradient(circle at 0% 0%,
      var(--blueBerry) 0%,
      transparent 40%),
    radial-gradient(circle at 70% 20%, var(--blueBerry) 0%, transparent 40%),
    radial-gradient(circle at 80% 20%, var(--blueBerry) 0%, transparent 40%),
    radial-gradient(circle at 40% 30%, var(--blueBerry) 0%, transparent 40%),
    radial-gradient(circle at 80% 40%, var(--blueBerry) 0%, transparent 40%),
    radial-gradient(circle at 80% 50%, var(--blueBerry) 0%, transparent 40%),
    radial-gradient(circle at 80% 95%, white 0%, transparent 40%),
    linear-gradient(135deg, var(--blueBerry));
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--bs-gray-200);
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: fit-content;
  max-width: 600px;
  opacity: 1;
  transform: scaleX(1);
  transform-origin: left;
  transition: 
    max-width 0.6s cubic-bezier(0.19, 1, 0.22, 1),
    opacity 0.4s cubic-bezier(0.19, 1, 0.22, 1),
    transform 0.5s cubic-bezier(0.19, 1, 0.22, 1),
    padding 0.5s cubic-bezier(0.19, 1, 0.22, 1),
    filter 0.4s ease;

  overflow: visible;
  height: 100%;
  padding-left: 18px;
  z-index: 9;
  border-radius: 30px;
  flex-shrink: 0;
}

.formulario.collapsed {
  max-width: 0;
  opacity: 0;
  transform: scaleX(0.9);
  padding-left: 0;
  margin-left: 0 !important;
  background: transparent;
  backdrop-filter: none;
  border: none;
  box-shadow: none;
  overflow: hidden;
  filter: blur(4px);
}

.formulario-content {
  margin-right: 2rem;
  display: flex;
  flex-direction: column;
  gap: 18px;
  height: 100%;
  min-width: 250px;
  position: relative;
  z-index: 30;
  transition: 
    opacity 0.4s cubic-bezier(0.19, 1, 0.22, 1), 
    transform 0.5s cubic-bezier(0.19, 1, 0.22, 1),
    filter 0.3s ease;
  opacity: 1;
  transform: translateX(0);
  white-space: nowrap; 
  height: 100%;
  overflow-y: scroll;
  scrollbar-width: none;
}

.formulario.collapsed .formulario-content {
  opacity: 0;
  transform: translateX(-30px);
  pointer-events: none; 
}

.loaderSVG-contend:hover {
    fill: var(--bs-gray-900);
    cursor: pointer;
}

</style>