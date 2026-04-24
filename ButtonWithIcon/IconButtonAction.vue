<template>
  <div 
    class="btn-action-view" 
    :class="extraClass"
    :title="title"
    @click.stop="handleClick"
  >
    <DynamicSvgLoader 
      class="flex-shrink-0" 
      :fileName="iconName"
      :width_icon="iconWidth"
      :height_icon="iconHeight"
    />   
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import DynamicSvgLoader from '@/components/LoaderSVG/LoaderSVG.vue';

export default defineComponent({
  name: 'IconButtonAction',
  components: {
    DynamicSvgLoader
  },
  props: {
    iconName: {
      type: String,
      required: true
    },
    title: {
      type: String,
      default: ''
    },
    iconWidth: {
      type: String,
      default: '13px'
    },
    iconHeight: {
      type: String,
      default: '13px'
    },
    extraClass: {
      type: String,
      default: ''
    }
  },
  emits: ['click'],
  setup(props, { emit }) {
    const handleClick = () => {
      emit('click');
    };

    return {
      handleClick
    };
  }
});
</script>

<style scoped>
.btn-action-view {
    background: transparent;
    border: none;
    padding: 0;
    width: 26px;
    height: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    color: var(--bs-tertiary-color); 
    opacity: 0.9;
    background: var(--babyBlue_7); 
}

.btn-action-view:hover { 
    background: var(--blanco); 
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    opacity: 1;
    color: var(--purple-sb); /* Color de marca para acciones */
}

/* Centrado forzado para DynamicSvgLoader en botones */
.btn-action-view :deep(.loaderSVG-contend) {
    padding: 0 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    background: transparent !important;
    fill: currentColor !important;
    transition: fill 0.25s ease;
}

.btn-action-view:hover :deep(.loaderSVG-contend) { fill: var(--purple-sb) !important; }
.btn-action-view :deep(svg) { display: block; }
</style>
