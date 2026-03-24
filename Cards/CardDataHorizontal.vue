<template>
  <div class="horizontal-dashboard-wrapper" :class="customClass">
    <!-- Botón Anterior -->
    <button 
      v-if="canScrollLeft" 
      class="nav-btn prev" 
      @click="scroll('left')" 
      aria-label="Anterior"
    >
      <DynamicSvgLoader 
        fileName="icons/D_FLECHA_I" 
        width_icon="16px"
        height_icon="16px"
      />
    </button>
    
    <!-- Contenedor de Scroll -->
    <div class="dash-scroll-container" ref="scrollContainer">
      <div 
        v-for="(item, index) in data" 
        :key="index" 
        class="data-card shadow-sm"
        :style="{ 
          flex: fillSpace ? '1 0 0px' : '0 0 auto',
          minWidth: itemWidth,
          maxWidth: maxItemWidth
        }"
      >
        <div class="card-inner">
          <div class="label-container">
            <span class="card-label text-uppercase">{{ item.label }}</span>
          </div>
          <div class="value-container">
            <span class="card-value">{{ item.value }}</span>
          </div>
        </div>
        <div 
          v-if="item.color" 
          class="card-accent" 
          :style="{ backgroundColor: item.color }"
        ></div>
      </div>
    </div>

    <!-- Botón Siguiente -->
    <button 
      v-if="canScrollRight" 
      class="nav-btn next" 
      @click="scroll('right')" 
      aria-label="Siguiente"
    >
      <DynamicSvgLoader 
        fileName="icons/D_FLECHA_D" 
        width_icon="16px"
        height_icon="16px"
      />
    </button>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted, onUnmounted, watch } from "vue";
import DynamicSvgLoader from '@/components/LoaderSVG/LoaderSVG.vue';

export default defineComponent({
  name: 'CardDataHorizontal',
  components: { DynamicSvgLoader },
  props: {
    data: {
      type: Array,
      default: () => []
    },
    itemWidth: {
      type: String,
      default: '140px'
    },
    maxItemWidth: {
      type: String,
      default: '300px'
    },
    fillSpace: {
      type: Boolean,
      default: true
    },
    scrollAmount: {
      type: Number,
      default: 200
    },
    customClass: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const scrollContainer = ref(null);
    const canScrollLeft = ref(false);
    const canScrollRight = ref(false);
    let resizeObserver = null;

    const checkScrollState = () => {
      if (!scrollContainer.value) return;
      
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainer.value;
      const threshold = 10;
      
      canScrollLeft.value = scrollLeft > threshold;
      canScrollRight.value = (scrollWidth - clientWidth) > (scrollLeft + threshold);
    };

    const scroll = (direction) => {
      if (!scrollContainer.value) return;
      scrollContainer.value.scrollBy({
        left: direction === 'left' ? -props.scrollAmount : props.scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(checkScrollState, 300);
    };

    onMounted(() => {
      if (scrollContainer.value) {
        resizeObserver = new ResizeObserver(() => {
          checkScrollState();
        });
        resizeObserver.observe(scrollContainer.value);
        
        scrollContainer.value.addEventListener('scroll', checkScrollState);
        window.addEventListener('resize', checkScrollState);
        
        // Verificaciones en serie para asegurar el layout
        [100, 500, 1500].forEach(delay => setTimeout(checkScrollState, delay));
      }
    });

    onUnmounted(() => {
      if (resizeObserver) resizeObserver.disconnect();
      if (scrollContainer.value) {
        scrollContainer.value.removeEventListener('scroll', checkScrollState);
      }
      window.removeEventListener('resize', checkScrollState);
    });

    watch(() => props.data, () => {
      setTimeout(checkScrollState, 100);
    }, { deep: true });

    return {
      scrollContainer,
      canScrollLeft,
      canScrollRight,
      scroll
    };
  }
});
</script>

<style scoped>
.horizontal-dashboard-wrapper {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
}

.dash-scroll-container {
  display: flex;
  gap: 0.75rem;
  padding: 0.5rem 1.25rem;
  width: 100%;
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}

.dash-scroll-container::-webkit-scrollbar {
  display: none;
}

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--blanco);
  border: 1px solid var(--gris);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  --icon_color: var(--purple-sb);
}

.nav-btn:hover {
  background: var(--purple-sb);
  border-color: var(--purple-sb);
  --icon_color: white;
}

.nav-btn.prev { left: 0; }
.nav-btn.next { right: 0; }

/* Remover padding interno del loader */
.nav-btn :deep(.loaderSVG-contend) {
  padding: 0 !important;
  display: flex;
  align-items: center;
  justify-content: center;
}

.data-card {
  background: var(--blanco);
  border-radius: 12px;
  padding: 0.75rem 0.5rem;
  position: relative;
  overflow: hidden;
  border: 1px solid var(--gris);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 70px;
}

.data-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0,0,0,0.06) !important;
}

.card-inner {
  position: relative;
  z-index: 2;
}

.card-label {
  display: block;
  font-size: 0.6rem;
  font-weight: 700;
  color: var(--blueBerry);
  letter-spacing: 0.08em;
  margin-bottom: 0.15rem;
}

.card-value {
  display: block;
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--black);
  line-height: 1.1;
}

.card-accent {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 4px;
}

@media (max-width: 768px) {
  .dash-scroll-container {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    overflow-x: hidden;
  }
  .data-card {
    min-width: 0 !important;
    max-width: none !important;
  }
}
</style>
